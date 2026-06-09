import { env } from "@/lib/env";
import { mockDb } from "@/services/mocks/db";
import { http } from "@/services/http";
import type { Booking, BookingFilters } from "@/types";

export const publicApi = {
  async allBookings(filters: BookingFilters = {}): Promise<Booking[]> {
    if (env.useMocks) return mockDb.publicBookings(filters);
    const { data } = await http.get<Booking[]>("/public/bookings/all", { params: filters });
    return data;
  },
  async resourceBookings(resourceId: string): Promise<Booking[]> {
    if (env.useMocks) return mockDb.publicBookings({ resourceId });
    const { data } = await http.get<Booking[]>(`/public/bookings/resource/${resourceId}`);
    return data;
  },
};

export const statsApi = {
  async overview() {
    if (env.useMocks) return mockDb.stats();
    const { data } = await http.get("/stats/overview");
    return data as Awaited<ReturnType<typeof mockDb.stats>>;
  },
};