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
        <p className="gv-mono-label">summon the defendant</p>
        <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Drop the code. Watch them join.
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Share the six-character code or the link. They read your side, file theirs.
        </p>
      </div>

      <div className="gv-card relative overflow-hidden rounded-3xl p-6 sm:p-8">
        {/* ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-10 -top-20 h-48 opacity-60"
          style={{
            background:
              "radial-gradient(600px 200px at 50% 0%, rgba(255,180,80,0.15), transparent 70%)",
          }}
        />

        <div className="relative flex flex-col items-center gap-5">
          <div className="gv-mono-label">case code</div>
          <button
            onClick={copyCode}
            className="group inline-flex items-center gap-3 font-mono text-5xl font-black tracking-[0.3em] text-white transition-colors hover:text-primary sm:text-6xl"
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
            <Button
              className="h-11 w-full rounded-full gv-glow sm:w-auto"
              onClick={nativeShare}
            >
              <Share2 className="size-4" /> Share invite
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full rounded-full border-white/15 bg-white/5 sm:w-auto"
              asChild
            >
              <a href={imessageHref}>
                <MessageSquareText className="size-4" /> iMessage
              </a>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-full border-white/15 bg-white/5 sm:w-auto"
                >
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
            className="group mt-2 flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-white/60 transition-colors hover:bg-white/[0.06]"
          >
            <span className="truncate">{joinUrl}</span>
            {copiedLink ? (
              <Check className="size-4 shrink-0 text-primary" />
            ) : (
              <Copy className="size-4 shrink-0 opacity-60 group-hover:opacity-100" />
            )}
          </button>
        </div>
      </div>

      {onStartSolo && (
        <div className="text-center">
          <Button
            variant="ghost"
            className="rounded-full text-sm text-white/60 hover:bg-white/5 hover:text-white"
            onClick={onStartSolo}
          >
            <Sparkles className="size-4" /> Run solo instead — AI plays the defendant
          </Button>
        </div>
      )}
    </div>
  );
}
