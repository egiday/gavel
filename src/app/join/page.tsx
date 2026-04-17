"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function JoinPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleJoin() {
    const c = code.trim().toUpperCase();
    if (c.length !== 6) {
      toast.error("Codes are 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/by-code/${c}`);
      if (!res.ok) {
        toast.error("No case matching that code");
        return;
      }
      router.push(`/join/${c}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 safe-top border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4 safe-x">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ChevronLeft className="size-4" /> Home
            </Link>
          </Button>
          <h1 className="font-heading text-base font-bold">Join a case</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 safe-x">
        <Card className="w-full p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ScanLine className="size-6" />
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold">Enter the case code</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Six characters. They should&rsquo;ve texted it to you.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <Label htmlFor="code" className="sr-only">Case code</Label>
            <Input
              id="code"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="h-14 text-center font-mono text-2xl font-black tracking-[0.4em]"
            />
            <Button
              className="h-12 w-full rounded-full text-base font-semibold"
              onClick={handleJoin}
              disabled={loading || code.length !== 6}
            >
              {loading ? "Checking…" : "Continue"}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
