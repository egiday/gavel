"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NavHeader() {
  return (
    <header className="sticky top-0 z-40 safe-top border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 safe-x">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="relative flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Scale className="size-4" aria-hidden />
          </span>
          <span className="font-heading text-lg">Gavel</span>
          <span className="ml-1 rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white/60">
            v1
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="#jury">The Jury</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="#how">How it works</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="#faq">FAQ</Link>
          </Button>
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden sm:inline-flex"
          >
            <Link href="/join">Join / Watch</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/case/new">File a case</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
