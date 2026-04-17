import { NextResponse } from "next/server";
import { setLawyer } from "@/lib/cases";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const side = body.side === "defendant" ? "defendant" : "plaintiff";
    const raw = typeof body.lawyerId === "string" ? body.lawyerId : null;
    // accept "self" as a sentinel meaning "picked self-defense"
    const lawyerId = raw === "" || raw === null ? null : raw;
    const updated = await setLawyer(id, side, lawyerId);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("POST /api/cases/:id/lawyer", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
