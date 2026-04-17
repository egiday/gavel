"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { avatarUrl, JURORS } from "@/lib/jurors";

export function JuryGrid() {
  return (
    <section id="jury" className="mx-auto w-full max-w-6xl px-4 py-16 safe-x sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">
          the bench · fifteen personas · five per case
        </p>
        <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Meet the jury.
        </h2>
        <p className="mt-3 text-sm text-white/60 sm:text-base">
          Randomly empaneled for every trial. Each talks in their own voice.
          Each actually disagrees.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {JURORS.map((j, i) => (
          <motion.div
            key={j.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: (i % 5) * 0.05, duration: 0.4 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-4 text-center"
          >
            {/* color wash on hover */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(120% 60% at 50% 0%, rgba(255,180,80,0.18), transparent 60%)",
              }}
            />
            <Avatar className="mx-auto size-16 border-2 border-white/10">
              <AvatarImage src={avatarUrl(j)} alt={j.name} />
              <AvatarFallback>{j.name[0]}</AvatarFallback>
            </Avatar>
            <div className="relative mt-3 font-semibold text-white">{j.name}</div>
            <div className="relative mt-0.5 line-clamp-2 text-xs text-white/55">
              {j.tagline}
            </div>
            <div className="relative mt-2 flex flex-wrap justify-center gap-1">
              {j.modes.map((m) => (
                <Badge
                  key={m}
                  variant="secondary"
                  className="rounded-full border-white/10 bg-white/5 text-[9px] uppercase tracking-widest"
                >
                  {m}
                </Badge>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
