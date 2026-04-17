"use client";

import Link from "next/link";
import { Scale, Flame, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FooterCTA() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-gradient-to-b from-transparent via-black/40 to-black">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 safe-x sm:py-24">
        <div className="relative mx-auto max-w-3xl text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-20 -z-10"
            style={{
              background:
                "radial-gradient(500px 250px at 50% 50%, rgba(255,180,80,0.12), transparent 70%)",
            }}
          />
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">
            the court awaits
          </p>
          <h2 className="mt-3 font-heading text-4xl font-black tracking-tight text-white sm:text-6xl">
            Got beef?
          </h2>
          <p className="mt-4 text-base text-white/60">
            File it. A jury of fifteen is waiting.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="group h-14 rounded-full px-7 text-base font-semibold shadow-[0_0_40px_-10px_theme(colors.primary/60)]"
            >
              <Link href="/case/new?mode=petty">
                <Flame className="size-5" />
                Petty case
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 rounded-full border-white/15 bg-white/5 px-7 text-base font-semibold backdrop-blur hover:bg-white/10"
            >
              <Link href="/case/new?mode=real">
                <Scale className="size-5" />
                Real case
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-14 rounded-full px-5 text-base font-semibold text-white/70 hover:bg-white/5 hover:text-white"
            >
              <Link href="/join">
                <Eye className="size-5" />
                Watch a case
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/50 sm:flex-row">
          <div className="flex items-center gap-2 font-semibold text-white/70">
            <Scale className="size-4" />
            Gavel · settle it in court
          </div>
          <div className="flex items-center gap-4">
            <Link href="/join" className="hover:text-white">
              Join / Spectate
            </Link>
            <Link href="#faq" className="hover:text-white">
              FAQ
            </Link>
            <a
              href="https://github.com/egiday/gavel"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              Source
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
