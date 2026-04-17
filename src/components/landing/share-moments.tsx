"use client";

import { motion } from "framer-motion";
import { Gavel, Heart, MessageCircle, Share2 } from "lucide-react";

type MockCard = {
  mode: "petty" | "real";
  title: string;
  ruling: string;
  quote: string;
  vote: string;
};

const cards: MockCard[] = [
  {
    mode: "petty",
    title: "The Pad Thai Incident",
    ruling: "FOR THE PLAINTIFF",
    quote:
      "\"Baby, you don't eat another grown woman's leftovers. That's just common sense.\"",
    vote: "5-0",
  },
  {
    mode: "real",
    title: "Rent vs. Graduation Timeline",
    ruling: "Revisit the arrangement",
    quote:
      "\"A friendship can survive renegotiation. It rarely survives resentment.\"",
    vote: "4-1",
  },
  {
    mode: "petty",
    title: "Who Ghosted First",
    ruling: "DISMISSED — both of you.",
    quote: "\"lol imagine lawyering up over three-day response times.\"",
    vote: "3-2",
  },
];

export function ShareMoments() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 safe-x sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          share-worthy
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Built for the group chat.
        </h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Every verdict ships with an auto-generated share card. iMessage unfurls it.
          Twitter posts it clean. Discord eats it up.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className={`group relative rounded-3xl p-5 shadow-xl ${
              c.mode === "petty" ? "mode-petty dark" : "mode-real"
            } bg-background text-foreground border`}
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider">
                <Gavel className="size-3.5" /> Gavel verdict
              </span>
              <span className="rounded-full border px-2 py-0.5">{c.vote}</span>
            </div>
            <h3 className="mt-3 font-heading text-xl font-semibold leading-tight">{c.title}</h3>
            <div className="mt-4 rounded-2xl border bg-card p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                ruling
              </span>
              <p className="mt-1 font-heading text-base font-bold">{c.ruling}</p>
            </div>
            <p className="mt-4 text-sm italic leading-relaxed text-muted-foreground">{c.quote}</p>
            <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Heart className="size-3.5" /> 128
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="size-3.5" /> 24
              </span>
              <span className="ml-auto inline-flex items-center gap-1">
                <Share2 className="size-3.5" /> share
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
