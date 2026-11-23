import { keepPreviousData, useQuery, queryOptions } from "@tanstack/react-query";
import { bookingsApi } from "@/services/api/bookings.api";
import { publicApi, type PublicBookingFilters } from "@/services/api/public.api";
import { settingsApi } from "@/services/api/settings.api";
import { qk } from "@/lib/queryKeys";
import type { BookingFilters } from "@/types";

type BookingListFilters = BookingFilters & { page?: number; pageSize?: number };

export const bookingsQueryOptions = (filters: BookingListFilters & { userId?: string } = {}) =>
  queryOptions({
    queryKey: qk.bookings.list(filters),
    queryFn: () => bookingsApi.list(filters),
    placeholderData: keepPreviousData,
  });

export const myBookingsQueryOptions = (userId: string, filters: BookingListFilters = {}) =>
  queryOptions({
    queryKey: qk.bookings.mine({ userId, ...filters }),
    queryFn: () => bookingsApi.list({ ...filters, userId }),
    placeholderData: keepPreviousData,
    enabled: Boolean(userId),
  });

export const bookingQueryOptions = (id: string) =>
  queryOptions({ queryKey: qk.bookings.detail(id), queryFn: () => bookingsApi.get(id) });

export const publicBookingsQueryOptions = (filters: PublicBookingFilters = {}) =>
  queryOptions({
    queryKey: qk.public.bookings(filters),
    queryFn: () => publicApi.allBookings(filters),
    placeholderData: (previousData) => previousData,
  });

export const bookingHistoryQueryOptions = (id: string) =>
  queryOptions({ queryKey: qk.bookings.history(id), queryFn: () => bookingsApi.history(id) });

export const useBookings = (f: BookingListFilters & { userId?: string } = {}) =>
  useQuery(bookingsQueryOptions(f));
export const useMyBookings = (userId: string, f: BookingListFilters = {}) =>
  useQuery(myBookingsQueryOptions(userId, f));
export const useBooking = (id: string) => useQuery(bookingQueryOptions(id));
export const usePublicBookings = (f: PublicBookingFilters = {}, options?: { enabled?: boolean }) =>
  useQuery({ ...publicBookingsQueryOptions(f), ...options });
export const useBookingHistory = (id: string) => useQuery(bookingHistoryQueryOptions(id));
export const useOverdueSummary = () =>
  useQuery({ queryKey: qk.bookings.overdue, queryFn: () => bookingsApi.overdueSummary() });
export const useBookingRules = () =>
  useQuery({ queryKey: qk.settings.bookingRules, queryFn: () => settingsApi.bookingRules() });
