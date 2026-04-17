import { notFound } from "next/navigation";
import Link from "next/link";
import { Gavel, Scale, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

  const themeClass = caseData.mode === "petty" ? "mode-petty" : "mode-real";
  const jury = JURORS.filter((j) => caseData.jurorIds.includes(j.id));

  return (
    <div className={`relative min-h-dvh bg-background text-foreground ${themeClass}`}>
      <div className="gv-spotlight" />

      <header className="relative z-10 safe-top border-b border-white/10">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4 safe-x">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-white"
          >
            <span className="relative flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Scale className="size-4" />
            </span>
            Gavel
          </Link>
          <Badge
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 font-mono text-[10px] uppercase tracking-widest text-white/70"
          >
            public verdict
          </Badge>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-8 safe-x">
        {verdict ? (
          <HeadlineVerdict caseData={caseData} verdict={verdict} />
        ) : (
          <div className="gv-card rounded-3xl p-8 text-center">
            <Clock className="mx-auto size-8 text-white/40" />
            <p className="mt-3 text-sm text-white/60">
              Court is still in session. Check back soon.
            </p>
          </div>
        )}

        {messages.length > 0 && (
          <section className="mt-10">
            <div className="flex items-end justify-between">
              <div>
                <p className="gv-mono-label">full transcript</p>
                <h2 className="mt-2 font-heading text-2xl font-bold text-white sm:text-3xl">
                  Deliberation replay
                </h2>
              </div>
              <Badge
                variant="secondary"
                className="rounded-full border-white/10 bg-white/5 font-mono text-[10px] uppercase tracking-widest text-white/70"
              >
                {messages.length} turns
              </Badge>
            </div>
            <ol className="mt-5 space-y-3">
              {messages.map((m) => {
                const juror =
                  m.speakerType === "juror"
                    ? JURORS.find((j) => j.id === m.speakerId)
                    : null;
                const phaseAccent =
                  m.phase === "trial"
                    ? "bg-amber-500/15 text-amber-300"
                    : m.phase === "deliberation"
                      ? "bg-blue-500/15 text-blue-300"
                      : "bg-primary/15 text-primary";
                return (
                  <li
                    key={m.id}
                    className="gv-card flex items-start gap-3 rounded-2xl p-4"
                  >
                    {juror ? (
                      <Avatar className="size-8 border border-white/10">
                        <AvatarImage src={avatarUrl(juror)} alt={juror.name} />
                        <AvatarFallback>{juror.name[0]}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/80">
                        {(m.speakerName ?? "?")[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {m.speakerName}
                        </span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest ${phaseAccent}`}
                        >
                          {m.phase}
                        </span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-white/85">
                        {m.content}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {jury.length > 0 && (
          <section className="mt-12">
            <p className="gv-mono-label">the bench</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {jury.map((j) => (
                <div
                  key={j.id}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3"
                >
                  <Avatar className="size-6">
                    <AvatarImage src={avatarUrl(j)} alt={j.name} />
                    <AvatarFallback>{j.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-white">{j.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 flex flex-col items-center justify-center gap-3 border-t border-white/10 pt-10 text-center">
          <p className="text-sm text-white/60">Got beef? File your own.</p>
          <Button asChild className="rounded-full gv-glow">
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
    <div className="gv-card relative overflow-hidden rounded-3xl p-6 sm:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-10 -top-20 h-52 opacity-70"
        style={{
          background:
            "radial-gradient(600px 220px at 50% 0%, rgba(255,180,80,0.18), transparent 70%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
      <div className="relative flex items-center justify-between gap-3">
        <Badge
          variant="outline"
          className="rounded-full border-white/10 bg-white/5 font-mono text-[10px] uppercase tracking-widest text-white/70"
        >
          {caseData.mode} · {tally.plaintiff + tally.defendant}-juror bench
        </Badge>
        <div className="flex items-center gap-2 font-mono text-xs text-white/50">
          <Gavel className="size-3.5" /> verdict rendered
        </div>
      </div>
      <h1 className="relative mt-4 font-heading text-3xl font-bold tracking-tight text-white sm:text-5xl">
        {caseData.title}
      </h1>
      <div className="relative mt-5 rounded-2xl border border-primary/40 bg-primary/10 p-5">
        <p className="gv-mono-label">the court rules</p>
        <p className="mt-1 font-heading text-4xl font-black tracking-tight text-white sm:text-6xl">
          {winnerLabel}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-white/60">
          <span className="rounded-full border border-white/10 bg-background px-2 py-0.5 font-mono">
            {tally.plaintiff}-{tally.defendant}
          </span>
          <span>final vote</span>
        </div>
      </div>
      <div className="relative mt-5 space-y-3 text-base leading-relaxed text-white/80">
        {verdict.summary.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      {verdict.topQuote && (
        <blockquote className="relative mt-5 border-l-4 border-primary/60 pl-4 text-sm italic text-white/60">
          {verdict.topQuote}
        </blockquote>
      )}
    </div>
  );
}
