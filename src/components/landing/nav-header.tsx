"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NavHeader() {
  return (
    <header className="sticky top-0 z-40 safe-top border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 safe-x">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Scale className="size-5" aria-hidden />
          <span className="text-lg">Gavel</span>
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
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/join">Join case</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/case/new">File a case</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
