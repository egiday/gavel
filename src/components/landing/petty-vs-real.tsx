"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Flame, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Mode } from "@/lib/types";

const content: Record<Mode, {
  title: string;
  subtitle: string;
  vibes: string[];
  sample: string;
  verdict: string;
}> = {
  petty: {
    title: "Petty",
    subtitle: "Group chat beefs. Ridiculous energy.",
    vibes: ["loud", "chaotic", "dramatic", "receipts welcomed"],
    sample:
      "I paid for the Uber. He said he'd Venmo. Three weeks later, nothing. Your honor.",
    verdict: "UNANIMOUS — pay up and apologize in the group chat.",
  },
  real: {
    title: "Real",
    subtitle: "Actual disputes. Handled with weight.",
    vibes: ["muted", "careful", "measured", "suggestions included"],
    sample:
      "We agreed I'd cover rent while she finished school. She's graduated. It's been six months.",
    verdict: "MAJORITY 4-1 — revisit the arrangement. Formalize going forward.",
  },
};

export function PettyVsReal() {
  const [mode, setMode] = useState<Mode>("petty");
  const c = content[mode];
  const themeClass = mode === "petty" ? "mode-petty dark" : "mode-real";

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 safe-x sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">
          pick your aesthetic
        </p>
        <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Petty or Real?
        </h2>
        <p className="mt-3 text-sm text-white/60 sm:text-base">
          Same jury engine. Different temperature.
        </p>

        <div className="mx-auto mt-6 inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm backdrop-blur">
          <button
            onClick={() => setMode("petty")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 font-semibold transition-colors ${
              mode === "petty"
                ? "bg-white text-background shadow"
                : "text-white/60"
            }`}
          >
            <Flame className="size-4" /> Petty
          </button>
          <button
            onClick={() => setMode("real")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 font-semibold transition-colors ${
              mode === "real"
                ? "bg-white text-background shadow"
                : "text-white/60"
            }`}
          >
            <Scale className="size-4" /> Real
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          className={`mt-8 ${themeClass}`}
        >
          <div className="overflow-hidden rounded-3xl border-2 border-border bg-background text-foreground shadow-2xl">
            <div className="flex items-start justify-between gap-3 p-6 sm:p-8">
              <div>
                <h3 className="font-heading text-3xl font-bold sm:text-4xl">
                  {c.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.subtitle}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                {c.vibes.map((v) => (
                  <Badge key={v} variant="secondary" className="rounded-full text-[10px] uppercase tracking-widest">
                    {v}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-4 px-6 pb-6 sm:px-8 sm:pb-8">
              <div className="rounded-2xl border border-border bg-muted/50 p-4 text-sm">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  sample filing
                </span>
                <p className="mt-2">{c.sample}</p>
              </div>
              <div className="rounded-2xl border-2 border-primary/50 bg-primary/10 p-4 text-sm font-semibold">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  verdict
                </span>
                <p className="mt-2 font-heading text-lg sm:text-xl">{c.verdict}</p>
              </div>
              <Button asChild size="lg" className="w-full rounded-full sm:w-auto">
                <Link href={`/case/new?mode=${mode}`}>
                  {mode === "petty" ? (
                    <>
                      <Flame className="size-4" />
                      File a Petty Case
                    </>
                  ) : (
                    <>
                      <Scale className="size-4" />
                      File a Real Case
                    </>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
