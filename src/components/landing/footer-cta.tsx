"use client";

import Link from "next/link";
import { Scale, Flame, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FooterCTA() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 safe-x sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-4xl font-black tracking-tight sm:text-5xl">
            Got beef?
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            File it. A jury of fifteen is waiting.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="group h-12 rounded-full px-6 text-base font-semibold">
              <Link href="/case/new?mode=petty">
                <Flame className="size-5" />
                Petty case
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6 text-base font-semibold">
              <Link href="/case/new?mode=real">
                <Scale className="size-5" />
                Real case
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2 font-semibold">
            <Scale className="size-4" />
            Gavel · settle it in court
          </div>
          <div className="flex items-center gap-4">
            <Link href="/join" className="hover:text-foreground">Join a case</Link>
            <Link href="#faq" className="hover:text-foreground">FAQ</Link>
            <a href="https://github.com/egiday/gavel" target="_blank" rel="noreferrer" className="hover:text-foreground">
              Source
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
