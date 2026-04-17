"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gavel, Loader2, PlayCircle, KeyRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JURORS, avatarUrl, getJuror } from "@/lib/jurors";
import { getLawyer, lawyerAvatarUrl } from "@/lib/lawyers";
import { useSettings } from "@/lib/store";
import { gavel, tap } from "@/lib/haptics";
import { ApiKeyModal } from "@/components/api-key-modal";
import type {
  CasePayload,
  DeliberationMessage,
  VerdictRecord,
  VoteRecord,
} from "@/lib/types";

interface Props {
  caseData: CasePayload;
  initialMessages: DeliberationMessage[];
  initialVerdict: VerdictRecord | null;
  onVerdict: (v: VerdictRecord) => void;
}

type LiveMsg = {
  id: string; // temp id from server
  speakerType: DeliberationMessage["speakerType"];
  speakerId: string;
  speakerName: string;
  content: string;
  isVerdictVote?: boolean;
};

export function DeliberationView({
  caseData,
  initialMessages,
  initialVerdict,
  onVerdict,
}: Props) {
  const apiKey = useSettings((s) => s.apiKey);
  const [keyModal, setKeyModal] = useState(false);
  const [messages, setMessages] = useState<LiveMsg[]>(
    initialMessages.map((m) => ({
      id: `persisted-${m.id}`,
      speakerType: m.speakerType,
      speakerId: m.speakerId,
      speakerName: m.speakerName,
      content: m.content,
    })),
  );
  const [votes, setVotes] = useState<VoteRecord[]>(initialVerdict?.votes ?? []);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(!!initialVerdict);
  const [autoScrollOn, setAutoScrollOn] = useState(true);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const streamAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("no-pull-refresh");
    return () => document.documentElement.classList.remove("no-pull-refresh");
  }, []);

  useEffect(() => {
    if (!autoScrollOn) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, autoScrollOn]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 80;
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
            /* ignore malformed line */
          }
        }
      }
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") {
        /* noop */
      } else {
        console.error("deliberation stream error", err);
      }
    } finally {
      setRunning(false);
    }
  }, [apiKey, caseData.id, running]);

  function handleEvent(ev: {
    type: string;
    [k: string]: unknown;
  }) {
    if (ev.type === "start") {
      const s = ev.speaker as LiveMsg;
      setMessages((prev) => [
        ...prev,
        {
          id: ev.messageId as string,
          speakerType: s.speakerType,
          speakerId: s.speakerId,
          speakerName: s.speakerName,
          content: "",
          isVerdictVote: /— verdict/i.test(s.speakerName),
        },
      ]);
    } else if (ev.type === "delta") {
      const mid = ev.messageId as string;
      const text = ev.text as string;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === mid ? { ...m, content: m.content + text } : m,
        ),
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
      gavel();
    } else if (ev.type === "done") {
      setDone(true);
    } else if (ev.type === "error") {
      console.error("deliberation error", ev);
    }
  }

  const canStart =
    !running && !done && messages.length === initialMessages.length;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 pb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative inline-flex size-2">
            {running && (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
            )}
            <span
              className={`relative inline-flex size-2 rounded-full ${
                running ? "bg-primary" : done ? "bg-green-500" : "bg-muted-foreground/40"
              }`}
            />
          </span>
          <span>
            {done
              ? "verdict rendered"
              : running
                ? "jury deliberating live"
                : "session paused"}
          </span>
        </div>
        <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-widest">
          {caseData.mode}
        </Badge>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto rounded-3xl border bg-card p-4 sm:p-5"
      >
        {messages.length === 0 && !running && (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-14 text-center">
            <Gavel className="size-10 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">The jury is seated.</p>
              <p className="text-sm text-muted-foreground">
                Hit the button below to call the session to order.
              </p>
            </div>
          </div>
        )}

        <ul className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.li
                key={m.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-3"
              >
                {renderAvatar(m)}
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-baseline justify-between gap-2">
                    <span className="truncate text-xs font-semibold">
                      {m.speakerName}
                    </span>
                    <span className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
                      {labelForSpeaker(m.speakerType)}
                    </span>
                  </div>
                  <p
                    className={`whitespace-pre-wrap break-words text-sm leading-snug ${
                      m.isVerdictVote ? "font-heading text-base" : ""
                    }`}
                  >
                    {m.content || (
                      <span className="text-muted-foreground/60">…</span>
                    )}
                  </p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      {/* controls */}
      <div className="sticky bottom-0 z-10 mt-4 border-t bg-background/95 px-1 pt-3 backdrop-blur-xl mb-safe">
        {canStart && (
          <Button
            size="lg"
            className="h-12 w-full rounded-full text-base font-semibold"
            onClick={startDeliberation}
          >
            <PlayCircle className="size-5" />
            {apiKey ? "Call court to order" : "Begin (needs Anthropic key)"}
          </Button>
        )}
        {running && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Streaming… don&rsquo;t navigate away.
          </div>
        )}
        {done && votes.length > 0 && (
          <Card className="p-3 text-sm">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Gavel className="size-3.5" /> votes
            </div>
            <ul className="space-y-1">
              {votes.map((v) => (
                <li
                  key={v.jurorId}
                  className="flex items-start justify-between gap-2"
                >
                  <span className="font-medium">{v.jurorName}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      v.ruling === "plaintiff"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {v.ruling}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {!apiKey && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 rounded-full"
            onClick={() => setKeyModal(true)}
          >
            <KeyRound className="size-3.5" /> Set Anthropic key
          </Button>
        )}
      </div>

      <ApiKeyModal open={keyModal} onOpenChange={setKeyModal} onSaved={() => void startDeliberation()} />
    </div>
  );
}

function labelForSpeaker(t: DeliberationMessage["speakerType"]): string {
  switch (t) {
    case "judge":
      return "judge";
    case "juror":
      return "juror";
    case "lawyer":
      return "counsel";
    case "plaintiff":
      return "plaintiff";
    case "defendant":
      return "defendant";
  }
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
  return (
    <Avatar className="size-9 border">
      <AvatarFallback>{m.speakerName[0] ?? "?"}</AvatarFallback>
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
