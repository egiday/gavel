"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Gavel,
  Loader2,
  PlayCircle,
  KeyRound,
  Scale,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JURORS, avatarUrl, getJuror } from "@/lib/jurors";
import { getLawyer, lawyerAvatarUrl } from "@/lib/lawyers";
import { useSettings } from "@/lib/store";
import { gavel, tap } from "@/lib/haptics";
import { ApiKeyModal } from "@/components/api-key-modal";
import type {
  CasePayload,
  DeliberationMessage,
  TrialPhase,
  VerdictRecord,
  VoteRecord,
} from "@/lib/types";

interface Props {
  caseData: CasePayload;
  initialMessages: DeliberationMessage[];
  initialVerdict: VerdictRecord | null;
  onVerdict: (v: VerdictRecord) => void;
  spectator?: boolean;
}

type LiveMsg = {
  id: string;
  phase: TrialPhase;
  speakerType: DeliberationMessage["speakerType"];
  speakerId: string;
  speakerName: string;
  content: string;
  isVerdictVote?: boolean;
};

function toLiveMsgs(messages: DeliberationMessage[]): LiveMsg[] {
  return messages.map((m) => ({
    id: `persisted-${m.id}`,
    phase: m.phase,
    speakerType: m.speakerType,
    speakerId: m.speakerId,
    speakerName: m.speakerName,
    content: m.content,
  }));
}

const PHASE_LABELS: Record<TrialPhase, string> = {
  trial: "Trial",
  deliberation: "Jury Deliberation",
  verdict: "Verdict",
};

