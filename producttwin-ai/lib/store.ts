"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductAssumptions, RoadmapItem } from "./types";
import { DEFAULT_ASSUMPTIONS, DEFAULT_ROADMAP } from "./mock-data";

type State = {
  assumptions: ProductAssumptions;
  roadmap: RoadmapItem[];
  update: (patch: Partial<ProductAssumptions>) => void;
  reset: () => void;
  setRoadmap: (items: RoadmapItem[]) => void;
  updateRoadmapItem: (id: string, patch: Partial<RoadmapItem>) => void;
};

export const useTwinStore = create<State>()(
  persist(
    (set) => ({
      assumptions: DEFAULT_ASSUMPTIONS,
      roadmap: DEFAULT_ROADMAP,
      update: (patch) =>
        set((s) => ({ assumptions: { ...s.assumptions, ...patch } })),
      reset: () =>
        set({ assumptions: DEFAULT_ASSUMPTIONS, roadmap: DEFAULT_ROADMAP }),
      setRoadmap: (items) => set({ roadmap: items }),
      updateRoadmapItem: (id, patch) =>
        set((s) => ({
          roadmap: s.roadmap.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
    }),
    { name: "producttwin-store" },
  ),
);
