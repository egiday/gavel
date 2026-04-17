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

  if (caseData.status !== "awaiting_defendant") {
    const themeClass = caseData.mode === "petty" ? "mode-petty" : "mode-real";
    return (
      <div
        className={`relative flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center text-foreground ${themeClass}`}
      >
        <div className="gv-spotlight" />
        <div className="relative z-10 gv-card w-full max-w-md rounded-3xl p-8">
          <p className="gv-mono-label">status</p>
          <h1 className="mt-3 font-heading text-3xl font-bold text-white">
            {caseData.title}
          </h1>
          <p className="mt-3 text-sm text-white/60">
            This case isn&rsquo;t accepting defendants right now.
          </p>
          <a
            href={`/case/${caseData.shareCode}?you=defendant`}
            className="mt-5 inline-block rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Go to the case view →
          </a>
        </div>
      </div>
    );
  }

  return <DefendantForm caseData={caseData} />;
}
