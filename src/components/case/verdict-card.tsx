"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, Gavel, Scale, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <Card className="relative overflow-hidden p-6 sm:p-8">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary" />

      <div className="flex items-center justify-between gap-3">
        <Badge variant="outline" className="rounded-full font-mono text-[10px] uppercase tracking-widest">
          {caseData.mode} · {tally.plaintiff + tally.defendant}-juror bench
        </Badge>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Gavel className="size-3.5" /> verdict
        </div>
      </div>

      <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
        {caseData.title}
      </h1>

      <div className="mt-5 rounded-2xl border bg-primary/5 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          the court rules
        </p>
        <p className="mt-1 font-heading text-3xl font-black tracking-tight sm:text-4xl">
          {winnerLabel}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-full bg-background px-2 py-0.5 font-mono">
            {tally.plaintiff}-{tally.defendant}
          </span>
          <span>final vote</span>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm leading-relaxed">
        {verdict.summary.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      {verdict.topQuote && (
        <blockquote className="mt-5 border-l-4 border-primary/60 pl-4 text-sm italic text-muted-foreground">
          {verdict.topQuote}
        </blockquote>
      )}

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <Button onClick={share} className="h-11 rounded-full">
          <Share2 className="size-4" /> Share verdict
        </Button>
        <Button variant="outline" onClick={copy} className="h-11 rounded-full">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>

      <div className="mt-4 text-center">
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href={`/v/${caseData.shareSlug}`}>
            <Scale className="size-3.5" /> View public verdict page
          </Link>
        </Button>
      </div>
    </Card>
  );
}
