"use client";

import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/store";
import { toast } from "sonner";

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** fires once a valid-looking key is saved */
  onSaved?: (key: string) => void;
}

export function ApiKeyModal({ open, onOpenChange, onSaved }: ApiKeyModalProps) {
  const setApiKey = useSettings((s) => s.setApiKey);
  const setOnboarded = useSettings((s) => s.setOnboarded);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!open) setDraft("");
  }, [open]);

  function handleSave() {
    const key = draft.trim();
    if (!key.startsWith("sk-ant-")) {
      toast.error("That doesn't look like an Anthropic key");
      return;
    }
    setApiKey(key);
    setOnboarded(true);
    toast.success("Key saved locally. Never sent to our servers.");
    onOpenChange(false);
    onSaved?.(key);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            Bring your own Anthropic key
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Gavel runs on your key. It&rsquo;s stored only in your browser.
            We never see it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apikey" className="text-sm font-semibold">
              API Key
            </Label>
            <Input
              id="apikey"
              type="password"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="sk-ant-api..."
              autoComplete="off"
              className="h-11 font-mono text-sm"
            />
          </div>

          <ul className="space-y-2 rounded-xl border bg-muted/50 p-3 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
              Stored only in your browser&rsquo;s localStorage.
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
              Sent to our server per-request, used once, never persisted.
            </li>
          </ul>

          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Get an Anthropic key <ExternalLink className="size-3" />
          </a>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Not yet
          </Button>
          <Button onClick={handleSave}>Save key</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
