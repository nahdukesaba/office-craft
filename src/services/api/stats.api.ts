import { http } from "@/services/http";
import type { BookingInsights, BookingStatus } from "@/types";

export interface StatsOverview {
  totalUsers: number;
  totalResources: number;
  totalBookings: number;
  bookingsByStatus: Partial<Record<BookingStatus, number>>;
  activeBookings?: number;
  pendingUsers?: number;
}

function unwrap<T>(data: T | { data: T }): T {
  return (data as { data?: T }).data ?? (data as T);
}

export const statsApi = {
  async overview(): Promise<StatsOverview> {
    const { data } = await http.get<StatsOverview | { data: StatsOverview }>("/stats/overview");
    return unwrap(data);
  },
  async insights(params: { from: string; to: string }): Promise<BookingInsights> {
    const { data } = await http.get<BookingInsights | { data: BookingInsights }>(
      "/reports/bookings/insights",
      { params },
    );
    return unwrap(data);
  },

  /**
   * Downloads booking rows as CSV for the given date range. Server returns a
   * text/csv payload with a Content-Disposition filename.
   */
  async exportCsv(params: { from: string; to: string }): Promise<{ blob: Blob; filename: string }> {
    const response = await http.get<Blob>("/reports/bookings/export", {
      params,
      responseType: "blob",
    });

    const blob = response.data;
    const contentDisposition = String(response.headers["content-disposition"] ?? "");
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(contentDisposition);
    const filename = match?.[1] ?? `bookings-${params.from}_${params.to}.csv`;

    return { blob, filename };
  },
};
