"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ScanLine, Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type Intent = "defend" | "spectate";

export default function JoinPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState<Intent>("defend");
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
      if (intent === "spectate") router.push(`/case/${c}`);
      else router.push(`/join/${c}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-background text-foreground">
      <div className="gv-spotlight" />

      <header className="sticky top-0 z-20 safe-top border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4 safe-x">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ChevronLeft className="size-4" /> Home
            </Link>
          </Button>
          <h1 className="font-heading text-base font-bold text-white">Join a case</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-10 safe-x">
        <div className="mb-6 text-center">
          <p className="gv-mono-label">the gallery is open</p>
          <h2 className="mt-3 font-heading text-3xl font-black tracking-tight text-white sm:text-4xl">
            Step inside the courtroom.
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Six characters. Defend yourself, or watch from the gallery.
          </p>
        </div>

        <div className="gv-card w-full rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <ScanLine className="size-6" />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Tabs value={intent} onValueChange={(v) => setIntent(v as Intent)}>
              <TabsList className="grid h-11 w-full grid-cols-2 rounded-full border border-white/10 bg-white/5">
                <TabsTrigger
                  value="defend"
                  className="rounded-full text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow"
                >
                  <Shield className="size-4" /> Defend
                </TabsTrigger>
                <TabsTrigger
                  value="spectate"
                  className="rounded-full text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow"
                >
                  <Eye className="size-4" /> Spectate
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-center text-xs text-white/55">
              {intent === "defend"
                ? "File your response and argue in court."
                : "Watch the trial unfold. Chat with other spectators live."}
            </p>

            <Label htmlFor="code" className="sr-only">
              Case code
            </Label>
            <Input
              id="code"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="h-14 border-white/15 bg-white/5 text-center font-mono text-2xl font-black tracking-[0.4em] text-white"
            />
            <Button
              className="h-12 w-full rounded-full gv-glow text-base font-semibold"
              onClick={handleJoin}
              disabled={loading || code.length !== 6}
            >
              {loading
                ? "Checking…"
                : intent === "defend"
                  ? "Continue to defend"
                  : "Continue to watch"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
