// prompts for the two phases: TRIAL (parties + counsel argue, jury watches silently)
// and DELIBERATION (jury alone, no parties, no counsel)

import type { Juror } from "./jurors";
import type { Lawyer } from "./lawyers";
import type { CasePayload, DeliberationMessage, Mode } from "./types";

const MODE_TONES: Record<Mode, string> = {
  petty:
    "This is PETTY court. Loud, dramatic, slightly ridiculous. Petty does not mean cruel — it means alive. Roasts, bars, hot takes. Jokes land. Emotions are real.",
  real:
    "This is REAL court. Measured, careful, firm. Treat the dispute with weight. Ask clarifying questions in character. Don't minimize, don't sensationalize.",
};

function caseHeader(c: CasePayload): string {
  const plaintiffName = c.plaintiffName || "Plaintiff";
  const defendantName =
    c.defendantName ||
    (c.absentDefendant ? "Defendant (absent, represented by devil's advocate)" : "Defendant");
  return [
    `CASE TITLE: ${c.title}`,
    `MODE: ${c.mode}`,
    `PLAINTIFF (${plaintiffName}) FILED:\n"""${c.plaintiffSide}"""`,
    c.defendantSide
      ? `DEFENDANT (${defendantName}) RESPONDED:\n"""${c.defendantSide}"""`
      : c.absentDefendant
        ? `DEFENDANT IS ABSENT. A devil's advocate stands in to steelman the strongest version of their position.`
        : `DEFENDANT has not yet filed.`,
  ].join("\n\n");
}

function recentTrial(messages: DeliberationMessage[], take = 8): string {
  const trial = messages.filter((m) => m.phase === "trial");
  const slice = trial.slice(-take);
  if (slice.length === 0) return "(none yet — you're opening the matter)";
  return slice.map((m) => `[${m.speakerName}] ${m.content}`).join("\n");
}

function recentDeliberation(messages: DeliberationMessage[], take = 6): string {
  const delib = messages.filter((m) => m.phase === "deliberation");
  const slice = delib.slice(-take);
  if (slice.length === 0) return "(you're the first to speak in the jury room)";
  return slice.map((m) => `[${m.speakerName}] ${m.content}`).join("\n");
}

function trialTranscript(messages: DeliberationMessage[]): string {
  const trial = messages.filter((m) => m.phase === "trial");
  if (trial.length === 0) return "(no trial transcript recorded)";
  return trial.map((m) => `[${m.speakerName}] ${m.content}`).join("\n");
}

// ---- TRIAL PHASE ----------------------------------------------------------

export function judgeOpeningPrompt(c: CasePayload): string {
  return [
    MODE_TONES[c.mode],
    "You are JUDGE MARLOWE, presiding. Retired federal judge. Formal, dry, measured. You call court to order and frame the dispute. You will then invite opening statements.",
    caseHeader(c),
    `TASK: Open court. State that the matter is ${JSON.stringify(c.title)}. Frame what's at stake in one or two sentences. Invite the plaintiff to open. The jury is present but will remain silent throughout trial. Keep it under 55 words. No stage directions.`,
  ].join("\n\n");
}

export function openingStatementPrompt(
  c: CasePayload,
  side: "plaintiff" | "defendant",
  speaker: {
    kind: "lawyer" | "self";
    lawyer?: Lawyer;
    partyName: string;
    partyStory: string;
  },
): string {
  const role = side === "plaintiff" ? "plaintiff" : "defendant";
  const voice =
    speaker.kind === "lawyer" && speaker.lawyer
      ? [
          `You are ${speaker.lawyer.name}, counsel for the ${role} (${speaker.partyName}).`,
          `PERSONA: ${speaker.lawyer.persona}`,
          `VOICE STYLE: ${speaker.lawyer.voiceStyle}`,
        ].join("\n")
      : [
          `You are ${speaker.partyName}, the ${role}, representing yourself.`,
          `You sound like a real person — not a lawyer. Plain speech, specific details, zero legalese.`,
        ].join("\n");
  return [
    MODE_TONES[c.mode],
    voice,
    caseHeader(c),
    `YOUR SIDE'S POSITION (use as grounding, don't quote verbatim):\n"""${speaker.partyStory}"""`,
    [
      "TASK: Deliver an opening statement for your side.",
      "2–4 sentences. Persuade, don't recite. No bullet points. No stage directions.",
      "End with one sharp line that sets the frame.",
    ].join(" "),
  ].join("\n\n");
}

export function absenteeOpeningPrompt(c: CasePayload): string {
  return [
    MODE_TONES[c.mode],
    "You are a DEVIL'S ADVOCATE standing in for the absent defendant. Steelman the most reasonable version of their position — acknowledging you're speculating. 2–3 sentences.",
    caseHeader(c),
  ].join("\n\n");
}

