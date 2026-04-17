"use client";

import { motion } from "framer-motion";
import { PencilLine, Users, Gavel } from "lucide-react";

const steps = [
  {
    icon: PencilLine,
    title: "File your case",
    body: "Pick Petty or Real. Write your side. Share a code or drag the other person in.",
  },
  {
    icon: Users,
    title: "Jury deliberates",
    body: "Five random jurors from a roster of fifteen argue it out live. They quote each other. They disagree.",
  },
  {
    icon: Gavel,
    title: "Verdict drops",
    body: "Majority rules. Votes with reasoning. Shareable card built for the group chat.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto w-full max-w-6xl px-4 py-16 safe-x sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          how it works
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Three steps to a verdict.
        </h2>
      </div>

      <ol className="mt-12 grid gap-4 sm:grid-cols-3 sm:gap-6">
        {steps.map((step, i) => (
          <motion.li
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * 0.12, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative flex flex-col rounded-3xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="size-5" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                step {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
