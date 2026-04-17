"use client";

// global client state — anthropic key, current mode, ui prefs.
// the api key never leaves the client (persisted to localStorage only).

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Mode } from "./types";

interface SettingsState {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  /** has the user dismissed the first-run modal? */
  hasOnboarded: boolean;
  setOnboarded: (v: boolean) => void;
  /** chosen mode for the current session (used by landing toggles) */
  preferredMode: Mode;
  setPreferredMode: (m: Mode) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: null,
      setApiKey: (apiKey) => set({ apiKey }),
      hasOnboarded: false,
      setOnboarded: (hasOnboarded) => set({ hasOnboarded }),
      preferredMode: "petty",
      setPreferredMode: (preferredMode) => set({ preferredMode }),
    }),
    {
      name: "gavel-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
