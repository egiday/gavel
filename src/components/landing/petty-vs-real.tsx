"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Flame, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 safe-x sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          pick your aesthetic
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Petty or Real?
        </h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Same jury engine. Different temperature.
        </p>

        <div className="mx-auto mt-6 inline-flex rounded-full border bg-muted p-1 text-sm">
          <button
            onClick={() => setMode("petty")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition-colors ${
              mode === "petty" ? "bg-background shadow" : "text-muted-foreground"
            }`}
          >
            <Flame className="size-4" /> Petty
          </button>
          <button
            onClick={() => setMode("real")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition-colors ${
              mode === "real" ? "bg-background shadow" : "text-muted-foreground"
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
          className={`mt-8 ${mode === "petty" ? "mode-petty dark" : "mode-real"}`}
        >
          <Card className="overflow-hidden border-2 bg-background text-foreground">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="font-heading text-2xl sm:text-3xl">{c.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{c.subtitle}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-1">
                  {c.vibes.map((v) => (
                    <Badge key={v} variant="secondary" className="rounded-full text-xs">
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border bg-muted/50 p-4 text-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  sample filing
                </span>
                <p className="mt-2">{c.sample}</p>
              </div>
              <div className="rounded-2xl border bg-primary/10 p-4 text-sm font-semibold">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  verdict
                </span>
                <p className="mt-2 font-heading text-lg">{c.verdict}</p>
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
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
