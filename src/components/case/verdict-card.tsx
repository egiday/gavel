"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, Gavel, Scale, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { CasePayload, VerdictRecord } from "@/lib/types";

interface Props {
  caseData: CasePayload;
  verdict: VerdictRecord;
}

export function VerdictCard({ caseData, verdict }: Props) {
  const tally = useMemo(() => {
    const t = { plaintiff: 0, defendant: 0 };
    for (const v of verdict.votes) t[v.ruling] += 1;
    return t;
  }, [verdict.votes]);

  const shareUrl = useMemo(() => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    return `${origin}/v/${caseData.shareSlug}`;
  }, [caseData.shareSlug]);

  const winnerLabel =
    verdict.ruling === "plaintiff"
      ? "FOR THE PLAINTIFF"
      : verdict.ruling === "defendant"
        ? "FOR THE DEFENDANT"
        : "SPLIT — court is divided";

  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Verdict link copied");
    setTimeout(() => setCopied(false), 1500);
  }

  async function share() {
    const text = `The court rules ${winnerLabel} in ${caseData.title}.`;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: `Gavel v. ${caseData.title}`,
          text,
          url: shareUrl,
        });
        return;
      } catch {
        /* cancelled */
      }
    }
    copy();
  }

  return (
    <div className="gv-card relative overflow-hidden rounded-3xl p-6 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-10 -top-20 h-48 opacity-70"
        style={{
          background:
            "radial-gradient(600px 200px at 50% 0%, rgba(255,180,80,0.18), transparent 70%)",
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

      <h1 className="relative mt-4 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {caseData.title}
      </h1>

      <div className="relative mt-5 rounded-2xl border border-primary/40 bg-primary/10 p-5">
        <p className="gv-mono-label">the court rules</p>
        <p className="mt-1 font-heading text-3xl font-black tracking-tight text-white sm:text-5xl">
          {winnerLabel}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-white/60">
          <span className="rounded-full border border-white/10 bg-background px-2 py-0.5 font-mono">
            {tally.plaintiff}-{tally.defendant}
          </span>
          <span>final vote</span>
        </div>
      </div>

      <div className="relative mt-5 space-y-3 text-sm leading-relaxed text-white/80">
        {verdict.summary.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      {verdict.topQuote && (
        <blockquote className="relative mt-5 border-l-4 border-primary/60 pl-4 text-sm italic text-white/60">
          {verdict.topQuote}
        </blockquote>
      )}

      <div className="relative mt-6 grid gap-2 sm:grid-cols-2">
        <Button onClick={share} className="h-11 rounded-full gv-glow">
          <Share2 className="size-4" /> Share verdict
        </Button>
        <Button
          variant="outline"
          onClick={copy}
          className="h-11 rounded-full border-white/15 bg-white/5"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>

      <div className="relative mt-4 text-center">
        <Button asChild variant="ghost" size="sm" className="rounded-full text-white/60 hover:text-white">
          <Link href={`/v/${caseData.shareSlug}`}>
            <Scale className="size-3.5" /> View public verdict page
          </Link>
        </Button>
      </div>
    </div>
  );
}
