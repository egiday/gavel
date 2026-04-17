"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Flame,
  Scale,
  Gavel,
  ChevronLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
    const next = new URLSearchParams(params);
    next.set("mode", mode);
    const q = next.toString();
    if (q !== params.toString()) history.replaceState(null, "", `?${q}`);
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

  return (
    <div className={`relative min-h-dvh bg-background text-foreground mode-${mode}`}>
      <div className="gv-spotlight" />

      <header className="sticky top-0 z-20 safe-top border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4 safe-x">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ChevronLeft className="size-4" /> Home
            </Link>
          </Button>
          <h1 className="font-heading text-base font-bold tracking-tight">
            File a case
          </h1>
          <div className="w-16 text-right font-mono text-[10px] uppercase tracking-widest text-white/50">
            new
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-36 pt-8 safe-x sm:pb-12 sm:pt-14">
        <div className="mb-8 text-center">
          <p className="gv-mono-label">file a case · in two minutes</p>
          <h2 className="mt-3 font-heading text-4xl font-black tracking-tight sm:text-5xl">
            Tell the court your side.
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Pick a mode. Write your filing. Invite the other party — or run solo.
          </p>
        </div>

        <div className="gv-card overflow-hidden rounded-3xl p-5 sm:p-7">
          {/* mode picker */}
          <div>
            <Label className="gv-mono-label">Mode</Label>
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="mt-2">
              <TabsList className="grid h-12 w-full grid-cols-2 rounded-full border border-white/10 bg-white/5">
                <TabsTrigger
                  value="petty"
                  className="rounded-full text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow"
                >
                  <Flame className="size-4" /> Petty
                </TabsTrigger>
                <TabsTrigger
                  value="real"
                  className="rounded-full text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow"
                >
                  <Scale className="size-4" /> Real
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="mt-2 text-xs text-white/55">
              {mode === "petty"
                ? "Loud jurors, dramatic takes, gavel-slamming verdicts."
                : "Thoughtful jurors, weighed deliberation, firm-but-fair rulings."}
            </p>
          </div>

          <Section className="mt-6" label="Case title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                mode === "petty"
                  ? "The Pad Thai Incident"
                  : "Rent vs. graduation timeline"
              }
              maxLength={80}
              className="h-12 border-white/15 bg-white/5 text-base"
              autoComplete="off"
              autoCapitalize="sentences"
            />
            <Helper>Keep it short. This is what they&rsquo;ll see.</Helper>
          </Section>

          <Section className="mt-5" label="Your name (optional)">
            <Input
              value={plaintiffName}
              onChange={(e) => setPlaintiffName(e.target.value)}
              placeholder="Plaintiff"
              maxLength={40}
              className="h-12 border-white/15 bg-white/5 text-base"
              autoComplete="off"
            />
          </Section>

          <Section className="mt-5" label="Your side of the story">
            <Textarea
              value={plaintiffSide}
              onChange={(e) => setPlaintiffSide(e.target.value)}
              placeholder={
                mode === "petty"
                  ? "Be specific. What happened, when, and why does it still piss you off?"
                  : "Describe the dispute with context. What was agreed, what changed, what you want."
              }
              rows={6}
              className="min-h-36 border-white/15 bg-white/5 text-base leading-relaxed"
            />
            <Helper className="flex items-center justify-between">
              <span>The jury will read this verbatim.</span>
              <span className="font-mono">{plaintiffSide.length} chars</span>
            </Helper>
          </Section>

          <Section className="mt-6" label="Who's the other party?">
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
                body="You'll submit both sides."
                icon={<Sparkles className="size-4" />}
              />
              <ChoiceCard
                active={choice === "solo-absent"}
                onClick={() => setChoice("solo-absent")}
                title="They're not here"
                body="AI plays devil's advocate."
                icon={<Gavel className="size-4" />}
              />
            </div>
          </Section>

          {choice === "solo-both" && (
            <Section className="mt-5" label="Their side of the story">
              <Textarea
                value={defendantSide}
                onChange={(e) => setDefendantSide(e.target.value)}
                placeholder="Write their best-faith argument. Don't strawman — the jury will notice."
                rows={5}
                className="min-h-32 border-white/15 bg-white/5 text-base leading-relaxed"
              />
              <Helper className="flex items-center justify-between">
                <span>Steelman it if you can.</span>
                <span className="font-mono">{defendantSide.length} chars</span>
              </Helper>
            </Section>
          )}
        </div>

        <p className="mt-4 text-center font-mono text-xs uppercase tracking-widest text-white/40">
          this is not legal advice. gavel is entertainment.
        </p>
      </main>

      {/* sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-background/95 backdrop-blur-xl mb-safe sm:static sm:border-0 sm:bg-transparent sm:backdrop-blur-none">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3 safe-x">
          <div className="hidden text-sm text-white/60 sm:block">
            {canSubmit ? "Ready to file." : "Keep writing — need a bit more."}
          </div>
          <Button
            size="lg"
            className="h-12 w-full rounded-full text-base font-semibold gv-glow sm:w-auto sm:px-8"
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

function Section({
  className = "",
  label,
  children,
}: {
  className?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="gv-mono-label">{label}</Label>
      {children}
    </div>
  );
}

function Helper({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`text-xs text-white/50 ${className}`}>{children}</div>
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
      className={`relative flex flex-col gap-1 rounded-2xl border p-4 text-left transition-all ${
        active
          ? "border-primary/60 bg-primary/10 shadow-[0_0_30px_-10px_theme(colors.primary/60)]"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex size-7 items-center justify-center rounded-lg ${
            active ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/80"
          }`}
        >
          {icon}
        </span>
        <span className="text-sm font-semibold text-white">{title}</span>
      </div>
      <p className="text-xs text-white/55">{body}</p>
    </button>
  );
}
