import { NextResponse } from "next/server";
import { getCaseByCode } from "@/lib/cases";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const c = await getCaseByCode(code);
  if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(c);
}
