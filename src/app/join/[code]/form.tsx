"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronLeft, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { CasePayload } from "@/lib/types";

export function DefendantForm({ caseData }: { caseData: CasePayload }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [side, setSide] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = side.trim().length >= 20;
  const themeClass = caseData.mode === "petty" ? "mode-petty" : "mode-real";

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}/join`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          defendantName: name.trim(),
          defendantSide: side.trim(),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "server error" }));
        toast.error(j.error ?? "Couldn't join");
        return;
      }
      toast.success("Filed with the court");
      router.push(`/case/${caseData.shareCode}?you=defendant`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`relative min-h-dvh bg-background text-foreground ${themeClass}`}>
      <div className="gv-spotlight" />

      <header className="sticky top-0 z-20 safe-top border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4 safe-x">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ChevronLeft className="size-4" /> Home
            </Link>
          </Button>
          <h1 className="font-heading text-base font-bold tracking-tight text-white">
            Defend yourself
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-36 pt-6 safe-x sm:pb-12">
        <div className="mb-4 flex items-center justify-between">
          <Badge
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 font-mono text-[10px] uppercase tracking-widest text-white/70"
          >
            case · {caseData.shareCode}
          </Badge>
          <Badge
            variant="secondary"
            className="rounded-full border-white/10 bg-white/5 font-mono text-[10px] uppercase tracking-widest text-white/70"
          >
            {caseData.mode}
          </Badge>
        </div>

        {/* plaintiff's filing */}
        <div className="gv-card rounded-3xl p-5 sm:p-6">
          <div className="gv-mono-label inline-flex items-center gap-2">
            <Gavel className="size-3.5" />
            plaintiff&rsquo;s filing
          </div>
          <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {caseData.title}
          </h2>
          <p className="mt-1 text-xs text-white/50">
            Filed by {caseData.plaintiffName || "the plaintiff"}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-white/85">
            {caseData.plaintiffSide}
          </p>
        </div>

        {/* defendant form */}
        <div className="gv-card mt-5 rounded-3xl p-5 sm:p-6">
          <h3 className="font-heading text-xl font-bold text-white">
            Your response
          </h3>
          <p className="mt-1 text-sm text-white/60">
            Speak in your own voice. The jury will read this verbatim.
          </p>

          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dname" className="gv-mono-label">
                Your name (optional)
              </Label>
              <Input
                id="dname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Defendant"
                maxLength={40}
                className="h-12 border-white/15 bg-white/5 text-base"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dside" className="gv-mono-label">
                Your side of the story
              </Label>
              <Textarea
                id="dside"
                value={side}
                onChange={(e) => setSide(e.target.value)}
                placeholder={
                  caseData.mode === "petty"
                    ? "Your rebuttal. Receipts welcome."
                    : "Your side. Context, what you understood, what you want."
                }
                rows={7}
                className="min-h-40 border-white/15 bg-white/5 text-base leading-relaxed"
              />
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>The jury won&rsquo;t see anything else.</span>
                <span className="font-mono">{side.length} chars</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-background/95 backdrop-blur-xl mb-safe sm:static sm:border-0 sm:bg-transparent sm:backdrop-blur-none">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3 safe-x">
          <div className="hidden text-sm text-white/60 sm:block">
            {canSubmit
              ? "Ready to file."
              : "Keep writing — give the jury something to chew on."}
          </div>
          <Button
            size="lg"
            className="h-12 w-full rounded-full gv-glow text-base font-semibold sm:w-auto sm:px-8"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? "Filing…" : "File response"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
