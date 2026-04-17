import { notFound } from "next/navigation";
import { getCaseByCode, getCaseMessages, getVerdict } from "@/lib/cases";
import { CaseWorkspace } from "@/components/case/case-workspace";
import type { DeliberationMessage } from "@/lib/types";

type PageProps = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ you?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const c = await getCaseByCode(code);
  return {
    title: c ? c.title : "Case",
    description: c
      ? `${c.plaintiffName ?? "Someone"} files: "${c.title}"`
      : "Gavel case",
  };
}

export default async function CasePage({ params, searchParams }: PageProps) {
  const { code } = await params;
  const { you } = await searchParams;

  const caseData = await getCaseByCode(code);
  if (!caseData) notFound();

  const rows = await getCaseMessages(caseData.id);
  const messages: DeliberationMessage[] = rows.map((r) => ({
    id: r.id,
    speakerType: r.speakerType as DeliberationMessage["speakerType"],
    speakerId: r.speakerId,
    speakerName: r.speakerName,
    content: r.content,
    order: r.order,
    createdAt: r.createdAt.toISOString(),
  }));

  const verdict = await getVerdict(caseData.id);

  const youRole: "plaintiff" | "defendant" | null =
    you === "plaintiff" || you === "defendant" ? you : null;

  return (
    <CaseWorkspace
      caseData={caseData}
      messages={messages}
      verdict={verdict}
      youRole={youRole}
    />
  );
}
