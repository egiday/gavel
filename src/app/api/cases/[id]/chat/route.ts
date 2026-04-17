import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(req.url);
  const sinceParam = url.searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : null;

  const rows = await prisma.chatMessage.findMany({
    where: {
      caseId: id,
      ...(since ? { createdAt: { gt: since } } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json({
    messages: rows.map((r) => ({
      id: r.id,
      displayName: r.displayName,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const displayName =
      typeof body.displayName === "string"
        ? body.displayName.trim().slice(0, 32)
        : "";
    const content =
      typeof body.content === "string" ? body.content.trim().slice(0, 240) : "";
    if (!content) {
      return NextResponse.json({ error: "empty message" }, { status: 400 });
    }

    // verify the case exists
    const caseRow = await prisma.case.findUnique({ where: { id } });
    if (!caseRow) {
      return NextResponse.json({ error: "case not found" }, { status: 404 });
    }

    const row = await prisma.chatMessage.create({
      data: {
        caseId: id,
        displayName: displayName || anonName(),
        content,
      },
    });

    return NextResponse.json({
      id: row.id,
      displayName: row.displayName,
      content: row.content,
      createdAt: row.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("POST /api/cases/:id/chat", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

const ADJECTIVES = [
  "anonymous",
  "curious",
  "opinionated",
  "quiet",
  "bored",
  "loud",
  "juror-curious",
];
const NOUNS = ["spectator", "observer", "bailiff", "stranger", "visitor"];

function anonName(): string {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 90 + 10);
  return `${a} ${n} ${num}`;
}
