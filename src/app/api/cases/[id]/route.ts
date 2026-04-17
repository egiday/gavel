import { NextResponse } from "next/server";
import { getCaseById, getCaseMessages, getVerdict } from "@/lib/cases";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const c = await getCaseById(id);
  if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });
  const messages = await getCaseMessages(id);
  const verdict = await getVerdict(id);
  return NextResponse.json({ ...c, messages, verdict });
}