export function trialArgumentPrompt(
  c: CasePayload,
  side: "plaintiff" | "defendant",
  speaker: {
    kind: "lawyer" | "self";
    lawyer?: Lawyer;
    partyName: string;
    partyStory: string;
  },
  messages: DeliberationMessage[],
  role: "rebut" | "press" | "close",
): string {
  const sideLabel = side === "plaintiff" ? "plaintiff" : "defendant";
  const voice =
    speaker.kind === "lawyer" && speaker.lawyer
      ? [
          `You are ${speaker.lawyer.name}, counsel for the ${sideLabel} (${speaker.partyName}).`,
          `PERSONA: ${speaker.lawyer.persona}`,
          `VOICE STYLE: ${speaker.lawyer.voiceStyle}`,
        ].join("\n")
      : [
          `You are ${speaker.partyName}, the ${sideLabel}, representing yourself in court.`,
          "Speak plainly. You're a real person, not a lawyer. Specific details over rhetoric.",
        ].join("\n");

  const direction: Record<typeof role, string> = {
    rebut:
      "TASK: Respond to what opposing counsel just said. Pick the weakest point they made and hit it hard — one or two sentences. Then plant your own strongest counter in one sentence.",
    press:
      "TASK: Press your case. Introduce a fact or angle the other side hasn't addressed. Keep it to 2–3 sentences. Stay in character.",
    close:
      "TASK: Deliver your closing statement. Remind the jury of the single point they should remember. 2–3 sentences. Land the plane.",
  };

  return [
    MODE_TONES[c.mode],
    voice,
    caseHeader(c),
    `YOUR SIDE'S POSITION (grounding):\n"""${speaker.partyStory}"""`,
    "TRIAL TRANSCRIPT SO FAR (most recent at bottom):",
    recentTrial(messages, 10),
    direction[role],
    "Do not speak for anyone else. Do not issue a verdict. Do not address the jurors by name — they're observing silently.",
  ].join("\n\n");
}

export function judgeTransitionPrompt(c: CasePayload): string {
  return [
    MODE_TONES[c.mode],
    "You are JUDGE MARLOWE. Arguments have concluded. You dismiss the parties' counsel and send the jury to the deliberation room. One or two sentences. No stage directions.",
    caseHeader(c),
    "TASK: Close the trial and send the jury to deliberate. End with: 'The jury will now retire.'",
  ].join("\n\n");
}

// ---- DELIBERATION PHASE ---------------------------------------------------

export function jurorDeliberationPrompt(
  c: CasePayload,
  juror: Juror,
  messages: DeliberationMessage[],
): string {
  return [
    MODE_TONES[c.mode],
    `You are ${juror.name}, a juror in the private deliberation room.`,
    `PERSONA: ${juror.persona}`,
    `VOICE STYLE: ${juror.voiceStyle}`,
    "The trial is over. No lawyers or parties are in the room — just the jury.",
    caseHeader(c),
    "TRIAL TRANSCRIPT YOU JUST HEARD:",
    trialTranscript(messages),
    "RECENT DELIBERATION (most recent last):",
    recentDeliberation(messages, 6),
    [
      "TASK: Speak in character, 1–3 sentences. React to what your fellow juror just said — agree, push back, add nuance.",
      "Reference specific moments from the trial when it helps.",
      "Stay in your voice style. Do NOT vote yet. Do not address lawyers or parties. Don't narrate actions.",
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
    `You are ${juror.name}, casting your vote after deliberation.`,
    `PERSONA: ${juror.persona}`,
    `VOICE STYLE: ${juror.voiceStyle}`,
    caseHeader(c),
    "FULL TRIAL TRANSCRIPT:",
    trialTranscript(messages),
    "FULL DELIBERATION:",
    messages
      .filter((m) => m.phase === "deliberation")
      .map((m) => `[${m.speakerName}] ${m.content}`)
      .join("\n"),
    [
      "TASK: Cast your vote.",
      "Line 1: exactly one of FOR THE PLAINTIFF or FOR THE DEFENDANT (uppercase).",
      "Line 2: one sentence of reasoning in your voice style. No more than 25 words.",
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
    caseHeader(c),
    "JURY VOTES:",
    votes.map((v) => `- ${v.jurorName}: ${v.ruling.toUpperCase()} — ${v.reasoning}`).join("\n"),
    `VOTE TALLY: plaintiff ${tally.plaintiff}, defendant ${tally.defendant}. Winner: ${winner}.`,
    [
      "TASK: Write a short, decisive verdict.",
      "Line 1: THE COURT RULES: <one sharp sentence>.",
      "Lines 2–3: reasoning in the judge's voice (2–3 sentences).",
      c.mode === "real"
        ? "Line 4 (optional): one sentence of practical guidance for going forward."
        : "Line 4 (optional): one gavel-slamming closing line.",
    ].join(" "),
  ].join("\n\n");
}

export const MODEL = "claude-sonnet-4-5-20250929";
