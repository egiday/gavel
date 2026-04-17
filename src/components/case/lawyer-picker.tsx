"use client";

import { useState } from "react";
import { Scale, UserRound, Check, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
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
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {side === "plaintiff" ? "Your counsel" : "Defendant's counsel"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Defend yourself, or let an AI lawyer argue on your behalf.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* self-defense option */}
        <Option
          active={selected === SELF}
          onClick={() => setSelected(SELF)}
          avatar={
            <div className="flex size-12 items-center justify-center rounded-full border bg-muted">
              <UserRound className="size-5" />
            </div>
          }
          title="Defend yourself"
          tagline="Your own words go straight to the jury."
        />

        {/* AI lawyers */}
        {LAWYERS.map((l) => (
          <Option
            key={l.id}
            active={selected === l.id}
            onClick={() => setSelected(l.id)}
            avatar={
              <Avatar className="size-12 border">
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
        className="h-12 w-full rounded-full text-base font-semibold"
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
      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
        active ? "border-primary bg-primary/5 shadow-sm" : "hover:bg-muted"
      }`}
    >
      {avatar}
      <div className="flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{tagline}</div>
      </div>
      {active && (
        <Card className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3" />
        </Card>
      )}
    </button>
  );
}
