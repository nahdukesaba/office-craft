import { create } from "zustand";
import type { ResourceFilters } from "@/types";

interface ResourceUiState {
  filters: ResourceFilters;
  view: "grid" | "list";
  setFilter: <K extends keyof ResourceFilters>(k: K, v: ResourceFilters[K]) => void;
  resetFilters: () => void;
  setView: (v: "grid" | "list") => void;
}

const initial: ResourceFilters = { search: "", type: "all", availability: "all" };

export const useResourceStore = create<ResourceUiState>((set) => ({
  filters: initial,
  view: "grid",
  setFilter: (k, v) => set((s) => ({ filters: { ...s.filters, [k]: v } })),
  resetFilters: () => set({ filters: initial }),
  setView: (view) => set({ view }),
}));