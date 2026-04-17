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
    q: "Is the deliberation scripted?",
    a: "No. Every juror is a live Anthropic call, streaming in real time, seeing what the jurors before them said. They genuinely disagree.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="mx-auto w-full max-w-3xl px-4 py-16 safe-x sm:py-24">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          frequently asked
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Questions the defense raised.
        </h2>
      </div>

      <Accordion className="mt-8 w-full">
        {faqs.map((f, i) => (
          <AccordionItem key={f.q} value={`item-${i}`}>
            <AccordionTrigger className="text-left text-base font-semibold">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
