import { getCaseById, getCaseMessages, jurorsForCase } from "@/lib/cases";
import { prisma } from "@/lib/db";
import { JURORS, getJuror, type Juror } from "@/lib/jurors";
import { getLawyer } from "@/lib/lawyers";
import { streamText } from "@/lib/anthropic";
import {
  absenteeDefenderPrompt,
  judgeOpeningPrompt,
  jurorDeliberationPrompt,
  jurorVotePrompt,
  lawyerOpeningPrompt,
  verdictSynthesisPrompt,
} from "@/lib/prompts";
import type {
  CasePayload,
  DeliberationMessage,
  SpeakerType,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Event =
  | { type: "start"; speaker: { type: SpeakerType; id: string; name: string }; messageId: string }
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
        const existing = (await getCaseMessages(id)) as DeliberationMessage[];
        const messages = existing.map((m) => ({ ...m })) as DeliberationMessage[];
        let order =
          messages.length > 0 ? Math.max(...messages.map((m) => m.order)) + 1 : 0;

        const picked = jurorsForCase(caseData.jurorIds, JURORS);
        const jury = picked.length > 0 ? picked : JURORS.slice(0, 5);

        async function runStep({
          speakerType,
          speakerId,
          speakerName,
          system,
          user,
        }: {
          speakerType: SpeakerType;
          speakerId: string;
          speakerName: string;
          system: string;
          user: string;
        }): Promise<string> {
          const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          send({
            type: "start",
            speaker: { type: speakerType, id: speakerId, name: speakerName },
            messageId: tempId,
          });
          const content = await streamText(apiKey!, system, user, {
            onDelta: (t) => send({ type: "delta", messageId: tempId, text: t }),
          });
          const saved = await prisma.message.create({
            data: {
              caseId: id,
              speakerType,
              speakerId,
              speakerName,
              content: content.trim(),
              order: order++,
            },
          });
          messages.push({
            id: saved.id,
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

        // 1) judge opening
        if (messages.length === 0) {
          await runStep({
            speakerType: "judge",
            speakerId: "judge-marlowe",
            speakerName: "Judge Marlowe",
            system: judgeOpeningPrompt(caseData),
            user: "Open the court session now.",
          });
        }

        // 2) lawyer openings (if any). skip if already done
        const alreadyHasLawyerOpening = (lid: string) =>
          messages.some(
            (m) => m.speakerType === "lawyer" && m.speakerId === lid,
          );

        if (caseData.plaintiffLawyer) {
          const lawyer = getLawyer(caseData.plaintiffLawyer);
          if (lawyer && !alreadyHasLawyerOpening(`${lawyer.id}:plaintiff`)) {
            await runStep({
              speakerType: "lawyer",
              speakerId: `${lawyer.id}:plaintiff`,
              speakerName: `${lawyer.name} (plaintiff)`,
              system: lawyerOpeningPrompt(caseData, lawyer, "plaintiff"),
              user: "Deliver your opening statement.",
            });
          }
        }

        if (caseData.absentDefendant && caseData.isSolo) {
          // devil's advocate statement
          if (
            !messages.some(
              (m) =>
                m.speakerType === "lawyer" &&
                m.speakerId === "devils-advocate",
            )
          ) {
            await runStep({
              speakerType: "lawyer",
              speakerId: "devils-advocate",
              speakerName: "Devil's Advocate",
              system: absenteeDefenderPrompt(caseData),
              user: "Deliver a brief steelman of the absent defendant's position.",
            });
          }
        } else if (caseData.defendantLawyer) {
          const lawyer = getLawyer(caseData.defendantLawyer);
          if (lawyer && !alreadyHasLawyerOpening(`${lawyer.id}:defendant`)) {
            await runStep({
              speakerType: "lawyer",
              speakerId: `${lawyer.id}:defendant`,
              speakerName: `${lawyer.name} (defendant)`,
              system: lawyerOpeningPrompt(caseData, lawyer, "defendant"),
              user: "Deliver your opening statement.",
            });
          }
        }

        // 3) jury deliberation — 8 to 12 turns, weighted to hit each juror at least once
        const TARGET_TURNS = Math.min(
          12,
          Math.max(8, jury.length * 2),
        );
        const turnOrder = buildTurnOrder(jury, TARGET_TURNS);

        const deliberationAlready = messages.filter(
          (m) => m.speakerType === "juror",
        ).length;

        for (let i = deliberationAlready; i < turnOrder.length; i += 1) {
          const juror = turnOrder[i];
          await runStep({
            speakerType: "juror",
            speakerId: juror.id,
            speakerName: juror.name,
            system: jurorDeliberationPrompt(caseData, juror, messages),
            user: "Your turn to weigh in.",
          });
        }

        // 4) votes — one per jury member
        const votesPrior = await prisma.vote.findMany({
          where: { verdict: { caseId: id } },
        });
        const haveVoteFor = (jurorId: string) =>
          votesPrior.some((v) => v.jurorId === jurorId);

        const verdictVotes: Array<{
          jurorId: string;
          jurorName: string;
          ruling: "plaintiff" | "defendant";
          reasoning: string;
        }> = [];

        for (const juror of jury) {
          if (haveVoteFor(juror.id)) continue;
          const tempId = `vote-${juror.id}`;
          send({
            type: "start",
            speaker: { type: "juror", id: juror.id, name: `${juror.name} — verdict` },
            messageId: tempId,
          });
          const content = await streamText(apiKey!, jurorVotePrompt(caseData, juror, messages), "Cast your vote.", {
            onDelta: (t) => send({ type: "delta", messageId: tempId, text: t }),
          });
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

        // 5) synthesis
        const synthesis = await streamTextIntoBuffer(
          apiKey!,
          verdictSynthesisPrompt(caseData, messages, verdictVotes),
          "Deliver the court's synthesized verdict.",
          (t) => send({ type: "delta", messageId: "verdict-synth", text: t }),
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

        // persist verdict + votes
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
        await prisma.case.update({
          where: { id },
          data: { status: "verdict" },
        });

        send({ type: "verdict", ruling, summary: synthesis.trim(), topQuote });
        send({ type: "done" });
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

async function streamTextIntoBuffer(
  apiKey: string,
  system: string,
  user: string,
  onDelta: (t: string) => void,
): Promise<string> {
  return streamText(apiKey, system, user, { onDelta });
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
  const plaintiff = upper.indexOf("FOR THE PLAINTIFF");
  const defendant = upper.indexOf("FOR THE DEFENDANT");
  const ruling =
    (plaintiff >= 0 && (defendant < 0 || plaintiff < defendant)) ? "plaintiff" : "defendant";
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  // first line is the ruling, remaining lines are reasoning
  const reasoning = lines.slice(1).join(" ").trim() || lines[0] || "";
  return { ruling, reasoning };
}

function findTopQuote(messages: DeliberationMessage[]): string | null {
  // pick the juror message with the best quote feel — longest within a range.
  const jurorMsgs = messages.filter((m) => m.speakerType === "juror");
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

// silence unused local warnings in some build configurations
void (null as unknown as CasePayload);
