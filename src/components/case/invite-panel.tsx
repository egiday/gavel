"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Check,
  Copy,
  MessageSquareText,
  QrCode,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { CasePayload } from "@/lib/types";

interface Props {
  caseData: CasePayload;
  onStartSolo?: () => void;
}

export function InvitePanel({ caseData, onStartSolo }: Props) {
  const joinUrl = useMemo(() => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    return `${origin}/join/${caseData.shareCode}`;
  }, [caseData.shareCode]);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const pitchLine =
    caseData.mode === "petty"
      ? `I'm taking you to court \u{1F468}\u200D\u2696\uFE0F Defend yourself:`
      : `Filed a case at Gavel. Your side:`;
  const fullMessage = `${pitchLine} ${joinUrl}`;

  async function copyLink() {
    await navigator.clipboard.writeText(fullMessage);
    setCopiedLink(true);
    toast.success("Invite copied — paste it in the group chat");
    setTimeout(() => setCopiedLink(false), 1500);
  }
  async function copyCode() {
    await navigator.clipboard.writeText(caseData.shareCode);
    setCopiedCode(true);
    toast.success("Code copied");
    setTimeout(() => setCopiedCode(false), 1500);
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: `Gavel v. ${caseData.title}`,
          text: pitchLine,
          url: joinUrl,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      copyLink();
    }
  }

  const imessageHref = `sms:&body=${encodeURIComponent(fullMessage)}`;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Summon the defendant
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Share the code or link. They&rsquo;ll read your side, then write theirs.
        </p>
      </div>

      <Card className="relative overflow-hidden p-6">
        <div className="flex flex-col items-center gap-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            case code
          </div>
          <button
            onClick={copyCode}
            className="group inline-flex items-center gap-2 font-mono text-5xl font-black tracking-widest transition-colors hover:text-primary sm:text-6xl"
            aria-label="Copy code"
          >
            {caseData.shareCode}
            {copiedCode ? (
              <Check className="size-5 text-primary" />
            ) : (
              <Copy className="size-5 opacity-40 transition-opacity group-hover:opacity-100" />
            )}
          </button>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <Button className="h-11 w-full rounded-full sm:w-auto" onClick={nativeShare}>
              <Share2 className="size-4" /> Share invite
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full rounded-full sm:w-auto"
              asChild
            >
              <a href={imessageHref}>
                <MessageSquareText className="size-4" /> iMessage
              </a>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-11 w-full rounded-full sm:w-auto">
                  <QrCode className="size-4" /> QR
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xs">
                <DialogHeader>
                  <DialogTitle className="text-center">Scan to join</DialogTitle>
                </DialogHeader>
                <div className="mx-auto rounded-2xl bg-white p-4">
                  <QRCodeSVG value={joinUrl} size={200} includeMargin />
                </div>
                <p className="text-center font-mono text-xs text-muted-foreground">
                  {joinUrl}
                </p>
              </DialogContent>
            </Dialog>
          </div>

          <button
            onClick={copyLink}
            className="group mt-2 flex w-full items-center justify-between gap-3 rounded-xl border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted"
          >
            <span className="truncate">{joinUrl}</span>
            {copiedLink ? (
              <Check className="size-4 shrink-0 text-primary" />
            ) : (
              <Copy className="size-4 shrink-0 opacity-60 group-hover:opacity-100" />
            )}
          </button>
        </div>
      </Card>

      {onStartSolo && (
        <div className="text-center">
          <Button
            variant="ghost"
            className="rounded-full text-sm text-muted-foreground hover:text-foreground"
            onClick={onStartSolo}
          >
            <Sparkles className="size-4" /> Run solo instead — AI plays the defendant
          </Button>
        </div>
      )}
    </div>
  );
}
