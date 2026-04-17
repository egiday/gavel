"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ChatLine } from "@/lib/types";

interface Props {
  caseId: string;
  defaultOpen?: boolean;
}

const NAME_KEY = "gavel-spectator-name";

export function ChatPanel({ caseId, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [draft, setDraft] = useState("");
  const [name, setName] = useState("");
  const [messages, setMessages] = useState<ChatLine[]>([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastAt = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setName(window.localStorage.getItem(NAME_KEY) ?? "");
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (name) window.localStorage.setItem(NAME_KEY, name);
  }, [name]);

  useEffect(() => {
    let cancelled = false;
    async function pull() {
      const qs = lastAt.current
        ? `?since=${encodeURIComponent(lastAt.current)}`
        : "";
      try {
        const res = await fetch(`/api/cases/${caseId}/chat${qs}`);
        if (!res.ok) return;
        const data: { messages: ChatLine[] } = await res.json();
        if (cancelled) return;
        if (data.messages.length > 0) {
          setMessages((prev) =>
            mergeBy(prev, data.messages, (m) => m.id),
          );
          lastAt.current = data.messages[data.messages.length - 1].createdAt;
        }
      } catch {
        /* ignore */
      }
    }
    pull();
    const t = setInterval(pull, 3500);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [caseId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && open) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const send = useCallback(async () => {
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: name.trim(), content }),
      });
      if (!res.ok) return;
      const msg: ChatLine = await res.json();
      setMessages((prev) => mergeBy(prev, [msg], (m) => m.id));
      lastAt.current = msg.createdAt;
      setDraft("");
    } finally {
      setSending(false);
    }
  }, [caseId, draft, name, sending]);

  const recent = useMemo(() => messages.slice(-80), [messages]);

  return (
    <div className="gv-card flex flex-col overflow-hidden rounded-3xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <MessageCircle className="size-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Peanut gallery</div>
            <div className="text-xs text-white/50">
              Live chat — audience only. Jury can&rsquo;t see this.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Badge
              variant="secondary"
              className="rounded-full border border-white/10 bg-white/5 font-mono text-[10px] uppercase tracking-widest text-white/70"
            >
              {messages.length}
            </Badge>
          )}
          {open ? (
            <ChevronDown className="size-4 text-white/50" />
          ) : (
            <ChevronUp className="size-4 text-white/50" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden border-t border-white/10"
          >
            <div
              ref={scrollRef}
              className="max-h-64 overflow-y-auto px-4 py-3"
            >
              {recent.length === 0 ? (
                <p className="py-6 text-center text-xs text-white/45">
                  No chatter yet. Be the loudest in the room.
                </p>
              ) : (
                <ul className="space-y-2">
                  {recent.map((m) => (
                    <li key={m.id} className="flex items-start gap-2 text-sm">
                      <span className="shrink-0 font-mono text-[11px] font-semibold text-primary/90">
                        {m.displayName}
                      </span>
                      <span className="break-words leading-snug text-white/85">
                        {m.content}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-white/10 bg-white/[0.02] p-3">
              <div className="mb-2 flex items-center gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 24))}
                  placeholder="your name (or stay anonymous)"
                  className="h-8 flex-1 border-white/10 bg-white/5 text-xs"
                  maxLength={24}
                  autoComplete="nickname"
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  placeholder="drop a take…"
                  className="h-10 flex-1 border-white/10 bg-white/5"
                  maxLength={240}
                />
                <Button
                  onClick={send}
                  disabled={!draft.trim() || sending}
                  size="icon"
                  className="size-10 rounded-full"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function mergeBy<T>(a: T[], b: T[], key: (x: T) => string): T[] {
  const seen = new Set(a.map(key));
  const merged = [...a];
  for (const x of b) {
    if (!seen.has(key(x))) {
      merged.push(x);
      seen.add(key(x));
    }
  }
  return merged;
}
