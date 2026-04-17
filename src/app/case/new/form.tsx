"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Flame, Scale, Gavel, ChevronLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { Mode } from "@/lib/types";

type SoloChoice = "invite" | "solo-both" | "solo-absent";

export function CaseCreationForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialMode: Mode = params.get("mode") === "real" ? "real" : "petty";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [choice, setChoice] = useState<SoloChoice>("invite");
  const [title, setTitle] = useState("");
  const [plaintiffName, setPlaintiffName] = useState("");
  const [plaintiffSide, setPlaintiffSide] = useState("");
  const [defendantSide, setDefendantSide] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // keep the url in sync so refresh/share of the /case/new?mode= param works
    const next = new URLSearchParams(params);
    next.set("mode", mode);
    const q = next.toString();
    if (q !== params.toString()) {
      history.replaceState(null, "", `?${q}`);
    }
  }, [mode, params]);

  const canSubmit = useMemo(() => {
    if (title.trim().length < 3) return false;
    if (plaintiffSide.trim().length < 20) return false;
    if (choice === "solo-both" && defendantSide.trim().length < 20) return false;
    return true;
  }, [title, plaintiffSide, choice, defendantSide]);

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode,
          title: title.trim(),
          plaintiffName: plaintiffName.trim(),
          plaintiffSide: plaintiffSide.trim(),
          isSolo: choice !== "invite",
          absentDefendant: choice === "solo-absent",
          defendantSide: choice === "solo-both" ? defendantSide.trim() : null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "server error" }));
        toast.error(j.error ?? "Something went wrong");
        return;
      }
      const data = await res.json();
      toast.success("Case filed");
      router.push(`/case/${data.shareCode}?you=plaintiff`);
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  const outerThemeClass = mode === "petty" ? "mode-petty dark" : "mode-real";

  return (
    <div className={`min-h-dvh bg-background text-foreground ${outerThemeClass}`}>
      <header className="sticky top-0 z-20 safe-top border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4 safe-x">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ChevronLeft className="size-4" /> Home
            </Link>
          </Button>
          <h1 className="font-heading text-base font-bold tracking-tight">File a case</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-36 pt-6 safe-x sm:pb-10">
        <Card className="p-5 sm:p-7">
          {/* mode picker */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mode
            </Label>
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="mt-2">
              <TabsList className="grid h-11 w-full grid-cols-2 rounded-full">
                <TabsTrigger
                  value="petty"
                  className="rounded-full text-sm font-semibold data-[state=active]:shadow"
                >
                  <Flame className="size-4" /> Petty
                </TabsTrigger>
                <TabsTrigger
                  value="real"
                  className="rounded-full text-sm font-semibold data-[state=active]:shadow"
                >
                  <Scale className="size-4" /> Real
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="mt-2 text-xs text-muted-foreground">
              {mode === "petty"
                ? "Loud jurors, dramatic takes, gavel-slamming verdicts."
                : "Thoughtful jurors, weighed deliberation, firm-but-fair rulings."}
            </p>
          </div>

          {/* title */}
          <div className="mt-6 space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">Case title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={mode === "petty" ? "The Pad Thai Incident" : "Rent vs. graduation timeline"}
              maxLength={80}
              className="h-12 text-base"
              autoComplete="off"
              autoCapitalize="sentences"
            />
            <p className="text-xs text-muted-foreground">Keep it short. This is what they&rsquo;ll see.</p>
          </div>

          {/* plaintiff name */}
          <div className="mt-5 space-y-2">
            <Label htmlFor="pname" className="text-sm font-semibold">Your name (optional)</Label>
            <Input
              id="pname"
              value={plaintiffName}
              onChange={(e) => setPlaintiffName(e.target.value)}
              placeholder="Plaintiff"
              maxLength={40}
              className="h-12 text-base"
              autoComplete="off"
            />
          </div>

          {/* plaintiff side */}
          <div className="mt-5 space-y-2">
            <Label htmlFor="pside" className="text-sm font-semibold">Your side of the story</Label>
            <Textarea
              id="pside"
              value={plaintiffSide}
              onChange={(e) => setPlaintiffSide(e.target.value)}
              placeholder={
                mode === "petty"
                  ? "Be specific. What happened, when, and why does it still piss you off?"
                  : "Describe the dispute with context. What was agreed, what changed, what you want."
              }
              rows={6}
              className="min-h-36 text-base leading-relaxed"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>The jury will read this verbatim.</span>
              <span>{plaintiffSide.length} chars</span>
            </div>
          </div>

          {/* who's involved */}
          <div className="mt-6 space-y-3">
            <Label className="text-sm font-semibold">Who&rsquo;s the other party?</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              <ChoiceCard
                active={choice === "invite"}
                onClick={() => setChoice("invite")}
                title="Invite them"
                body="Send a link. They defend themselves."
                icon={<ArrowRight className="size-4" />}
              />
              <ChoiceCard
                active={choice === "solo-both"}
                onClick={() => setChoice("solo-both")}
                title="Solo"
                body="You&rsquo;ll submit both sides."
                icon={<Sparkles className="size-4" />}
              />
              <ChoiceCard
                active={choice === "solo-absent"}
                onClick={() => setChoice("solo-absent")}
                title="They&rsquo;re not here"
                body="AI will play devil&rsquo;s advocate."
                icon={<Gavel className="size-4" />}
              />
            </div>
          </div>

          {/* conditional defendant side (solo-both only) */}
          {choice === "solo-both" && (
            <div className="mt-5 space-y-2">
              <Label htmlFor="dside" className="text-sm font-semibold">
                Their side of the story
              </Label>
              <Textarea
                id="dside"
                value={defendantSide}
                onChange={(e) => setDefendantSide(e.target.value)}
                placeholder="Write their best-faith argument. Don't strawman — the jury will notice."
                rows={5}
                className="min-h-32 text-base leading-relaxed"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Steelman it if you can.</span>
                <span>{defendantSide.length} chars</span>
              </div>
            </div>
          )}
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          This isn&rsquo;t legal advice. Gavel is entertainment.
        </p>
      </main>

      {/* sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur-xl mb-safe sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-0">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3 safe-x">
          <div className="hidden text-sm text-muted-foreground sm:block">
            {canSubmit ? "Ready to file." : "Keep writing — need a bit more."}
          </div>
          <Button
            size="lg"
            className="h-12 w-full rounded-full text-base font-semibold sm:w-auto sm:px-8"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? "Filing…" : "File case"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChoiceCard({
  active,
  onClick,
  title,
  body,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col gap-1 rounded-2xl border p-4 text-left transition-colors ${
        active
          ? "border-primary bg-primary/10 shadow-sm"
          : "hover:bg-muted"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex size-7 items-center justify-center rounded-lg ${
            active ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          {icon}
        </span>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground">{body}</p>
    </button>
  );
}
