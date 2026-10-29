import { create } from "zustand";
import type { ResourceFilters } from "@/types";

interface ResourceUiState {
  filters: ResourceFilters;
  setFilter: <K extends keyof ResourceFilters>(k: K, v: ResourceFilters[K]) => void;
}

const initial: ResourceFilters = { search: "", type: "all", availability: "all" };

export const useResourceStore = create<ResourceUiState>((set) => ({
  filters: initial,
  setFilter: (k, v) => set((s) => ({ filters: { ...s.filters, [k]: v } })),
}));
