"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Radio, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarUrl, getJuror } from "@/lib/jurors";

type Line = {
  jurorId: string;
  line: string;
  phase: "trial" | "deliberation";
  speaker?: string;
};

const SCRIPT: Line[] = [
  {
    jurorId: "judge-marlowe",
    line: "Court is in session. Plaintiff alleges the defendant ate her leftovers without asking.",
    phase: "trial",
    speaker: "Judge Marlowe",
  },
  {
    jurorId: "judge-marlowe",
    line: "Plaintiff's counsel, your opening.",
    phase: "trial",
  },
  {
    jurorId: "judge-marlowe",
    line: "Defense, response.",
    phase: "trial",
  },
  {
    jurorId: "judge-marlowe",
    line: "The jury will now retire.",
    phase: "trial",
  },
  {
    jurorId: "auntie-rue",
    line: "Baby, you do NOT eat another grown woman's pad thai without asking. That's common sense.",
    phase: "deliberation",
  },
  {
    jurorId: "the-intern",
    line: "literally the way he didn't even leave a note???",
    phase: "deliberation",
  },
  {
    jurorId: "nina",
    line: "NO BECAUSE— that container had her NAME on it. with a SHARPIE.",
    phase: "deliberation",
  },
  {
    jurorId: "professor-kline",
    line: "Does an unmarked fridge shelf imply communal use? Consider the precedent.",
    phase: "deliberation",
  },
  {
    jurorId: "ghost",
    line: "lol imagine lawyering up over noodles. both of you are losing.",
    phase: "deliberation",
  },
  {
    jurorId: "sasha",
    line: "the AUDACITY. the ABSOLUTE AUDACITY to leave the empty container in the sink.",
    phase: "deliberation",
  },
];

export function LiveDemoStrip() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SCRIPT.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 safe-x sm:py-20">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">
            · live demo · petty v. anonymous · case ptl-4432
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            The jury doesn&rsquo;t whisper.
          </h2>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-white/50">
          <Video className="size-3.5" />
          <span>in-chamber feed</span>
          <span className="relative inline-flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-red-500" />
          </span>
          REC
        </div>
      </div>

      {/* the screen */}
      <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-[1px] shadow-[0_0_60px_-20px_theme(colors.primary/40)]">
        <div className="overflow-hidden rounded-[1.9rem] bg-black/60 backdrop-blur">
          {/* chrome */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-white/50 sm:text-xs">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-red-500" />
              <span className="size-2 rounded-full bg-amber-400/80" />
              <span className="size-2 rounded-full bg-emerald-400/80" />
              <span className="ml-3">courtroom feed</span>
            </div>
            <div className="flex items-center gap-3">
              <Radio className="size-3.5" />
              <span>turn {idx + 1}/{SCRIPT.length}</span>
            </div>
          </div>

          <div className="relative h-[300px] overflow-hidden sm:h-[360px]">
            {/* scanline glow */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-white/5 to-transparent"
              animate={{ y: ["-10%", "110%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />

            <AnimatePresence initial={false}>
              {SCRIPT.slice(Math.max(0, idx - 3), idx + 1).map((line, i, arr) => {
                const isLast = i === arr.length - 1;
                const juror = getJuror(line.jurorId);
                if (!juror) return null;
                return (
                  <motion.div
                    key={`${line.jurorId}-${Math.max(0, idx - 3) + i}`}
                    layout
                    initial={{ opacity: 0, y: 40, scale: 0.98 }}
                    animate={{
                      opacity: isLast ? 1 : 0.4 + i * 0.15,
                      y: 0,
                      scale: isLast ? 1 : 0.98,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                    className="absolute left-0 right-0 flex items-start gap-3 px-4 sm:px-6"
                    style={{ bottom: (arr.length - 1 - i) * 74 }}
                  >
                    <Avatar className="size-10 shrink-0 border border-white/20">
                      <AvatarImage src={avatarUrl(juror)} alt={juror.name} />
                      <AvatarFallback>{juror.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {line.speaker ?? juror.name}
                        </span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest ${
                            line.phase === "trial"
                              ? "bg-amber-500/15 text-amber-300"
                              : "bg-blue-500/15 text-blue-300"
                          }`}
                        >
                          {line.phase}
                        </span>
                      </div>
                      <span className="text-sm leading-snug text-white/85">
                        {line.line}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
