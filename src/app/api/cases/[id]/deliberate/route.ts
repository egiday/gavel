import { getCaseById, getCaseMessages, jurorsForCase } from "@/lib/cases";
import { prisma } from "@/lib/db";
import { JURORS, type Juror } from "@/lib/jurors";
import { getLawyer, type Lawyer } from "@/lib/lawyers";
import { streamText } from "@/lib/anthropic";
import {
  absenteeOpeningPrompt,
  judgeOpeningPrompt,
  judgeTransitionPrompt,
  jurorDeliberationPrompt,
  jurorVotePrompt,
  openingStatementPrompt,
  trialArgumentPrompt,
  verdictSynthesisPrompt,
} from "@/lib/prompts";
import type {
  DeliberationMessage,
  SpeakerType,
  TrialPhase,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Event =
  | {
      type: "phase";
      phase: TrialPhase;
      label: string;
    }
  | {
      type: "start";
      speaker: { type: SpeakerType; id: string; name: string };
      phase: TrialPhase;
      messageId: string;
    }
  | { type: "delta"; messageId: string; text: string }
  | { type: "end"; messageId: string; content: string }
  | {
      type: "vote";
      jurorId: string;
      jurorName: string;
      ruling: "plaintiff" | "defendant";
      reasoning: string;
    }
  | {
      type: "verdict";
      ruling: "plaintiff" | "defendant" | "split";
      summary: string;
      topQuote: string | null;
    }
  | { type: "done" }
  | { type: "error"; message: string };

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const apiKey = req.headers.get("x-anthropic-key")?.trim();
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "missing anthropic key" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const caseData = await getCaseById(id);
  if (!caseData) {
    return new Response(JSON.stringify({ error: "case not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(ev: Event) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));
      }

      try {
        const existingRows = await getCaseMessages(id);
        const messages: DeliberationMessage[] = existingRows.map((r) => ({
          id: r.id,
          phase: (r.phase as TrialPhase) ?? "trial",
          speakerType: r.speakerType as SpeakerType,
          speakerId: r.speakerId,
          speakerName: r.speakerName,
          content: r.content,
          order: r.order,
          createdAt: r.createdAt.toISOString(),
        }));
        let order =
          messages.length > 0 ? Math.max(...messages.map((m) => m.order)) + 1 : 0;

        const picked = jurorsForCase(caseData.jurorIds, JURORS);
        const jury = picked.length > 0 ? picked : JURORS.slice(0, 5);

        async function runStep({
          phase,
          speakerType,
          speakerId,
          speakerName,
          system,
          user,
          maxTokens = 300,
        }: {
          phase: TrialPhase;
          speakerType: SpeakerType;
          speakerId: string;
          speakerName: string;
          system: string;
          user: string;
          maxTokens?: number;
        }): Promise<string> {
          const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          send({
            type: "start",
            speaker: { type: speakerType, id: speakerId, name: speakerName },
            phase,
            messageId: tempId,
          });
          const content = await streamText(
            apiKey!,
            system,
            user,
            {
              onDelta: (t) => send({ type: "delta", messageId: tempId, text: t }),
            },
            maxTokens,
          );
          const saved = await prisma.message.create({
            data: {
              caseId: id,
              phase,
              speakerType,
              speakerId,
              speakerName,
              content: content.trim(),
              order: order++,
            },
          });
          messages.push({
            id: saved.id,
            phase,
            speakerType,
            speakerId,
            speakerName,
            content: saved.content,
            order: saved.order,
            createdAt: saved.createdAt.toISOString(),
          });
          send({ type: "end", messageId: tempId, content: saved.content });
          return saved.content;
        }

        // phase helpers
        const hasTrial = messages.some((m) => m.phase === "trial");
        const hasDeliberation = messages.some((m) => m.phase === "deliberation");

        // ============== TRIAL PHASE ==============
        if (!hasDeliberation) {
          send({ type: "phase", phase: "trial", label: "Trial" });

          // 1) judge opens court
          if (!messages.some((m) => m.speakerType === "judge" && m.phase === "trial")) {
            await runStep({
              phase: "trial",
              speakerType: "judge",
              speakerId: "judge-marlowe",
              speakerName: "Judge Marlowe",
              system: judgeOpeningPrompt(caseData),
              user: "Call court to order and frame the matter.",
              maxTokens: 220,
            });
          }

          // helper to build a "speaker" for either counsel or self-rep
          function speakerFor(side: "plaintiff" | "defendant"): {
            speakerType: SpeakerType;
            speakerId: string;
            speakerName: string;
            speakerBrief: {
              kind: "lawyer" | "self";
              lawyer?: Lawyer;
              partyName: string;
              partyStory: string;
            };
          } | null {
            const story =
              side === "plaintiff" ? caseData!.plaintiffSide : caseData!.defendantSide ?? "";
            const partyName =
              side === "plaintiff"
                ? caseData!.plaintiffName || "Plaintiff"
                : caseData!.defendantName || "Defendant";
            const lawyerId =
              side === "plaintiff"
                ? caseData!.plaintiffLawyer
                : caseData!.defendantLawyer;

            if (side === "defendant" && caseData!.absentDefendant) return null;

            if (lawyerId && lawyerId !== "self") {
              const lawyer = getLawyer(lawyerId);
              if (!lawyer) return null;
              return {
                speakerType: "lawyer",
                speakerId: `${lawyer.id}:${side}`,
                speakerName: `${lawyer.name} · for ${side === "plaintiff" ? "the plaintiff" : "the defense"}`,
                speakerBrief: {
                  kind: "lawyer",
                  lawyer,
                  partyName,
                  partyStory: story,
                },
              };
            }
            // self-defense
            return {
              speakerType: side,
              speakerId: `${side}:self`,
              speakerName: partyName,
              speakerBrief: {
                kind: "self",
                partyName,
                partyStory: story,
              },
            };
          }

          const plaintiffSpeaker = speakerFor("plaintiff")!;
          const defendantSpeaker = speakerFor("defendant");

          function alreadyDeliveredOpening(speakerId: string): boolean {
            return messages.some(
              (m) =>
                m.phase === "trial" &&
                m.speakerId === speakerId &&
                m.speakerType !== "judge",
            );
          }

          // 2) plaintiff opening
          if (!alreadyDeliveredOpening(plaintiffSpeaker.speakerId)) {
            await runStep({
              phase: "trial",
              speakerType: plaintiffSpeaker.speakerType,
              speakerId: plaintiffSpeaker.speakerId,
              speakerName: plaintiffSpeaker.speakerName,
              system: openingStatementPrompt(caseData, "plaintiff", plaintiffSpeaker.speakerBrief),
              user: "Deliver your opening statement.",
              maxTokens: 260,
            });
          }

          // 3) defendant opening (or devil's advocate)
          if (defendantSpeaker) {
            if (!alreadyDeliveredOpening(defendantSpeaker.speakerId)) {
              await runStep({
                phase: "trial",
                speakerType: defendantSpeaker.speakerType,
                speakerId: defendantSpeaker.speakerId,
                speakerName: defendantSpeaker.speakerName,
                system: openingStatementPrompt(caseData, "defendant", defendantSpeaker.speakerBrief),
                user: "Deliver your opening statement.",
                maxTokens: 260,
              });
            }
          } else if (caseData.absentDefendant) {
            const daId = "devils-advocate:defendant";
            if (!alreadyDeliveredOpening(daId)) {
              await runStep({
                phase: "trial",
                speakerType: "lawyer",
                speakerId: daId,
                speakerName: "Devil's Advocate · for the defense",
                system: absenteeOpeningPrompt(caseData),
                user: "Steelman the absent defendant's position.",
                maxTokens: 220,
              });
            }
          }

          // 4) argument rounds — two exchanges of rebut + press, then closings
          // rounds: [defendant rebut, plaintiff press, defendant press, plaintiff rebut]
          type Round = {
            side: "plaintiff" | "defendant";
            role: "rebut" | "press";
          };
          const rounds: Round[] = [
            { side: "defendant", role: "rebut" },
            { side: "plaintiff", role: "press" },
            { side: "defendant", role: "press" },
            { side: "plaintiff", role: "rebut" },
          ];

          for (const r of rounds) {
            const sp = speakerFor(r.side);
            if (!sp) continue; // absent defendant already got a devil's advocate opening
            const marker = `${sp.speakerId}::${r.role}`;
            const already = messages.some(
              (m) =>
                m.phase === "trial" &&
                m.speakerId === sp.speakerId &&
                m.content.includes(""),
            );
            // use a stronger duplicate guard: count trial messages per speaker
            const countForSpeaker = messages.filter(
              (m) => m.phase === "trial" && m.speakerId === sp.speakerId,
            ).length;
            const desiredCount =
              rounds
                .slice(0, rounds.indexOf(r) + 1)
                .filter((rr) => speakerFor(rr.side)?.speakerId === sp.speakerId)
                .length + 1; // +1 for the opening
            if (countForSpeaker >= desiredCount) continue;
            void already; // silence lint on unused
            void marker;

            await runStep({
              phase: "trial",
              speakerType: sp.speakerType,
              speakerId: sp.speakerId,
              speakerName: sp.speakerName,
              system: trialArgumentPrompt(
                caseData,
                r.side,
                sp.speakerBrief,
                messages,
                r.role,
              ),
              user: r.role === "rebut" ? "Rebut what opposing counsel just said." : "Press your case.",
              maxTokens: 240,
            });
          }

          // 5) closings (one per side)
          for (const side of ["plaintiff", "defendant"] as const) {
            const sp = speakerFor(side);
            if (!sp) continue;
            const countForSpeaker = messages.filter(
              (m) => m.phase === "trial" && m.speakerId === sp.speakerId,
            ).length;
            const expectedMax = side === "plaintiff" ? 4 : 4; // opening + 2 rounds + closing
            if (countForSpeaker >= expectedMax) continue;
            await runStep({
              phase: "trial",
              speakerType: sp.speakerType,
              speakerId: sp.speakerId,
              speakerName: `${sp.speakerName} · closing`,
              system: trialArgumentPrompt(
                caseData,
                side,
                sp.speakerBrief,
                messages,
                "close",
              ),
              user: "Deliver your closing statement.",
              maxTokens: 260,
            });
          }

          // 6) judge transitions to deliberation
          const transitionDone = messages.some(
            (m) => m.phase === "trial" && m.speakerId === "judge-marlowe:transition",
          );
          if (!transitionDone) {
            await runStep({
              phase: "trial",
              speakerType: "judge",
              speakerId: "judge-marlowe:transition",
              speakerName: "Judge Marlowe",
              system: judgeTransitionPrompt(caseData),
              user: "Close the trial and send the jury to deliberate.",
              maxTokens: 160,
            });
          }
        }

        // ============== DELIBERATION PHASE ==============
        send({ type: "phase", phase: "deliberation", label: "Deliberation" });

        const TARGET_TURNS = Math.min(12, Math.max(8, jury.length * 2));
        const turnOrder = buildTurnOrder(jury, TARGET_TURNS);
        const jurorMsgCount = messages.filter(
          (m) => m.phase === "deliberation" && m.speakerType === "juror",
        ).length;

        for (let i = jurorMsgCount; i < turnOrder.length; i += 1) {
          const juror = turnOrder[i];
          await runStep({
            phase: "deliberation",
            speakerType: "juror",
            speakerId: juror.id,
            speakerName: juror.name,
            system: jurorDeliberationPrompt(caseData, juror, messages),
            user: "Your turn in the jury room.",
            maxTokens: 180,
          });
        }

        // ============== VOTES ==============
        const existingVotes = await prisma.vote.findMany({
          where: { verdict: { caseId: id } },
        });
        const have = (jurorId: string) => existingVotes.some((v) => v.jurorId === jurorId);

        const verdictVotes: Array<{
          jurorId: string;
          jurorName: string;
          ruling: "plaintiff" | "defendant";
          reasoning: string;
        }> = [];

        for (const juror of jury) {
          if (have(juror.id)) continue;
          const tempId = `vote-${juror.id}`;
          send({
            type: "start",
            speaker: { type: "juror", id: juror.id, name: `${juror.name} — verdict` },
            phase: "verdict",
            messageId: tempId,
          });
          const content = await streamText(
            apiKey!,
            jurorVotePrompt(caseData, juror, messages),
            "Cast your vote.",
            { onDelta: (t) => send({ type: "delta", messageId: tempId, text: t }) },
            120,
          );
          send({ type: "end", messageId: tempId, content });
          const { ruling, reasoning } = parseVote(content);
          verdictVotes.push({
            jurorId: juror.id,
            jurorName: juror.name,
            ruling,
            reasoning,
          });
          send({ type: "vote", jurorId: juror.id, jurorName: juror.name, ruling, reasoning });
        }

        // ============== SYNTHESIS ==============
        const synthesis = await streamText(
          apiKey!,
          verdictSynthesisPrompt(caseData, messages, verdictVotes),
          "Deliver the synthesized verdict.",
          { onDelta: (t) => send({ type: "delta", messageId: "verdict-synth", text: t }) },
          260,
        );

        const tally = verdictVotes.reduce(
          (acc, v) => ({ ...acc, [v.ruling]: acc[v.ruling] + 1 }),
          { plaintiff: 0, defendant: 0 },
        );
        const ruling: "plaintiff" | "defendant" | "split" =
          tally.plaintiff > tally.defendant
            ? "plaintiff"
            : tally.defendant > tally.plaintiff
              ? "defendant"
              : "split";
        const topQuote = findTopQuote(messages);

        const verdictRow = await prisma.verdict.upsert({
          where: { caseId: id },
          create: {
            caseId: id,
            ruling,
            summary: synthesis.trim(),
            topQuote,
          },
          update: { ruling, summary: synthesis.trim(), topQuote },
        });
        for (const v of verdictVotes) {
          await prisma.vote.create({
            data: {
              verdictId: verdictRow.id,
              jurorId: v.jurorId,
              jurorName: v.jurorName,
              ruling: v.ruling,
              reasoning: v.reasoning,
            },
          });
        }
        await prisma.case.update({ where: { id }, data: { status: "verdict" } });

        send({ type: "verdict", ruling, summary: synthesis.trim(), topQuote });
        send({ type: "done" });

        void hasTrial; // silence unused
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "unexpected error";
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}

function buildTurnOrder(jury: Juror[], totalTurns: number): Juror[] {
  const order: Juror[] = [];
  const pool = [...jury];
  shuffle(pool);
  for (const j of pool) order.push(j);
  while (order.length < totalTurns) {
    const idx = Math.floor(Math.random() * jury.length);
    order.push(jury[idx]);
  }
  return order.slice(0, totalTurns);
}

function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function parseVote(content: string): {
  ruling: "plaintiff" | "defendant";
  reasoning: string;
} {
  const upper = content.toUpperCase();
  const p = upper.indexOf("FOR THE PLAINTIFF");
  const d = upper.indexOf("FOR THE DEFENDANT");
  const ruling =
    (p >= 0 && (d < 0 || p < d)) ? "plaintiff" : "defendant";
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const reasoning = lines.slice(1).join(" ").trim() || lines[0] || "";
  return { ruling, reasoning };
}

function findTopQuote(messages: DeliberationMessage[]): string | null {
  const jurorMsgs = messages.filter(
    (m) => m.phase === "deliberation" && m.speakerType === "juror",
  );
  if (jurorMsgs.length === 0) return null;
  const ranked = jurorMsgs
    .map((m) => ({ m, score: scoreQuote(m.content) }))
    .sort((a, b) => b.score - a.score);
  const top = ranked[0];
  if (!top) return null;
  return `"${top.m.content.trim()}" — ${top.m.speakerName}`;
}

function scoreQuote(text: string): number {
  const len = text.length;
  if (len < 30 || len > 220) return 0;
  let bonus = 0;
  if (/[—–]/.test(text)) bonus += 5;
  if (/[!?]/.test(text)) bonus += 2;
  return len + bonus;
}
