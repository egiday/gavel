// system prompt builders for the judge, jurors, lawyers, and verdict synthesis

import type { Juror } from "./jurors";
import type { Lawyer } from "./lawyers";
import type { CasePayload, DeliberationMessage, Mode } from "./types";

const MODE_TONES: Record<Mode, string> = {
  petty:
    "This is PETTY court. Lean into personality. Roast, joke, drop slang. Don't be afraid to be dramatic. Petty doesn't mean cruel — it means loud, opinionated, alive.",
  real:
    "This is REAL court. Handle the dispute with weight. Be measured, thoughtful, fair. Ask clarifying questions in character. Don't downplay, but don't dramatize either.",
};

function caseContext(c: CasePayload): string {
  const plaintiffName = c.plaintiffName || "Plaintiff";
  const defendantName = c.defendantName || (c.absentDefendant ? "Defendant (absent)" : "Defendant");
  return [
    `CASE TITLE: ${c.title}`,
    `MODE: ${c.mode}`,
    `PLAINTIFF (${plaintiffName}) SAID:\n"""${c.plaintiffSide}"""`,
    c.defendantSide
      ? `DEFENDANT (${defendantName}) SAID:\n"""${c.defendantSide}"""`
      : c.absentDefendant
        ? `DEFENDANT IS ABSENT — an AI devil's advocate will cover their position.`
        : `DEFENDANT has not yet filed a response.`,
  ].join("\n\n");
}

function recentExchange(messages: DeliberationMessage[], take = 6): string {
  const last = messages.slice(-take);
  if (last.length === 0) return "(no prior discussion — you're first)";
  return last
    .map((m) => `[${m.speakerName}] ${m.content}`)
    .join("\n");
}

export function judgeOpeningPrompt(c: CasePayload): string {
  return [
    MODE_TONES[c.mode],
    "You are JUDGE MARLOWE, presiding. Retired federal judge. Formal, dry. You open court and frame the matter at hand.",
    caseContext(c),
    `TASK: Open court. Call the session to order. Restate the dispute in one or two sentences. Direct the lawyers (if any) to deliver opening statements, or the jury to begin deliberation. Keep it under 60 words.`,
    "Respond as the judge speaking in court, in character. No stage directions. No quote marks around your line.",
  ].join("\n\n");
}

export function lawyerOpeningPrompt(
  c: CasePayload,
  lawyer: Lawyer,
  side: "plaintiff" | "defendant",
): string {
  const sideStory =
    side === "plaintiff"
      ? c.plaintiffSide
      : c.defendantSide ?? "Client's position has not been formally submitted.";
  const sideName =
    side === "plaintiff"
      ? c.plaintiffName || "the plaintiff"
      : c.defendantName || "the defendant";
  return [
    MODE_TONES[c.mode],
    `You are ${lawyer.name}, opposing counsel for ${sideName}.`,
    `PERSONA: ${lawyer.persona}`,
    `VOICE STYLE: ${lawyer.voiceStyle}`,
    caseContext(c),
    `YOUR CLIENT'S POSITION:\n"""${sideStory}"""`,
    `TASK: Deliver a punchy opening statement for your client. Don't enumerate — persuade. Land 2–4 sentences max. Stay in character.`,
  ].join("\n\n");
}

export function absenteeDefenderPrompt(c: CasePayload): string {
  return [
    MODE_TONES[c.mode],
    "You are a DEVIL'S ADVOCATE briefly standing in for the absent defendant. Steelman the most reasonable version of their position without pretending to be them. Acknowledge uncertainty. 2–3 sentences.",
    caseContext(c),
  ].join("\n\n");
}

export function jurorDeliberationPrompt(
  c: CasePayload,
  juror: Juror,
  messages: DeliberationMessage[],
): string {
  return [
    MODE_TONES[c.mode],
    `You are ${juror.name}, a juror.`,
    `PERSONA: ${juror.persona}`,
    `VOICE STYLE: ${juror.voiceStyle}`,
    caseContext(c),
    "RECENT DELIBERATION (most recent last):",
    recentExchange(messages),
    [
      "TASK: Respond in character with 1-3 sentences. Engage with what was just said — agree, disagree, push back, or add nuance.",
      "Stay in your voice style. Don't narrate actions. Don't break character.",
      "Do NOT vote yet — voting happens separately.",
      "Never start with your own name.",
    ].join(" "),
  ].join("\n\n");
}

export function jurorVotePrompt(
  c: CasePayload,
  juror: Juror,
  messages: DeliberationMessage[],
): string {
  return [
    MODE_TONES[c.mode],
    `You are ${juror.name}, casting your vote.`,
    `PERSONA: ${juror.persona}`,
    `VOICE STYLE: ${juror.voiceStyle}`,
    caseContext(c),
    "FULL DELIBERATION:",
    messages.map((m) => `[${m.speakerName}] ${m.content}`).join("\n"),
    [
      "TASK: Deliver your verdict.",
      "Start with exactly one of: FOR THE PLAINTIFF or FOR THE DEFENDANT (uppercase, no quotes).",
      "Then on a new line, one sentence of reasoning in your voice style. No more than 25 words.",
    ].join(" "),
  ].join("\n\n");
}

export function verdictSynthesisPrompt(
  c: CasePayload,
  messages: DeliberationMessage[],
  votes: Array<{ jurorName: string; ruling: "plaintiff" | "defendant"; reasoning: string }>,
): string {
  const tally = votes.reduce(
    (acc, v) => ({ ...acc, [v.ruling]: acc[v.ruling] + 1 }),
    { plaintiff: 0, defendant: 0 },
  );
  const winner: "plaintiff" | "defendant" | "split" =
    tally.plaintiff > tally.defendant
      ? "plaintiff"
      : tally.defendant > tally.plaintiff
        ? "defendant"
        : "split";

  return [
    MODE_TONES[c.mode],
    "You are JUDGE MARLOWE delivering the court's synthesized verdict.",
    caseContext(c),
    "JURY VOTES:",
    votes.map((v) => `- ${v.jurorName}: ${v.ruling.toUpperCase()} — ${v.reasoning}`).join("\n"),
    `VOTE TALLY: plaintiff ${tally.plaintiff}, defendant ${tally.defendant}. Winner: ${winner}.`,
    [
      "TASK: Write a short synthesized verdict.",
      "Line 1: THE COURT RULES: ... (one short, decisive sentence).",
      "Line 2-3: reasoning, in the judge's voice. 2-3 sentences.",
      c.mode === "real"
        ? "Line 4 (optional): One sentence suggesting a path forward."
        : "Line 4 (optional): One line of gavel-slamming closing.",
    ].join(" "),
  ].join("\n\n");
}

export const MODEL = "claude-sonnet-4-5-20250929";
