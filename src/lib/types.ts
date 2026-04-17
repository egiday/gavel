// shared types

import type { Mode } from "./jurors";
export type { Mode } from "./jurors";

export type CaseStatus = "awaiting_defendant" | "in_session" | "verdict";

export type Ruling = "plaintiff" | "defendant" | "split";

export type SpeakerType =
  | "judge"
  | "juror"
  | "lawyer"
  | "plaintiff"
  | "defendant";

export interface DeliberationMessage {
  id: string;
  speakerType: SpeakerType;
  speakerId: string;
  speakerName: string;
  content: string;
  order: number;
  createdAt: string;
}

export interface VoteRecord {
  jurorId: string;
  jurorName: string;
  ruling: Exclude<Ruling, "split">;
  reasoning: string;
}

export interface VerdictRecord {
  ruling: Ruling;
  summary: string;
  topQuote: string | null;
  votes: VoteRecord[];
}

export interface CasePayload {
  id: string;
  mode: Mode;
  title: string;
  plaintiffName: string | null;
  plaintiffSide: string;
  plaintiffLawyer: string | null;
  defendantName: string | null;
  defendantSide: string | null;
  defendantLawyer: string | null;
  isSolo: boolean;
  absentDefendant: boolean;
  shareCode: string;
  shareSlug: string;
  status: CaseStatus;
  jurorIds: string[];
  createdAt: string;
}
