import { create } from "zustand";
import type { BookingFilters } from "@/types";

interface BookingUiState {
  filters: BookingFilters;
  setFilter: <K extends keyof BookingFilters>(k: K, v: BookingFilters[K]) => void;
}

const initial: BookingFilters = { status: "all" };

export const useBookingStore = create<BookingUiState>((set) => ({
  filters: initial,
  setFilter: (k, v) => set((s) => ({ filters: { ...s.filters, [k]: v } })),
}));
