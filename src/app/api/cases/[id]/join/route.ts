import { NextResponse } from "next/server";
import { getCaseById, joinCaseAsDefendant } from "@/lib/cases";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const defendantName =
      typeof body.defendantName === "string" ? body.defendantName.trim() : "";
    const defendantSide =
      typeof body.defendantSide === "string" ? body.defendantSide.trim() : "";

    if (defendantSide.length < 15) {
      return NextResponse.json({ error: "defendant side too short" }, { status: 400 });
    }

    const existing = await getCaseById(id);
    if (!existing)
      return NextResponse.json({ error: "case not found" }, { status: 404 });
    if (existing.status !== "awaiting_defendant") {
      return NextResponse.json({ error: "case not accepting defendants" }, { status: 409 });
    }

    const updated = await joinCaseAsDefendant(id, defendantName || "Defendant", defendantSide);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("POST /api/cases/:id/join", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
