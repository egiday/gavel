"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Scale, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { JURORS, avatarUrl } from "@/lib/jurors";

const tickerLines = [
  "defendant entered the chat",
  "Auntie Rue takes the floor",
  "objection, your honor",
  "Judge Marlowe: order.",
  "jury retires to deliberate",
  "verdict incoming…",
];

export function Hero() {
  const orbitJurors = JURORS.slice(0, 8);

  return (
    <section className="relative isolate overflow-hidden pt-12 sm:pt-20">
      {/* spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% -10%, rgba(250,250,250,0.08), transparent 60%), radial-gradient(600px 400px at 85% 20%, rgba(255,180,80,0.10), transparent 60%), radial-gradient(500px 400px at 10% 30%, rgba(120,140,255,0.08), transparent 60%)",
        }}
      />
      {/* grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_60%_at_50%_30%,#000_40%,transparent_90%)]"
        style={{
          backgroundImage:
            "linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)"
              .replaceAll("_", " "),
          backgroundSize: "44px 44px",
        }}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-16 text-center safe-x sm:pb-24">
        {/* top label */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center gap-3"
        >
          <Badge
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm"
          >
            <Sparkles className="mr-1 size-3" />
            Now empaneling
          </Badge>
          <span className="hidden items-center gap-2 font-mono text-xs text-white/50 sm:inline-flex">
            <span className="relative inline-flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span>jury room · in session</span>
          </span>
        </motion.div>

        {/* headline */}
        <h1 className="relative font-heading text-[14vw] font-black leading-[0.92] tracking-tighter sm:text-[96px] md:text-[128px] lg:text-[160px]">
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
              Settle it
            </span>
          </span>
          <br />
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
              in court
            </span>
            <motion.span
              aria-hidden
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
              className="absolute -bottom-[0.08em] left-0 right-0 h-[0.12em] bg-primary"
            />
          </span>
          <span className="align-super text-[0.5em] text-primary">.</span>
        </h1>

        {/* subhead */}
        <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-white/70 sm:mt-8 sm:text-lg">
          File your beef. A jury of{" "}
          <span className="font-semibold text-white">fifteen AI personas</span>{" "}
          watches the trial, deliberates live, and hands down a verdict.
          Receipts optional.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:mt-10 sm:w-auto sm:flex-row">
          <Button
            asChild
            size="lg"
            className="group h-14 rounded-full px-7 text-base font-semibold shadow-[0_0_40px_-10px_theme(colors.primary/60)]"
          >
            <Link href="/case/new?mode=petty">
              <Flame className="size-5" />
              Start a Petty Case
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-14 rounded-full border-white/15 bg-white/5 px-7 text-base font-semibold backdrop-blur hover:bg-white/10"
          >
            <Link href="/case/new?mode=real">
              <Scale className="size-5" />
              Start a Real Case
            </Link>
          </Button>
        </div>

        <p className="mt-5 font-mono text-xs uppercase tracking-widest text-white/40">
          no account · bring your own anthropic key · we never see it
        </p>

        {/* orbit strip — juror avatars floating */}
        <div className="relative mt-14 w-full max-w-5xl sm:mt-20">
          <div className="relative h-40 sm:h-56">
            <div
              aria-hidden
              className="absolute inset-0 rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent"
            />
            {orbitJurors.map((j, i) => {
              // place avatars on an arc
              const pct = i / (orbitJurors.length - 1);
              const leftPct = 6 + pct * 88;
              const top = 50 + Math.sin(pct * Math.PI) * 32;
              return (
                <motion.div
                  key={j.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.5 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${leftPct}%`, top: `${top}%` }}
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 3 + (i % 3),
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.12,
                    }}
                  >
                    <Avatar className="size-12 border-2 border-white/10 shadow-xl sm:size-14">
                      <AvatarImage src={avatarUrl(j)} alt={j.name} />
                      <AvatarFallback>{j.name[0]}</AvatarFallback>
                    </Avatar>
                  </motion.div>
                </motion.div>
              );
            })}

            {/* live ticker running through the middle */}
            <div className="absolute inset-x-6 bottom-5 overflow-hidden rounded-full border border-white/10 bg-white/[0.03] py-2 text-xs text-white/60 backdrop-blur-sm">
              <motion.div
                className="flex w-max items-center gap-8 whitespace-nowrap font-mono"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              >
                {[...tickerLines, ...tickerLines, ...tickerLines].map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
