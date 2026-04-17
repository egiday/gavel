// case-level CRUD + serialization helpers

import { prisma } from "./db";
import { generateShareCode, generateVerdictSlug } from "./share-code";
import { pickJury, type Juror } from "./jurors";
import type { CasePayload, CaseStatus, Mode, VerdictRecord } from "./types";

interface CreateCaseInput {
  mode: Mode;
  title: string;
  plaintiffName?: string | null;
  plaintiffSide: string;
  isSolo: boolean;
  absentDefendant: boolean;
  defendantSide?: string | null;
}

async function uniqueShareCode(): Promise<string> {
  for (let i = 0; i < 12; i += 1) {
    const code = generateShareCode();
    const existing = await prisma.case.findUnique({ where: { shareCode: code } });
    if (!existing) return code;
  }
  throw new Error("failed to generate unique share code");
}

async function uniqueSlug(): Promise<string> {
  for (let i = 0; i < 12; i += 1) {
    const slug = generateVerdictSlug();
    const existing = await prisma.case.findUnique({ where: { shareSlug: slug } });
    if (!existing) return slug;
  }
  throw new Error("failed to generate unique slug");
}

export async function createCase(input: CreateCaseInput): Promise<CasePayload> {
  const shareCode = await uniqueShareCode();
  const shareSlug = await uniqueSlug();

  const jury = pickJury(input.mode);
  const jurorIds = JSON.stringify(jury.map((j) => j.id));

  const isFullySolo = input.isSolo && (input.absentDefendant || !!input.defendantSide);
  const status: CaseStatus = isFullySolo ? "in_session" : "awaiting_defendant";

  const row = await prisma.case.create({
    data: {
      mode: input.mode,
      title: input.title,
      plaintiffName: input.plaintiffName ?? null,
      plaintiffSide: input.plaintiffSide,
      isSolo: input.isSolo,
      absentDefendant: input.absentDefendant,
      defendantSide: input.defendantSide ?? null,
      shareCode,
      shareSlug,
      status,
      jurorIds,
    },
  });
  return serializeCase(row);
}

export async function getCaseById(id: string): Promise<CasePayload | null> {
  const row = await prisma.case.findUnique({ where: { id } });
  return row ? serializeCase(row) : null;
}

export async function getCaseByCode(code: string): Promise<CasePayload | null> {
  const row = await prisma.case.findUnique({ where: { shareCode: code.toUpperCase() } });
  return row ? serializeCase(row) : null;
}

export async function getCaseBySlug(slug: string): Promise<CasePayload | null> {
  const row = await prisma.case.findUnique({ where: { shareSlug: slug } });
  return row ? serializeCase(row) : null;
}

export async function joinCaseAsDefendant(
  id: string,
  defendantName: string,
  defendantSide: string,
): Promise<CasePayload | null> {
  const row = await prisma.case.update({
    where: { id },
    data: {
      defendantName,
      defendantSide,
      status: "in_session",
    },
  });
  return serializeCase(row);
}

export async function setLawyer(
  id: string,
  side: "plaintiff" | "defendant",
  lawyerId: string | null,
): Promise<CasePayload | null> {
  const row = await prisma.case.update({
    where: { id },
    data: {
      ...(side === "plaintiff"
        ? { plaintiffLawyer: lawyerId }
        : { defendantLawyer: lawyerId }),
    },
  });
  return serializeCase(row);
}

function serializeCase(row: {
  id: string;
  mode: string;
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
  status: string;
  jurorIds: string;
  createdAt: Date;
}): CasePayload {
  return {
    id: row.id,
    mode: row.mode as Mode,
    title: row.title,
    plaintiffName: row.plaintiffName,
    plaintiffSide: row.plaintiffSide,
    plaintiffLawyer: row.plaintiffLawyer,
    defendantName: row.defendantName,
    defendantSide: row.defendantSide,
    defendantLawyer: row.defendantLawyer,
    isSolo: row.isSolo,
    absentDefendant: row.absentDefendant,
    shareCode: row.shareCode,
    shareSlug: row.shareSlug,
    status: row.status as CaseStatus,
    jurorIds: JSON.parse(row.jurorIds),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getCaseMessages(id: string) {
  return prisma.message.findMany({
    where: { caseId: id },
    orderBy: { order: "asc" },
  });
}

export async function getVerdict(id: string): Promise<VerdictRecord | null> {
  const v = await prisma.verdict.findUnique({
    where: { caseId: id },
    include: { votes: true },
  });
  if (!v) return null;
  return {
    ruling: v.ruling as VerdictRecord["ruling"],
    summary: v.summary,
    topQuote: v.topQuote,
    votes: v.votes.map((vote) => ({
      jurorId: vote.jurorId,
      jurorName: vote.jurorName,
      ruling: vote.ruling as "plaintiff" | "defendant",
      reasoning: vote.reasoning,
    })),
  };
}

export function jurorsForCase(jurorIds: string[], all: Juror[]): Juror[] {
  return jurorIds
    .map((id) => all.find((j) => j.id === id))
    .filter((j): j is Juror => Boolean(j));
}
