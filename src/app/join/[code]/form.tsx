"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronLeft, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { CasePayload } from "@/lib/types";

export function DefendantForm({ caseData }: { caseData: CasePayload }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [side, setSide] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = side.trim().length >= 20;
  const outerThemeClass = caseData.mode === "petty" ? "mode-petty dark" : "mode-real";

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
    <div className={`min-h-dvh bg-background text-foreground ${outerThemeClass}`}>
      <header className="sticky top-0 z-20 safe-top border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4 safe-x">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ChevronLeft className="size-4" /> Home
            </Link>
          </Button>
          <h1 className="font-heading text-base font-bold tracking-tight">
            Defend yourself
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-36 pt-6 safe-x sm:pb-10">
        <div className="mb-4 flex items-center justify-between">
          <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-widest">
            case · {caseData.shareCode}
          </Badge>
          <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-widest">
            {caseData.mode}
          </Badge>
        </div>

        {/* plaintiff's filing */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Gavel className="size-3.5" />
            plaintiff&rsquo;s filing
          </div>
          <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {caseData.title}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Filed by {caseData.plaintiffName || "the plaintiff"}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
            {caseData.plaintiffSide}
          </p>
        </Card>

        {/* defendant form */}
        <Card className="mt-5 p-5 sm:p-6">
          <h3 className="font-heading text-xl font-bold">Your response</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Speak in your own voice. The jury will read this verbatim.
          </p>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dname" className="text-sm font-semibold">
                Your name (optional)
              </Label>
              <Input
                id="dname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Defendant"
                maxLength={40}
                className="h-12 text-base"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dside" className="text-sm font-semibold">
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
                className="min-h-40 text-base leading-relaxed"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>The jury won&rsquo;t see anything else.</span>
                <span>{side.length} chars</span>
              </div>
            </div>
          </div>
        </Card>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur-xl mb-safe sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-0">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3 safe-x">
          <div className="hidden text-sm text-muted-foreground sm:block">
            {canSubmit ? "Ready to file." : "Keep writing — give the jury something to chew on."}
          </div>
          <Button
            size="lg"
            className="h-12 w-full rounded-full text-base font-semibold sm:w-auto sm:px-8"
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
