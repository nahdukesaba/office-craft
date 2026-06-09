import { useQuery, queryOptions } from "@tanstack/react-query";
import { bookingsApi } from "@/services/api/bookings.api";
import { publicApi } from "@/services/api/public.api";
import { qk } from "@/lib/queryKeys";
import type { BookingFilters } from "@/types";

export const bookingsQueryOptions = (filters: BookingFilters & { userId?: string } = {}) =>
  queryOptions({ queryKey: qk.bookings.list(filters), queryFn: () => bookingsApi.list(filters) });

export const myBookingsQueryOptions = (userId: string, filters: BookingFilters = {}) =>
  queryOptions({ queryKey: qk.bookings.mine({ userId, ...filters }), queryFn: () => bookingsApi.list({ ...filters, userId }) });

export const bookingQueryOptions = (id: string) =>
  queryOptions({ queryKey: qk.bookings.detail(id), queryFn: () => bookingsApi.get(id) });

export const publicBookingsQueryOptions = (filters: BookingFilters = {}) =>
  queryOptions({ queryKey: qk.public.bookings(filters), queryFn: () => publicApi.allBookings(filters) });

export const useBookings = (f: BookingFilters & { userId?: string } = {}) => useQuery(bookingsQueryOptions(f));
export const useMyBookings = (userId: string, f: BookingFilters = {}) => useQuery(myBookingsQueryOptions(userId, f));
export const useBooking = (id: string) => useQuery(bookingQueryOptions(id));
export const usePublicBookings = (f: BookingFilters = {}) => useQuery(publicBookingsQueryOptions(f));