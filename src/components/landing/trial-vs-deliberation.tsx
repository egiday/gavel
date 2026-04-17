"use client";

import { motion } from "framer-motion";
import { Scale, Users, EyeOff, MessageSquare } from "lucide-react";

const panels = [
  {
    phase: "Trial",
    tagline: "Lawyers argue. The jury watches, silent.",
    icon: Scale,
    bullets: [
      { icon: MessageSquare, text: "Openings from both sides of counsel" },
      { icon: MessageSquare, text: "Rebuttals and cross — real courtroom tempo" },
      { icon: EyeOff, text: "Jurors present but cannot speak yet" },
    ],
    color: "amber",
  },
  {
    phase: "Deliberation",
    tagline: "Jurors alone. No lawyers, no parties.",
    icon: Users,
    bullets: [
      { icon: MessageSquare, text: "Jurors respond to each other in character" },
      { icon: MessageSquare, text: "They quote the trial and push back" },
      { icon: MessageSquare, text: "Votes get cast. Verdict is synthesized." },
    ],
    color: "blue",
  },
];

export function TrialVsDeliberation() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 safe-x sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">
          two phases
        </p>
        <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-5xl">
          A real court, sped up.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
          Arguments happen first. The jury sits quiet, takes it in. When
          counsel&rsquo;s done, the doors close and the jurors go at it alone.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {panels.map((p, i) => {
          const accentText =
            p.color === "amber" ? "text-amber-300" : "text-blue-300";
          const accentBg =
            p.color === "amber" ? "bg-amber-500/15" : "bg-blue-500/15";
          const accentBar =
            p.color === "amber" ? "bg-amber-400" : "bg-blue-400";
          return (
            <motion.div
              key={p.phase}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 sm:p-8"
            >
              <span
                className={`absolute left-0 top-0 h-full w-1 ${accentBar}`}
                aria-hidden
              />
              <div className={`inline-flex items-center gap-2 rounded-full ${accentBg} px-3 py-1 text-xs font-semibold uppercase tracking-widest ${accentText}`}>
                <p.icon className="size-3.5" />
                Phase · {p.phase}
              </div>
              <h3 className="mt-4 font-heading text-2xl font-bold text-white sm:text-3xl">
                {p.tagline}
              </h3>
              <ul className="mt-6 space-y-3">
                {p.bullets.map((b) => (
                  <li key={b.text} className="flex items-start gap-3 text-sm text-white/70">
                    <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md ${accentBg} ${accentText}`}>
                      <b.icon className="size-3.5" />
                    </span>
                    <span>{b.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
