import { env } from "@/lib/env";
import { mockDb } from "@/services/mocks/db";
import { http } from "@/services/http";
import type { Booking, BookingFilters, CreateBookingInput, Paginated } from "@/types";

export const bookingsApi = {
  async list(filters: BookingFilters & { userId?: string } = {}): Promise<Paginated<Booking>> {
    if (env.useMocks) return mockDb.listBookings(filters);
    const { data } = await http.get<Paginated<Booking>>("/bookings", { params: filters });
    return data;
  },
  async get(id: string): Promise<Booking> {
    if (env.useMocks) return mockDb.getBooking(id);
    const { data } = await http.get<Booking>(`/bookings/${id}`);
    return data;
  },
  async create(input: CreateBookingInput & { userId: string }): Promise<Booking> {
    if (env.useMocks) return mockDb.createBooking(input);
    const { data } = await http.post<Booking>("/bookings", input);
    return data;
  },
  async approve(id: string, adminNotes?: string) {
    if (env.useMocks) return mockDb.updateBookingStatus(id, "approved", adminNotes);
    const { data } = await http.put<Booking>(`/bookings/${id}/approve`, { adminNotes });
    return data;
  },
  async reject(id: string, adminNotes?: string) {
    if (env.useMocks) return mockDb.updateBookingStatus(id, "rejected", adminNotes);
    const { data } = await http.put<Booking>(`/bookings/${id}/reject`, { adminNotes });
    return data;
  },
  async close(id: string, adminNotes?: string) {
    if (env.useMocks) return mockDb.updateBookingStatus(id, "completed", adminNotes);
    const { data } = await http.put<Booking>(`/bookings/${id}/close`, { adminNotes });
    return data;
  },
  async cancel(id: string) {
    if (env.useMocks) return mockDb.cancelBooking(id);
    const { data } = await http.put<Booking>(`/bookings/${id}/cancel`);
    return data;
  },
};