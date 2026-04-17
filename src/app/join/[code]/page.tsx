import { notFound } from "next/navigation";
import { getCaseByCode } from "@/lib/cases";
import { DefendantForm } from "./form";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const c = await getCaseByCode(code);
  return {
    title: c ? `Defend yourself · ${c.title}` : "Defend yourself",
  };
}

export default async function JoinCasePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const caseData = await getCaseByCode(code);
  if (!caseData) notFound();

  // if already joined or verdict rendered, redirect to case
  if (caseData.status !== "awaiting_defendant") {
    return (
      <div className={`flex min-h-dvh flex-col items-center justify-center bg-background p-6 text-center ${caseData.mode === "petty" ? "mode-petty dark" : "mode-real"}`}>
        <h1 className="font-heading text-3xl font-bold">{caseData.title}</h1>
        <p className="mt-2 text-muted-foreground">
          This case isn&rsquo;t accepting defendants right now.
        </p>
        <a
          href={`/case/${caseData.shareCode}?you=defendant`}
          className="mt-4 underline underline-offset-4"
        >
          Go to the case view
        </a>
      </div>
    );
  }

  return <DefendantForm caseData={caseData} />;
}
