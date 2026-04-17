"use client";

import { useState } from "react";
import { Scale, UserRound, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LAWYERS, lawyerAvatarUrl } from "@/lib/lawyers";
import { toast } from "sonner";
import type { CasePayload } from "@/lib/types";

interface Props {
  caseData: CasePayload;
  side: "plaintiff" | "defendant";
  onPicked: (updated: CasePayload) => void;
}

const SELF = "__self__";

export function LawyerPicker({ caseData, side, onPicked }: Props) {
  const currentValue =
    (side === "plaintiff" ? caseData.plaintiffLawyer : caseData.defendantLawyer) ??
    "";
  const [selected, setSelected] = useState<string>(currentValue || SELF);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}/lawyer`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          side,
          lawyerId: selected === SELF ? "self" : selected,
        }),
      });
      if (!res.ok) {
        toast.error("Couldn't save your pick");
        return;
      }
      const updated: CasePayload = await res.json();
      onPicked(updated);
      toast.success(selected === SELF ? "Self-defense locked in" : "Counsel retained");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="gv-mono-label">pick your counsel</p>
        <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {side === "plaintiff" ? "Your counsel" : "Defendant's counsel"}
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Defend yourself, or let an AI lawyer argue on your behalf.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Option
          active={selected === SELF}
          onClick={() => setSelected(SELF)}
          avatar={
            <div className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white">
              <UserRound className="size-5" />
            </div>
          }
          title="Defend yourself"
          tagline="Your own words go straight to the jury."
        />

        {LAWYERS.map((l) => (
          <Option
            key={l.id}
            active={selected === l.id}
            onClick={() => setSelected(l.id)}
            avatar={
              <Avatar className="size-12 border-2 border-white/10">
                <AvatarImage src={lawyerAvatarUrl(l)} alt={l.name} />
                <AvatarFallback>{l.name[0]}</AvatarFallback>
              </Avatar>
            }
            title={l.name}
            tagline={l.tagline}
          />
        ))}
      </div>

      <Button
        size="lg"
        className="h-12 w-full rounded-full gv-glow text-base font-semibold"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Saving…
          </>
        ) : (
          <>
            <Scale className="size-4" /> Lock in
          </>
        )}
      </Button>
    </div>
  );
}

function Option({
  active,
  onClick,
  avatar,
  title,
  tagline,
}: {
  active: boolean;
  onClick: () => void;
  avatar: React.ReactNode;
  title: string;
  tagline: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
        active
          ? "border-primary/60 bg-primary/10 shadow-[0_0_30px_-10px_theme(colors.primary/60)]"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      {avatar}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="truncate text-xs text-white/55">{tagline}</div>
      </div>
      {active && (
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3" />
        </div>
      )}
    </button>
  );
}
