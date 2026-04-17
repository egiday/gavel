"use client";

import { motion } from "framer-motion";
import { FileText, Scale, Users, Gavel } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "File your case",
    body:
      "Pick Petty or Real. Write your side. Share a code — or drag the other person in with a link.",
    sticker: "01",
  },
  {
    icon: Scale,
    title: "Trial goes live",
    body:
      "Each side gets a lawyer (or defends themselves). They argue, press, rebut. The jury watches silently.",
    sticker: "02",
  },
  {
    icon: Users,
    title: "Jury deliberates",
    body:
      "Lawyers dismissed. Five jurors take the room — agree, disagree, reference the trial, push back.",
    sticker: "03",
  },
  {
    icon: Gavel,
    title: "Verdict drops",
    body:
      "Votes with reasoning. Majority rules. A shareable card built for the group chat.",
    sticker: "04",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto w-full max-w-6xl px-4 py-16 safe-x sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">
          how it works
        </p>
        <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-5xl">
          From filing to verdict in four acts.
        </h2>
      </div>

      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <motion.li
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              delay: i * 0.08,
              duration: 0.5,
              ease: [0.2, 0.8, 0.2, 1],
            }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 sm:p-6"
          >
            {/* the sticker */}
            <span className="pointer-events-none absolute -right-2 -top-2 select-none font-heading text-[110px] font-black leading-none tracking-tighter text-white/[0.04] sm:text-[160px]">
              {step.sticker}
            </span>
            <div className="relative">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <step.icon className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-white/60">
                {step.body}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
