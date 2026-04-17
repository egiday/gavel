"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is this real legal advice?",
    a: "Absolutely not. Gavel is entertainment and group-chat conflict resolution. For actual disputes involving money, safety, or the law, talk to an actual lawyer.",
  },
  {
    q: "Do you store my data?",
    a: "Case text lives in a local database so the other party can join. Your Anthropic API key is stored only in your browser — we never send it to our servers. You can delete a case any time.",
  },
  {
    q: "Can I appeal the verdict?",
    a: "Not in the MVP. The jury is final. You're welcome to file a new case if the vibe shifts.",
  },
  {
    q: "Why bring my own API key?",
    a: "AI deliberation is expensive to run well. Your key runs your own case — no throttling, no shared quota, no incentive for us to make the jury generic. Grab one at console.anthropic.com.",
  },
  {
    q: "Can the defendant refuse to join?",
    a: "Yes. You can run solo — write both sides yourself, or pick 'they're not here to defend themselves' and an AI plays devil's advocate for the absent party.",
  },
  {
    q: "What happens during the trial vs. deliberation?",
    a: "The trial is lawyers (or self-reps) arguing live while the jury listens silently. Once counsel rests, the jury retires and deliberates among themselves — no lawyers, no parties — before each juror votes.",
  },
  {
    q: "Can people watch without joining?",
    a: "Yes. From /join you can choose 'Spectate' and just watch the trial unfold. Spectators can also chat live in the peanut gallery during the case.",
  },
];

export function FAQSection() {
  return (
    <section
      id="faq"
      className="mx-auto w-full max-w-3xl px-4 py-16 safe-x sm:py-24"
    >
      <div className="text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">
          frequently asked
        </p>
        <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Questions the defense raised.
        </h2>
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent">
        <Accordion className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`} className="border-white/10 px-5 py-1">
              <AccordionTrigger className="text-left text-base font-semibold text-white">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-white/70">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
