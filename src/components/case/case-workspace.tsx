"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InvitePanel } from "@/components/case/invite-panel";
import { LawyerPicker } from "@/components/case/lawyer-picker";
import { DeliberationView } from "@/components/case/deliberation-view";
import { VerdictCard } from "@/components/case/verdict-card";
import { ChatPanel } from "@/components/case/chat-panel";
import { JURORS, avatarUrl } from "@/lib/jurors";
import type {
  CasePayload,
  DeliberationMessage,
  VerdictRecord,
} from "@/lib/types";

interface Props {
  caseData: CasePayload;
  messages: DeliberationMessage[];
  verdict: VerdictRecord | null;
  youRole: "plaintiff" | "defendant" | null;
}

export function CaseWorkspace(props: Props) {
  const [caseData, setCaseData] = useState(props.caseData);
  const [verdict, setVerdict] = useState(props.verdict);
  const [messages, setMessages] = useState<DeliberationMessage[]>(
    props.messages,
  );
  const youRole = props.youRole;
  const isSpectator = youRole === null;
  const outerThemeClass = caseData.mode === "petty" ? "mode-petty dark" : "mode-real";

  useEffect(() => {
    // poll for updates — status changes, lawyer picks, streamed messages,
    // and the final verdict. spectators lean on this to follow the case.
    const hasVerdict = caseData.status === "verdict" && !!verdict;
    if (hasVerdict) return;
    const interval = isSpectator ? 3000 : 5000;
    const t = setInterval(async () => {
      const res = await fetch(`/api/cases/${caseData.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setCaseData(data);
      if (Array.isArray(data.messages)) {
        setMessages(
          data.messages.map((m: DeliberationMessage & { createdAt: string | Date }) => ({
            ...m,
            createdAt:
              typeof m.createdAt === "string"
                ? m.createdAt
                : new Date(m.createdAt).toISOString(),
          })),
        );
      }
      if (data.verdict) setVerdict(data.verdict);
    }, interval);
    return () => clearInterval(t);
  }, [caseData.id, caseData.status, verdict, isSpectator]);

  function handleLawyerPicked(updated: CasePayload) {
    setCaseData(updated);
  }
  function handleVerdict(v: VerdictRecord) {
    setVerdict(v);
  }

  const awaitingDefendant = caseData.status === "awaiting_defendant";
  const needsLawyerPick = needsPickFor(caseData, youRole);
  const waitingOnCounterparty = isWaitingOnOtherSide(caseData, youRole);
  const showingDeliberation =
    !awaitingDefendant && !needsLawyerPick && !waitingOnCounterparty;

  const jury = JURORS.filter((j) => caseData.jurorIds.includes(j.id));

  return (
    <div className={`relative flex min-h-dvh flex-col bg-background text-foreground ${outerThemeClass}`}>
      <div className="gv-spotlight" />

      <header className="sticky top-0 z-20 safe-top border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between gap-3 px-4 safe-x">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ChevronLeft className="size-4" /> Home
            </Link>
          </Button>
          <div className="min-w-0 flex-1 truncate text-center font-heading text-sm font-bold tracking-tight text-white">
            {caseData.title}
          </div>
          <div className="w-20 text-right font-mono text-[10px] uppercase tracking-widest text-white/50">
            #{caseData.shareCode}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pb-10 pt-6 safe-x">
        {/* jury strip */}
        <div className="gv-card mb-5 rounded-3xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="gv-mono-label inline-flex items-center gap-2">
              <Users className="size-3.5" /> empaneled jury
            </div>
            <span className="font-mono text-xs text-white/50">
              {jury.length}/5 sworn
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {jury.map((j) => (
              <div
                key={j.id}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3"
              >
                <Avatar className="size-6">
                  <AvatarImage src={avatarUrl(j)} alt={j.name} />
                  <AvatarFallback>{j.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold text-white">{j.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* the main stage */}
        {verdict && caseData.status === "verdict" ? (
          <VerdictCard caseData={caseData} verdict={verdict} />
        ) : isSpectator && awaitingDefendant ? (
          <div className="gv-card rounded-3xl p-8 text-center">
            <FileText className="mx-auto size-10 text-white/40" />
            <h2 className="mt-4 font-heading text-2xl font-bold text-white">
              Case filed — defendant hasn&rsquo;t responded yet
            </h2>
            <p className="mt-2 text-sm text-white/60">
              This page will update automatically as the parties file.
            </p>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-white/50">
              code · {caseData.shareCode}
            </p>
          </div>
        ) : isSpectator ? (
          <DeliberationView
            caseData={caseData}
            initialMessages={messages}
            initialVerdict={verdict}
            onVerdict={handleVerdict}
            spectator
          />
        ) : awaitingDefendant && youRole !== "defendant" ? (
          <InvitePanel caseData={caseData} />
        ) : awaitingDefendant && youRole === "defendant" ? (
          <div className="gv-card rounded-3xl p-8 text-center">
            <FileText className="mx-auto size-10 text-white/40" />
            <h2 className="mt-4 font-heading text-2xl font-bold text-white">
              Defend your side
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Head to the defendant form to file your response.
            </p>
            <Button asChild className="mt-5 rounded-full">
              <Link href={`/join/${caseData.shareCode}`}>Go to defendant form</Link>
            </Button>
          </div>
        ) : needsLawyerPick && youRole ? (
          <LawyerPicker
            caseData={caseData}
            side={youRole}
            onPicked={handleLawyerPicked}
          />
        ) : waitingOnCounterparty ? (
          <div className="gv-card rounded-3xl p-8 text-center">
            <p className="font-heading text-2xl font-bold text-white">
              Waiting on the other side…
            </p>
            <p className="mt-2 text-sm text-white/60">
              They still need to pick self-defense or counsel before trial begins.
            </p>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-white/50">
              this page updates automatically
            </p>
          </div>
        ) : (
          <DeliberationView
            caseData={caseData}
            initialMessages={messages}
            initialVerdict={verdict}
            onVerdict={handleVerdict}
          />
        )}

        {/* case context footer */}
        {showingDeliberation && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="gv-card rounded-2xl p-4">
              <div className="gv-mono-label">plaintiff filed</div>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                {caseData.plaintiffSide}
              </p>
            </div>
            <div className="gv-card rounded-2xl p-4">
              <div className="gv-mono-label">defendant filed</div>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                {caseData.defendantSide ??
                  (caseData.absentDefendant
                    ? "The defendant is absent. A devil's advocate steelmans their position."
                    : "Defendant has not yet filed a response.")}
              </p>
            </div>
          </div>
        )}

        {/* peanut gallery chat — available from in_session onward */}
        {caseData.status !== "awaiting_defendant" && (
          <div className="mt-6">
            <ChatPanel caseId={caseData.id} defaultOpen={isSpectator} />
          </div>
        )}
      </main>
    </div>
  );
}

// in solo mode the plaintiff wrote both sides (or the defendant is absent)
// so only one lawyer pick is ever required — the plaintiff's.
function needsPickFor(
  caseData: CasePayload,
  youRole: "plaintiff" | "defendant" | null,
): boolean {
  if (caseData.status !== "in_session") return false;
  if (!youRole) return false;
  if (youRole === "plaintiff") return caseData.plaintiffLawyer === null;
  if (youRole === "defendant") {
    if (caseData.isSolo) return false; // solo = plaintiff picks once
    return caseData.defendantLawyer === null;
  }
  return false;
}

function isWaitingOnOtherSide(
  caseData: CasePayload,
  youRole: "plaintiff" | "defendant" | null,
): boolean {
  if (caseData.status !== "in_session") return false;
  if (caseData.isSolo) return false; // solo never waits on another party
  if (!youRole) return false;
  if (youRole === "plaintiff") {
    return (
      caseData.plaintiffLawyer !== null &&
      caseData.defendantLawyer === null
    );
  }
  if (youRole === "defendant") {
    return (
      caseData.defendantLawyer !== null &&
      caseData.plaintiffLawyer === null
    );
  }
  return false;
}
