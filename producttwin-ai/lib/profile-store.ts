"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AuditResult, ProductProfile, ScenarioInputs, ScenarioResults,
} from "./profile";
import { EMPTY_PROFILE, NUTRIFLOW_PROFILE } from "./profile";
import type { SectionId } from "./sections";

// ─── Types ────────────────────────────────────────────────────────────────

export type SavedScenario = {
  id: string;
  name: string;
  inputs: ScenarioInputs;
  results: ScenarioResults;
  savedAt: number;
};

export type KpiSnapshot = {
  date: number;
  mrr: number;
  churn: number;
  activation: number;
  retention30: number;
  ltv: number;
  cac: number;
};

export type ActionItem = {
  id: string;
  title: string;
  source: "audit" | "simulator" | "manual";
  sectionId?: SectionId;
  priority: "high" | "med" | "low";
  status: "open" | "in_progress" | "done" | "dismissed";
  impact?: string;
  createdAt: number;
  completedAt?: number;
};

// Stored audit snapshot — includes timestamp + composite score for trend tracking
export type AuditSnapshot = {
  id: string;
  result: AuditResult;
  compositeScore: number;
  createdAt: number;
};

// ─── Store ────────────────────────────────────────────────────────────────

type ProfileStore = {
  profile: ProductProfile;

  // current single audit (for backward-compat)
  audit: AuditResult | null;

  // retention infrastructure
  auditHistory: AuditSnapshot[];
  kpiHistory: KpiSnapshot[];
  actionItems: ActionItem[];

  // simulator state
  lastScenario: ScenarioResults | null;
  savedScenarios: SavedScenario[];

  // profile mutations
  updateProfile: (patch: Partial<ProductProfile>) => void;
  setProfile: (next: ProductProfile) => void;
  loadDemo: () => void;
  clearProfile: () => void;

  // audit (current + history)
  saveAudit: (audit: AuditResult, compositeScore: number) => void;
  clearAudit: () => void;
  clearAuditHistory: () => void;

  // KPI history
  logKpiSnapshot: () => void;
  clearKpiHistory: () => void;

  // action items
  addActionItems: (items: Omit<ActionItem, "id" | "createdAt" | "status">[]) => void;
  addManualActionItem: (title: string, priority: ActionItem["priority"]) => void;
  toggleActionItem: (id: string) => void;
  setActionItemStatus: (id: string, status: ActionItem["status"]) => void;
  removeActionItem: (id: string) => void;
  clearCompletedActionItems: () => void;

  // simulator
  setLastScenario: (r: ScenarioResults | null) => void;
  saveScenario: (name: string, inputs: ScenarioInputs, results: ScenarioResults) => void;
  deleteScenario: (id: string) => void;
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profile: EMPTY_PROFILE,
      audit: null,
      auditHistory: [],
      kpiHistory: [],
      actionItems: [],
      lastScenario: null,
      savedScenarios: [],

      updateProfile: (patch) =>
        set((s) => ({ profile: { ...s.profile, ...patch } })),

      setProfile: (next) => set({ profile: next }),

      loadDemo: () => set({ profile: NUTRIFLOW_PROFILE }),

      clearProfile: () => set({
        profile: EMPTY_PROFILE,
        audit: null,
        auditHistory: [],
        kpiHistory: [],
        actionItems: [],
        lastScenario: null,
        savedScenarios: [],
      }),

      // ── Audit ──────────────────────────────────────────────────
      saveAudit: (audit, compositeScore) => set((s) => ({
        audit,
        auditHistory: [
          {
            id: `audit_${Date.now()}`,
            result: audit,
            compositeScore,
            createdAt: Date.now(),
          },
          ...s.auditHistory,
        ].slice(0, 24), // keep last 24 audits
      })),
      clearAudit: () => set({ audit: null }),
      clearAuditHistory: () => set({ auditHistory: [], audit: null }),

      // ── KPI history ────────────────────────────────────────────
      logKpiSnapshot: () => set((s) => {
        const p = s.profile;
        if (!p.mrr) return s; // don't log empty
        const today = Date.now();
        // Throttle: max one per day
        const last = s.kpiHistory[0];
        if (last && today - last.date < 1000 * 60 * 60 * 18) return s;
        return {
          kpiHistory: [
            {
              date: today, mrr: p.mrr, churn: p.churnRate, activation: p.activationRate,
              retention30: p.retentionRate30, ltv: p.ltv, cac: p.cac,
            },
            ...s.kpiHistory,
          ].slice(0, 52), // keep up to 52 weekly snapshots
        };
      }),
      clearKpiHistory: () => set({ kpiHistory: [] }),

      // ── Action items ───────────────────────────────────────────
      addActionItems: (items) => set((s) => {
        const newOnes: ActionItem[] = items.map((it, i) => ({
          ...it,
          id: `task_${Date.now()}_${i}`,
          createdAt: Date.now(),
          status: "open" as const,
        }));
        // Dedupe by title against existing open items
        const existingTitles = new Set(s.actionItems.filter((a) => a.status === "open").map((a) => a.title));
        const filtered = newOnes.filter((n) => !existingTitles.has(n.title));
        return { actionItems: [...filtered, ...s.actionItems].slice(0, 80) };
      }),

      addManualActionItem: (title, priority) => set((s) => ({
        actionItems: [
          {
            id: `task_${Date.now()}`,
            title: title.trim(),
            source: "manual" as const,
            priority,
            status: "open" as const,
            createdAt: Date.now(),
          },
          ...s.actionItems,
        ],
      })),

      toggleActionItem: (id) => set((s) => ({
        actionItems: s.actionItems.map((a) => {
          if (a.id !== id) return a;
          if (a.status === "done") return { ...a, status: "open" as const, completedAt: undefined };
          return { ...a, status: "done" as const, completedAt: Date.now() };
        }),
      })),

      setActionItemStatus: (id, status) => set((s) => ({
        actionItems: s.actionItems.map((a) =>
          a.id === id
            ? { ...a, status, completedAt: status === "done" ? Date.now() : a.completedAt }
            : a
        ),
      })),

      removeActionItem: (id) => set((s) => ({
        actionItems: s.actionItems.filter((a) => a.id !== id),
      })),

      clearCompletedActionItems: () => set((s) => ({
        actionItems: s.actionItems.filter((a) => a.status !== "done" && a.status !== "dismissed"),
      })),

      // ── Simulator ──────────────────────────────────────────────
      setLastScenario: (r) => set({ lastScenario: r }),

      saveScenario: (name, inputs, results) => set((s) => ({
        savedScenarios: [
          {
            id: `s_${Date.now()}`,
            name: name.trim() || `Scenario ${s.savedScenarios.length + 1}`,
            inputs, results,
            savedAt: Date.now(),
          },
          ...s.savedScenarios,
        ].slice(0, 12),
      })),

      deleteScenario: (id) =>
        set((s) => ({ savedScenarios: s.savedScenarios.filter((x) => x.id !== id) })),
    }),
    {
      name: "producttwin-profile",
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persisted: any, version) => {
        // Defensive: ensure new collections exist on old persisted state
        if (!persisted) return persisted;
        return {
          ...persisted,
          auditHistory: persisted.auditHistory ?? [],
          kpiHistory: persisted.kpiHistory ?? [],
          actionItems: persisted.actionItems ?? [],
          savedScenarios: persisted.savedScenarios ?? [],
        };
      },
    },
  ),
);

/** Whether the profile has minimum data to drive the workspace. */
export function isProfilePopulated(p: ProductProfile): boolean {
  return p.productName.trim().length > 1 && p.mrr > 0;
}