export function DeliberationView({
  caseData,
  initialMessages,
  initialVerdict,
  onVerdict,
  spectator = false,
}: Props) {
  const apiKey = useSettings((s) => s.apiKey);
  const [keyModal, setKeyModal] = useState(false);
  const [messages, setMessages] = useState<LiveMsg[]>(() =>
    toLiveMsgs(initialMessages),
  );
  const [votes, setVotes] = useState<VoteRecord[]>(initialVerdict?.votes ?? []);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(!!initialVerdict);
  const [phase, setPhase] = useState<TrialPhase>(
    initialVerdict
      ? "verdict"
      : initialMessages.some((m) => m.phase === "deliberation")
        ? "deliberation"
        : "trial",
  );
  const [autoScrollOn, setAutoScrollOn] = useState(true);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const streamAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("no-pull-refresh");
    return () => document.documentElement.classList.remove("no-pull-refresh");
  }, []);

  useEffect(() => {
    if (!spectator) return;
    setMessages(toLiveMsgs(initialMessages));
    const hasDelib = initialMessages.some((m) => m.phase === "deliberation");
    setPhase(hasDelib ? "deliberation" : "trial");
  }, [spectator, initialMessages]);

  useEffect(() => {
    if (!spectator) return;
    if (initialVerdict) {
      setVotes(initialVerdict.votes);
      setDone(true);
      setPhase("verdict");
    }
  }, [spectator, initialVerdict]);

  useEffect(() => {
    if (!autoScrollOn) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, autoScrollOn]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setAutoScrollOn(nearBottom);
  }, []);

  const startDeliberation = useCallback(async () => {
    if (!apiKey) {
      setKeyModal(true);
      return;
    }
    if (running) return;
    setRunning(true);

    const ac = new AbortController();
    streamAbort.current = ac;
    try {
      const res = await fetch(`/api/cases/${caseData.id}/deliberate`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-anthropic-key": apiKey,
        },
        body: JSON.stringify({}),
        signal: ac.signal,
      });
      if (!res.ok || !res.body) {
        const err = await safeJson(res);
        throw new Error(err?.error ?? `HTTP ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { value, done: readerDone } = await reader.read();
        if (readerDone) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data) continue;
          try {
            const ev = JSON.parse(data);
            handleEvent(ev);
          } catch {
            /* ignore */
          }
        }
      }
    } catch (err) {
      if ((err as { name?: string }).name !== "AbortError") {
        console.error("deliberation stream error", err);
      }
    } finally {
      setRunning(false);
    }
  }, [apiKey, caseData.id, running]);

  function handleEvent(ev: { type: string; [k: string]: unknown }) {
    if (ev.type === "phase") {
      setPhase(ev.phase as TrialPhase);
    } else if (ev.type === "start") {
      const s = ev.speaker as {
        type: LiveMsg["speakerType"];
        id: string;
        name: string;
      };
      const name = s?.name ?? "";
      const evPhase = (ev.phase as TrialPhase) ?? phase;
      setMessages((prev) => [
        ...prev,
        {
          id: ev.messageId as string,
          phase: evPhase,
          speakerType: s?.type ?? "juror",
          speakerId: s?.id ?? "unknown",
          speakerName: name,
          content: "",
          isVerdictVote: /—\s*verdict/i.test(name),
        },
      ]);
    } else if (ev.type === "delta") {
      const mid = ev.messageId as string;
      const text = ev.text as string;
      setMessages((prev) =>
        prev.map((m) => (m.id === mid ? { ...m, content: m.content + text } : m)),
      );
    } else if (ev.type === "end") {
      const mid = ev.messageId as string;
      const content = ev.content as string;
      setMessages((prev) =>
        prev.map((m) => (m.id === mid ? { ...m, content } : m)),
      );
    } else if (ev.type === "vote") {
      const { jurorId, jurorName, ruling, reasoning } = ev as unknown as VoteRecord;
      setVotes((prev) => [...prev, { jurorId, jurorName, ruling, reasoning }]);
      tap();
    } else if (ev.type === "verdict") {
      const { ruling, summary, topQuote } = ev as unknown as VerdictRecord;
      onVerdict({ ruling, summary, topQuote, votes });
      setPhase("verdict");
      gavel();
    } else if (ev.type === "done") {
      setDone(true);
    } else if (ev.type === "error") {
      console.error("deliberation error", ev);
    }
  }

  const canStart = !running && !done && messages.length === initialMessages.length;

  // group messages by phase for rendering
  const groupedMessages = groupByPhase(messages);

  return (
    <div className="flex flex-1 flex-col">
      {/* phase tracker */}
      <div className="pb-3">
        <PhaseTracker phase={phase} done={done} />
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="gv-card relative flex-1 overflow-y-auto rounded-3xl p-4 sm:p-5"
      >
        {messages.length === 0 && !running && (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-14 text-center">
            <Gavel className="size-10 text-white/40" />
            <div>
              <p className="text-lg font-semibold text-white">The jury is seated.</p>
              <p className="text-sm text-white/55">
                {spectator
                  ? "Waiting for the plaintiff to call court to order."
                  : "Hit the button below to call the session to order."}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {groupedMessages.map((group) => (
            <Fragment key={group.phase}>
              <PhaseBanner phase={group.phase} />
              <ul className="space-y-4">
                <AnimatePresence initial={false}>
                  {group.items.map((m) => (
                    <motion.li
                      key={m.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex items-start gap-3 ${
                        m.phase === "trial" && isPartyOrCounsel(m.speakerType)
                          ? "rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                          : ""
                      }`}
                    >
                      {renderAvatar(m)}
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-baseline justify-between gap-2">
                          <span className="truncate text-xs font-semibold text-white">
                            {m.speakerName}
                          </span>
                          <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-white/40">
                            {labelForSpeaker(m.speakerType, m.phase)}
                          </span>
                        </div>
                        <p
                          className={`whitespace-pre-wrap break-words text-sm leading-snug text-white/85 ${
                            m.isVerdictVote ? "font-heading text-base" : ""
                          }`}
                        >
                          {m.content || (
                            <span className="text-white/30">…</span>
                          )}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </Fragment>
          ))}
        </div>
      </div>

      {/* controls */}
      <div className="sticky bottom-0 z-10 mt-4 border-t border-white/10 bg-background/95 px-1 pt-3 backdrop-blur-xl mb-safe">
        {!spectator && canStart && (
          <Button
            size="lg"
            className="h-12 w-full rounded-full gv-glow text-base font-semibold"
            onClick={startDeliberation}
          >
            <PlayCircle className="size-5" />
            {apiKey ? "Call court to order" : "Begin (needs Anthropic key)"}
          </Button>
        )}
        {spectator && !done && (
          <div className="flex items-center justify-center gap-2 text-sm text-white/55">
            <Loader2 className="size-4 animate-spin" /> Watching the courtroom — auto-refreshing.
          </div>
        )}
        {running && (
          <div className="flex items-center justify-center gap-2 text-sm text-white/55">
            <Loader2 className="size-4 animate-spin" /> Streaming… don&rsquo;t navigate away.
          </div>
        )}
        {done && votes.length > 0 && (
          <div className="gv-card rounded-2xl p-3 text-sm">
            <div className="gv-mono-label mb-2 inline-flex items-center gap-2">
              <Gavel className="size-3.5" /> votes
            </div>
            <ul className="space-y-1">
              {votes.map((v) => (
                <li
                  key={v.jurorId}
                  className="flex items-start justify-between gap-2"
                >
                  <span className="font-medium text-white/90">{v.jurorName}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest ${
                      v.ruling === "plaintiff"
                        ? "bg-primary/15 text-primary"
                        : "bg-white/10 text-white/80"
                    }`}
                  >
                    {v.ruling}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {!apiKey && !spectator && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 rounded-full text-white/60 hover:bg-white/5 hover:text-white"
            onClick={() => setKeyModal(true)}
          >
            <KeyRound className="size-3.5" /> Set Anthropic key
          </Button>
        )}
      </div>

      {!spectator && (
        <ApiKeyModal
          open={keyModal}
          onOpenChange={setKeyModal}
          onSaved={() => void startDeliberation()}
        />
      )}
    </div>
  );
}

function labelForSpeaker(
  t: DeliberationMessage["speakerType"],
  phase: TrialPhase,
): string {
  if (phase === "verdict") return "verdict";
  switch (t) {
    case "judge":
      return "judge";
    case "juror":
      return phase === "trial" ? "jury" : "juror";
    case "lawyer":
      return "counsel";
    case "plaintiff":
      return "plaintiff";
    case "defendant":
      return "defendant";
  }
}

function isPartyOrCounsel(t: DeliberationMessage["speakerType"]): boolean {
  return t === "lawyer" || t === "plaintiff" || t === "defendant";
}

function renderAvatar(m: LiveMsg) {
  if (m.speakerType === "judge") {
    return (
      <Avatar className="size-9 border">
        <AvatarImage src={avatarUrl(getJuror("judge-marlowe")!)} alt="Judge" />
        <AvatarFallback>J</AvatarFallback>
      </Avatar>
    );
  }
  if (m.speakerType === "juror") {
    const juror = JURORS.find((j) => j.id === m.speakerId);
    if (juror) {
      return (
        <Avatar className="size-9 border">
          <AvatarImage src={avatarUrl(juror)} alt={juror.name} />
          <AvatarFallback>{juror.name[0]}</AvatarFallback>
        </Avatar>
      );
    }
  }
  if (m.speakerType === "lawyer") {
    const lawyerId = m.speakerId.split(":")[0];
    const lawyer = getLawyer(lawyerId);
    if (lawyer) {
      return (
        <Avatar className="size-9 border">
          <AvatarImage src={lawyerAvatarUrl(lawyer)} alt={lawyer.name} />
          <AvatarFallback>{lawyer.name[0]}</AvatarFallback>
        </Avatar>
      );
    }
  }
  const initial = (m.speakerName ?? "").trim()[0] ?? "?";
  return (
    <Avatar className="size-9 border">
      <AvatarFallback>{initial}</AvatarFallback>
    </Avatar>
  );
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function groupByPhase(messages: LiveMsg[]): Array<{ phase: TrialPhase; items: LiveMsg[] }> {
  const groups: Array<{ phase: TrialPhase; items: LiveMsg[] }> = [];
  for (const m of messages) {
    const last = groups[groups.length - 1];
    if (!last || last.phase !== m.phase) {
      groups.push({ phase: m.phase, items: [m] });
    } else {
      last.items.push(m);
    }
  }
  return groups;
}

function PhaseBanner({ phase }: { phase: TrialPhase }) {
  const icon =
    phase === "trial" ? (
      <Scale className="size-3.5" />
    ) : phase === "deliberation" ? (
      <Users className="size-3.5" />
    ) : (
      <Gavel className="size-3.5" />
    );
  const accent =
    phase === "trial"
      ? "text-amber-300 bg-amber-500/15"
      : phase === "deliberation"
        ? "text-blue-300 bg-blue-500/15"
        : "text-primary bg-primary/15";
  const subtitle =
    phase === "trial"
      ? "Parties and counsel argue. The jury watches silently."
      : phase === "deliberation"
        ? "The jury is alone in the room. Lawyers dismissed."
        : "The verdict is rendered.";
  return (
    <div className="sticky top-0 z-[5] -mx-4 bg-background/90 px-4 pt-2 pb-3 backdrop-blur sm:-mx-5 sm:px-5">
      <div className={`inline-flex items-center gap-2 rounded-full ${accent} px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em]`}>
        {icon}
        <span>{PHASE_LABELS[phase]}</span>
      </div>
      <p className="mt-2 text-xs text-white/55">{subtitle}</p>
    </div>
  );
}

function PhaseTracker({ phase, done }: { phase: TrialPhase; done: boolean }) {
  const stages: TrialPhase[] = ["trial", "deliberation", "verdict"];
  const activeIdx =
    phase === "verdict" || done ? 2 : phase === "deliberation" ? 1 : 0;
  return (
    <div className="flex items-center gap-2">
      {stages.map((s, i) => (
        <Fragment key={s}>
          <div className="flex items-center gap-1.5">
            <span
              className={`size-2 rounded-full transition-colors ${
                i < activeIdx
                  ? "bg-primary"
                  : i === activeIdx
                    ? "animate-pulse bg-primary"
                    : "bg-white/15"
              }`}
            />
            <span
              className={`font-mono text-[10px] font-semibold uppercase tracking-[0.2em] ${
                i <= activeIdx ? "text-white" : "text-white/30"
              }`}
            >
              {PHASE_LABELS[s]}
            </span>
          </div>
          {i < stages.length - 1 && (
            <span
              className={`h-px flex-1 ${
                i < activeIdx ? "bg-primary" : "bg-white/10"
              }`}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}
