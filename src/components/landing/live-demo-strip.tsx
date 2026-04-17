"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarUrl, getJuror } from "@/lib/jurors";

type Line = {
  jurorId: string;
  line: string;
};

const SCRIPT: Line[] = [
  { jurorId: "judge-marlowe", line: "Court is in session. Plaintiff alleges the defendant ate her leftovers." },
  { jurorId: "auntie-rue", line: "Baby, you do NOT eat another grown woman's pad thai without asking." },
  { jurorId: "the-intern", line: "literally the way he didn't even leave a note" },
  { jurorId: "nina", line: "NO BECAUSE— that container had her NAME on it. with a sharpie." },
  { jurorId: "professor-kline", line: "Consider: does an unmarked fridge shelf imply communal use?" },
  { jurorId: "ghost", line: "lol imagine lawyering up over noodles. both guilty of being dramatic." },
  { jurorId: "judge-marlowe", line: "Jury, please restrict commentary to the matter at hand." },
  { jurorId: "sasha", line: "the AUDACITY. the ABSOLUTE AUDACITY to leave the empty container in the sink." },
];

export function LiveDemoStrip() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SCRIPT.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 safe-x sm:py-16">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            live demo · petty v. anonymous
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">The jury doesn&rsquo;t whisper.</h2>
        </div>
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
          <span className="relative inline-flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span>case #ptl-4432 · 5 jurors · turn {idx + 1}/{SCRIPT.length}</span>
        </div>

        <div className="relative h-[280px] overflow-hidden sm:h-[320px]">
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
                  className="absolute left-0 right-0 flex gap-3 px-4"
                  style={{ bottom: (arr.length - 1 - i) * 68 }}
                >
                  <Avatar className="size-10 shrink-0 border">
                    <AvatarImage src={avatarUrl(juror)} alt={juror.name} />
                    <AvatarFallback>{juror.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-xs font-semibold">{juror.name}</span>
                    <span className="text-sm leading-snug">{line.line}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </Card>
    </section>
  );
}
