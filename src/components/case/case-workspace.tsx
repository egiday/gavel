"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InvitePanel } from "@/components/case/invite-panel";
import { LawyerPicker } from "@/components/case/lawyer-picker";
import { DeliberationView } from "@/components/case/deliberation-view";
import { VerdictCard } from "@/components/case/verdict-card";
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
    <div className={`flex min-h-dvh flex-col bg-background text-foreground ${outerThemeClass}`}>
      <header className="sticky top-0 z-20 safe-top border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4 safe-x">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ChevronLeft className="size-4" /> Home
            </Link>
          </Button>
          <div className="flex-1 truncate text-center font-heading text-sm font-bold tracking-tight">
            {caseData.title}
          </div>
          <div className="w-16 text-right text-xs font-mono text-muted-foreground">
            #{caseData.shareCode}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pb-10 pt-6 safe-x">
        {/* jury strip */}
        <div className="mb-5 rounded-3xl border bg-card p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Users className="size-3.5" /> empaneled jury
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {jury.length}/5
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {jury.map((j) => (
              <div
                key={j.id}
                className="flex items-center gap-2 rounded-full border bg-background py-1 pl-1 pr-3"
              >
                <Avatar className="size-6">
                  <AvatarImage src={avatarUrl(j)} alt={j.name} />
                  <AvatarFallback>{j.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold">{j.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* the main stage */}
        {verdict && caseData.status === "verdict" ? (
          <VerdictCard caseData={caseData} verdict={verdict} />
        ) : isSpectator && awaitingDefendant ? (
          <Card className="p-6 text-center">
            <FileText className="mx-auto size-10 text-muted-foreground" />
            <h2 className="mt-3 font-heading text-2xl font-bold">
              Case filed — defendant hasn&rsquo;t responded yet
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This page will update automatically as the parties file.
            </p>
            <p className="mt-4 text-xs font-mono text-muted-foreground">
              code · {caseData.shareCode}
            </p>
          </Card>
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
          <Card className="p-6 text-center">
            <FileText className="mx-auto size-10 text-muted-foreground" />
            <h2 className="mt-3 font-heading text-2xl font-bold">
              Defend your side
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Head to the defendant form to file your response.
            </p>
            <Button asChild className="mt-4 rounded-full">
              <Link href={`/join/${caseData.shareCode}`}>Go to defendant form</Link>
            </Button>
          </Card>
        ) : needsLawyerPick && youRole ? (
          <LawyerPicker
            caseData={caseData}
            side={youRole}
            onPicked={handleLawyerPicked}
          />
        ) : waitingOnCounterparty ? (
          <Card className="p-6 text-center">
            <p className="font-heading text-xl font-bold">Waiting on the other side…</p>
            <p className="mt-2 text-sm text-muted-foreground">
              They still need to pick self-defense or counsel before trial begins.
            </p>
            <p className="mt-4 text-xs font-mono text-muted-foreground">
              This page updates automatically.
            </p>
          </Card>
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
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                plaintiff
              </div>
              <p className="mt-2 text-sm leading-relaxed">{caseData.plaintiffSide}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                defendant
              </div>
              <p className="mt-2 text-sm leading-relaxed">
                {caseData.defendantSide ??
                  (caseData.absentDefendant
                    ? "The defendant is absent. A devil's advocate will steelman their position."
                    : "Defendant has not yet filed a response.")}
              </p>
            </Card>
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
