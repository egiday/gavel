"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Scale, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const floaters = [
  { label: "defendant entered the chat", x: "-18%", y: "12%", delay: 0.2, tilt: -4 },
  { label: "objection, your honor", x: "62%", y: "8%", delay: 0.5, tilt: 5 },
  { label: "this is so toxic", x: "-22%", y: "68%", delay: 0.8, tilt: -6 },
  { label: "case closed", x: "66%", y: "72%", delay: 1.1, tilt: 3 },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* subtle dotted background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,theme(colors.primary/10),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(theme(colors.foreground/10)_1px,transparent_1px)] [background-size:20px_20px] opacity-40"
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-10 pb-14 text-center safe-x sm:pt-20 sm:pb-24">
        <Badge variant="secondary" className="mb-5 rounded-full px-3 py-1 text-xs font-medium tracking-wide">
          Jury of fifteen · AI deliberation · live verdict
        </Badge>

        <h1 className="max-w-3xl text-balance text-5xl font-black tracking-tight sm:text-6xl md:text-7xl">
          <span className="inline-block">Settle it </span>
          <span className="relative inline-block">
            <span className="relative z-10">in court</span>
            <motion.span
              aria-hidden
              className="absolute -bottom-1 left-0 right-0 h-3 bg-primary/30"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            />
          </span>
          <span className="inline-block">.</span>
        </h1>

        <p className="mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
          File your beef. A jury of fifteen AI personas argue it out in real time.
          Majority rules. Receipts optional.
        </p>

        <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg" className="group h-12 rounded-full px-6 text-base font-semibold shadow-lg shadow-primary/20">
            <Link href="/case/new?mode=petty">
              <Flame className="size-5" />
              Start a Petty Case
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6 text-base font-semibold">
            <Link href="/case/new?mode=real">
              <Scale className="size-5" />
              Start a Real Case
            </Link>
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          No account needed · Bring your own Anthropic key · We never see it
        </p>

        {/* floating jury snippet cards */}
        <div className="relative mt-10 w-full max-w-4xl hidden sm:block">
          <div className="relative mx-auto aspect-[16/7] w-full rounded-3xl border bg-card/40 p-6 shadow-xl backdrop-blur-sm">
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {floaters.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 20, rotate: f.tilt }}
                  animate={{ opacity: 1, y: 0, rotate: f.tilt }}
                  transition={{ delay: f.delay, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                  className="absolute rounded-2xl border bg-background px-4 py-2 text-sm font-medium shadow-sm"
                  style={{ left: f.x, top: f.y }}
                >
                  <span className="mr-2 text-primary">◆</span>
                  {f.label}
                </motion.div>
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="pointer-events-none select-none font-serif text-[14vw] font-black leading-none tracking-tighter text-foreground/5 sm:text-[8rem]">
                  GAVEL
                </div>
              </div>
            </div>
            <div className="relative flex h-full items-end justify-start">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="relative inline-flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                live deliberation in session
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
