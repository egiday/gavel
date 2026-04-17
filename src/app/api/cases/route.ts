import { NextResponse } from "next/server";
import { createCase } from "@/lib/cases";
import type { Mode } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mode: Mode = body.mode === "real" ? "real" : "petty";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const plaintiffSide =
      typeof body.plaintiffSide === "string" ? body.plaintiffSide.trim() : "";
    const plaintiffName =
      typeof body.plaintiffName === "string" ? body.plaintiffName.trim() : "";
    const isSolo = Boolean(body.isSolo);
    const absentDefendant = Boolean(body.absentDefendant);
    const defendantSide =
      typeof body.defendantSide === "string" ? body.defendantSide.trim() : "";

    if (title.length < 3) {
      return NextResponse.json({ error: "title too short" }, { status: 400 });
    }
    if (plaintiffSide.length < 15) {
      return NextResponse.json(
        { error: "plaintiff side too short — give us something to go on" },
        { status: 400 },
      );
    }

    const c = await createCase({
      mode,
      title,
      plaintiffName: plaintiffName || null,
      plaintiffSide,
      isSolo,
      absentDefendant,
      defendantSide: isSolo && !absentDefendant ? defendantSide : null,
    });

    return NextResponse.json(c, { status: 201 });
  } catch (err) {
    console.error("POST /api/cases", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
