"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuditResult, ProductProfile } from "./profile";
import { EMPTY_PROFILE, NUTRIFLOW_PROFILE } from "./profile";

type ProfileStore = {
  profile: ProductProfile;
  audit: AuditResult | null;

  // mutations
  updateProfile: (patch: Partial<ProductProfile>) => void;
  setProfile: (next: ProductProfile) => void;
  loadDemo: () => void;
  clearProfile: () => void;

  saveAudit: (audit: AuditResult) => void;
  clearAudit: () => void;
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: EMPTY_PROFILE,
      audit: null,

      updateProfile: (patch) =>
        set((s) => ({
          profile: { ...s.profile, ...patch },
        })),

      setProfile: (next) => set({ profile: next }),

      loadDemo: () => set({ profile: NUTRIFLOW_PROFILE }),

      clearProfile: () => set({ profile: EMPTY_PROFILE, audit: null }),

      saveAudit: (audit) => set({ audit }),
      clearAudit: () => set({ audit: null }),
    }),
    {
      name: "producttwin-profile",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

/**
 * Helper to derive whether a profile is meaningfully populated.
 * Used to decide if the simulator should show "use saved profile"
 * or "start with audit / load demo" empty state.
 */
export function isProfilePopulated(p: ProductProfile): boolean {
  return p.productName.trim().length > 1 && p.mrr > 0;
}
