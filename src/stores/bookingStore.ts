import { create } from "zustand";
import type { BookingFilters } from "@/types";

interface BookingUiState {
  filters: BookingFilters;
  selectedBookingId: string | null;
  setFilter: <K extends keyof BookingFilters>(k: K, v: BookingFilters[K]) => void;
  resetFilters: () => void;
  selectBooking: (id: string | null) => void;
}

const initial: BookingFilters = { status: "all" };

export const useBookingStore = create<BookingUiState>((set) => ({
  filters: initial,
  selectedBookingId: null,
  setFilter: (k, v) => set((s) => ({ filters: { ...s.filters, [k]: v } })),
  resetFilters: () => set({ filters: initial }),
  selectBooking: (id) => set({ selectedBookingId: id }),
}));