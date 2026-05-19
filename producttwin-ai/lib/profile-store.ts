"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AuditResult, ProductProfile, ScenarioInputs, ScenarioResults,
} from "./profile";
import { EMPTY_PROFILE, NUTRIFLOW_PROFILE } from "./profile";

export type SavedScenario = {
  id: string;
  name: string;
  inputs: ScenarioInputs;
  results: ScenarioResults;
  savedAt: number;
};

type ProfileStore = {
  profile: ProductProfile;
  audit: AuditResult | null;
  lastScenario: ScenarioResults | null;
  savedScenarios: SavedScenario[];

  // profile mutations
  updateProfile: (patch: Partial<ProductProfile>) => void;
  setProfile: (next: ProductProfile) => void;
  loadDemo: () => void;
  clearProfile: () => void;

  // audit
  saveAudit: (audit: AuditResult) => void;
  clearAudit: () => void;

  // scenarios
  setLastScenario: (r: ScenarioResults | null) => void;
  saveScenario: (name: string, inputs: ScenarioInputs, results: ScenarioResults) => void;
  deleteScenario: (id: string) => void;
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: EMPTY_PROFILE,
      audit: null,
      lastScenario: null,
      savedScenarios: [],

      updateProfile: (patch) =>
        set((s) => ({ profile: { ...s.profile, ...patch } })),

      setProfile: (next) => set({ profile: next }),

      loadDemo: () => set({ profile: NUTRIFLOW_PROFILE }),

      clearProfile: () => set({
        profile: EMPTY_PROFILE,
        audit: null,
        lastScenario: null,
        savedScenarios: [],
      }),

      saveAudit: (audit) => set({ audit }),
      clearAudit: () => set({ audit: null }),

      setLastScenario: (r) => set({ lastScenario: r }),

      saveScenario: (name, inputs, results) =>
        set((s) => ({
          savedScenarios: [
            {
              id: `s_${Date.now()}`,
              name: name.trim() || `Scenario ${s.savedScenarios.length + 1}`,
              inputs, results,
              savedAt: Date.now(),
            },
            ...s.savedScenarios,
          ].slice(0, 12), // cap to 12 most recent
        })),

      deleteScenario: (id) =>
        set((s) => ({ savedScenarios: s.savedScenarios.filter((x) => x.id !== id) })),
    }),
    {
      name: "producttwin-profile",
      storage: createJSONStorage(() => localStorage),
      version: 2,
    },
  ),
);

/**
 * Helper to derive whether a profile is meaningfully populated.
 */
export function isProfilePopulated(p: ProductProfile): boolean {
  return p.productName.trim().length > 1 && p.mrr > 0;
}
