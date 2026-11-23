import { create } from "zustand";
import type { BookingFilters } from "@/types";

export type BookingListKey = "dashboard" | "mine" | "admin" | "adminPending";

interface BookingUiState {
  filters: BookingFilters;
  setFilter: <K extends keyof BookingFilters>(k: K, v: BookingFilters[K]) => void;
  /** Kept here so returning from a booking detail restores the list page. */
  pages: Partial<Record<BookingListKey, number>>;
  setPage: (list: BookingListKey, page: number) => void;
}

const initial: BookingFilters = { status: "all" };

export const useBookingStore = create<BookingUiState>((set) => ({
  filters: initial,
  // "mine" and "admin" share these filters, so a filter change restarts both lists.
  setFilter: (k, v) =>
    set((s) => ({ filters: { ...s.filters, [k]: v }, pages: { ...s.pages, mine: 1, admin: 1 } })),
  pages: {},
  setPage: (list, page) => set((s) => ({ pages: { ...s.pages, [list]: page } })),
}));
