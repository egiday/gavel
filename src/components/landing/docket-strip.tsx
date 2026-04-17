"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "jurors empaneled", value: "15", suffix: "" },
  { label: "turns per trial", value: "12", suffix: "+" },
  { label: "lawyer archetypes", value: "4", suffix: "" },
  { label: "verdict time", value: "90", suffix: "s" },
];

export function DocketStrip() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 safe-x sm:py-14">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5 sm:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="relative flex flex-col gap-1 bg-background px-4 py-6 sm:px-6 sm:py-8"
          >
            <span className="font-heading text-4xl font-black tracking-tight text-white sm:text-5xl">
              {s.value}
              <span className="text-primary">{s.suffix}</span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
              {s.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
