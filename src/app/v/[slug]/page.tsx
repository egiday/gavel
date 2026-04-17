import { notFound } from "next/navigation";
import Link from "next/link";
import { Gavel, Scale, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getCaseBySlug,
  getCaseMessages,
  getVerdict,
} from "@/lib/cases";
import { JURORS, avatarUrl } from "@/lib/jurors";
import type { DeliberationMessage, VerdictRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await getCaseBySlug(slug);
  if (!c) return { title: "Verdict not found" };
  const v = await getVerdict(c.id);
  const rulingLabel = v?.ruling
    ? v.ruling === "plaintiff"
      ? "For the plaintiff"
      : v.ruling === "defendant"
        ? "For the defendant"
        : "Split decision"
    : "Pending";
  const title = `${rulingLabel} — ${c.title}`;
  const description = v?.topQuote ?? `Gavel verdict in ${c.mode} court.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: `/v/${slug}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/v/${slug}/opengraph-image`],
    },
  };
}

export default async function VerdictPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseData = await getCaseBySlug(slug);
  if (!caseData) notFound();

  const verdict = await getVerdict(caseData.id);
  const rows = await getCaseMessages(caseData.id);
  const messages: DeliberationMessage[] = rows.map((r) => ({
    id: r.id,
    phase: (r.phase as DeliberationMessage["phase"]) ?? "trial",
    speakerType: r.speakerType as DeliberationMessage["speakerType"],
    speakerId: r.speakerId,
    speakerName: r.speakerName,
    content: r.content,
    order: r.order,
    createdAt: r.createdAt.toISOString(),
  }));

  const outerThemeClass = caseData.mode === "petty" ? "mode-petty dark" : "mode-real";
  const jury = JURORS.filter((j) => caseData.jurorIds.includes(j.id));

  return (
    <div className={`min-h-dvh bg-background text-foreground ${outerThemeClass}`}>
      <header className="safe-top border-b">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4 safe-x">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Scale className="size-5" />
            Gavel
          </Link>
          <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-widest">
            public verdict
          </Badge>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 safe-x">
        {verdict ? (
          <HeadlineVerdict caseData={caseData} verdict={verdict} />
        ) : (
          <Card className="p-6 text-center">
            <Clock className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Court is still in session. Check back soon.
            </p>
          </Card>
        )}

        {/* receipts */}
        {messages.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold">Deliberation replay</h2>
              <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-widest">
                full transcript
              </Badge>
            </div>
            <ol className="mt-4 space-y-3">
              {messages.map((m) => {
                const juror =
                  m.speakerType === "juror"
                    ? JURORS.find((j) => j.id === m.speakerId)
                    : null;
                return (
                  <li
                    key={m.id}
                    className="flex items-start gap-3 rounded-2xl border bg-card p-4"
                  >
                    {juror ? (
                      <Avatar className="size-8 border">
                        <AvatarImage src={avatarUrl(juror)} alt={juror.name} />
                        <AvatarFallback>{juror.name[0]}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        {m.speakerName[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        {m.speakerName}
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {m.speakerType}
                        </span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                        {m.content}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* jury roster */}
        {jury.length > 0 && (
          <section className="mt-10">
            <h2 className="font-heading text-xl font-bold">Bench</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {jury.map((j) => (
                <div
                  key={j.id}
                  className="flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-3"
                >
                  <Avatar className="size-6">
                    <AvatarImage src={avatarUrl(j)} alt={j.name} />
                    <AvatarFallback>{j.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold">{j.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 flex flex-col items-center justify-center gap-3 border-t pt-10 text-center">
          <p className="text-sm text-muted-foreground">Got beef? File your own.</p>
          <Button asChild className="rounded-full">
            <Link href="/case/new">
              File a case <ExternalLink className="size-3.5" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

function HeadlineVerdict({
  caseData,
  verdict,
}: {
  caseData: Awaited<ReturnType<typeof getCaseBySlug>>;
  verdict: VerdictRecord;
}) {
  if (!caseData) return null;
  const tally = verdict.votes.reduce(
    (acc, v) => ({ ...acc, [v.ruling]: acc[v.ruling] + 1 }),
    { plaintiff: 0, defendant: 0 },
  );
  const winnerLabel =
    verdict.ruling === "plaintiff"
      ? "FOR THE PLAINTIFF"
      : verdict.ruling === "defendant"
        ? "FOR THE DEFENDANT"
        : "SPLIT DECISION";

  return (
    <Card className="relative overflow-hidden p-6 sm:p-8">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-widest">
          {caseData.mode} · {tally.plaintiff + tally.defendant}-juror bench
        </Badge>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Gavel className="size-3.5" /> verdict rendered
        </div>
      </div>
      <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        {caseData.title}
      </h1>
      <div className="mt-5 rounded-2xl border bg-primary/5 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          the court rules
        </p>
        <p className="mt-1 font-heading text-4xl font-black tracking-tight sm:text-5xl">
          {winnerLabel}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-full bg-background px-2 py-0.5 font-mono">
            {tally.plaintiff}-{tally.defendant}
          </span>
          <span>final vote</span>
        </div>
      </div>
      <div className="mt-5 space-y-3 text-base leading-relaxed">
        {verdict.summary.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      {verdict.topQuote && (
        <blockquote className="mt-5 border-l-4 border-primary/60 pl-4 text-sm italic text-muted-foreground">
          {verdict.topQuote}
        </blockquote>
      )}
    </Card>
  );
}
