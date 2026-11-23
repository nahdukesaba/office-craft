import { http } from "@/services/http";
import { composeJakartaISO, isoToJakartaHHmm, isoToJakartaYMD } from "@/lib/bookingTime";
import { fetchAllPages } from "@/lib/pagination";
import type { NotifyResult, OverdueSummary, TimelineEntry } from "@/types";
import type {
  Booking,
  BookingFilters,
  BookingStatus,
  BookingUserRef,
  CreateBookingInput,
  Paginated,
  Resource,
} from "@/types";

/**
 * Backend booking shape as returned by the Office-Craft API.
 * ISO 8601 timestamps in Asia/Jakarta.
 */
interface ApiBookingRaw {
  id: string;
  resourceId: string;
  userId: string;
  startTime: string; // ISO
  endTime: string; // ISO
  date?: string; // YYYY-MM-DD
  endDate?: string;
  status: BookingStatus;
  purpose?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  resource?: Resource;
  user?: BookingUserRef;
}

interface ApiPaginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

function normalizeBooking(b: ApiBookingRaw): Booking {
  const date = b.date ?? isoToJakartaYMD(b.startTime);
  const endDate = b.endDate ?? isoToJakartaYMD(b.endTime);
  return {
    id: b.id,
    resourceId: b.resourceId,
    userId: b.userId,
    date,
    endDate,
    startTime: isoToJakartaHHmm(b.startTime),
    endTime: isoToJakartaHHmm(b.endTime),
    startTimeISO: b.startTime,
    endTimeISO: b.endTime,
    status: b.status,
    purpose: b.purpose,
    adminNotes: b.adminNotes,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    resource: b.resource,
    user: b.user,
  };
}

function toListParams(
  filters: BookingFilters & { userId?: string; page?: number; pageSize?: number },
) {
  const p: Record<string, string | number> = {};
  if (filters.status && filters.status !== "all") p.status = filters.status;
  if (filters.resourceId) p.resourceId = filters.resourceId;
  if (filters.userId) p.userId = filters.userId;
  if (filters.from) p.from = filters.from;
  if (filters.to) p.to = filters.to;
  if (filters.search) p.search = filters.search;
  if (filters.page) p.page = filters.page;
  if (filters.pageSize) p.pageSize = filters.pageSize;
  return p;
}

export interface ApproveBookingResponse {
  booking: Booking;
  autoRejectedIds: string[];
}

export const bookingsApi = {
  async list(
    filters: BookingFilters & { userId?: string; page?: number; pageSize?: number } = {},
  ): Promise<Paginated<Booking>> {
    const { data } = await http.get<ApiPaginated<ApiBookingRaw>>("/bookings", {
      params: toListParams(filters),
    });
    return {
      items: (data.data ?? []).map(normalizeBooking),
      page: data.page ?? 1,
      pageSize: data.pageSize ?? data.data?.length ?? 0,
      total: data.total ?? data.data?.length ?? 0,
      totalPages: data.totalPages ?? 1,
    };
  },
  /** Every matching booking across all pages, for exports. */
  async listAll(filters: BookingFilters = {}): Promise<Booking[]> {
    return fetchAllPages((page) => bookingsApi.list({ ...filters, page, pageSize: 100 }));
  },
  async get(id: string): Promise<Booking> {
    const { data } = await http.get<ApiBookingRaw | { data: ApiBookingRaw }>(`/bookings/${id}`);
    const raw = (data as { data?: ApiBookingRaw }).data ?? (data as ApiBookingRaw);
    return normalizeBooking(raw);
  },
  async create(input: CreateBookingInput & { userId: string }): Promise<Booking> {
    const endDate = input.endDate ?? input.date;
    const payload = {
      resourceId: input.resourceId,
      startTime: composeJakartaISO(input.date, input.startTime),
      endTime: composeJakartaISO(endDate, input.endTime),
      purpose: input.purpose ?? "",
    };
    const { data } = await http.post<ApiBookingRaw | { data: ApiBookingRaw }>("/bookings", payload);
    const raw = (data as { data?: ApiBookingRaw }).data ?? (data as ApiBookingRaw);
    return normalizeBooking(raw);
  },
  async approve(id: string, adminNotes?: string): Promise<ApproveBookingResponse> {
    const { data } = await http.put<
      { booking: ApiBookingRaw; autoRejectedIds?: string[] } | ApiBookingRaw
    >(`/bookings/${id}/approve`, { adminNotes });
    const withWrapper = data as { booking?: ApiBookingRaw; autoRejectedIds?: string[] };
    const raw = withWrapper.booking ?? (data as ApiBookingRaw);
    return {
      booking: normalizeBooking(raw),
      autoRejectedIds: withWrapper.autoRejectedIds ?? [],
    };
  },
  async reject(id: string, adminNotes?: string): Promise<Booking> {
    const { data } = await http.put<ApiBookingRaw>(`/bookings/${id}/reject`, { adminNotes });
    return normalizeBooking(data);
  },
  async close(id: string, adminNotes?: string): Promise<Booking> {
    const { data } = await http.put<ApiBookingRaw>(`/bookings/${id}/close`, { adminNotes });
    return normalizeBooking(data);
  },
  async cancel(id: string): Promise<Booking> {
    const { data } = await http.put<ApiBookingRaw>(`/bookings/${id}/cancel`);
    return normalizeBooking(data);
  },
  async revoke(id: string, adminNotes?: string): Promise<Booking> {
    const { data } = await http.put<ApiBookingRaw>(`/bookings/${id}/revoke`, { adminNotes });
    return normalizeBooking(data);
  },
  async start(id: string): Promise<Booking> {
    const { data } = await http.put<ApiBookingRaw>(`/bookings/${id}/start`);
    return normalizeBooking(data);
  },
  async finish(id: string): Promise<Booking> {
    const { data } = await http.put<ApiBookingRaw>(`/bookings/${id}/finish`);
    return normalizeBooking(data);
  },
  async notify(id: string, message?: string): Promise<NotifyResult> {
    const { data } = await http.post<NotifyResult>(`/bookings/${id}/notify`, { message });
    return data;
  },
  async overdueSummary(): Promise<OverdueSummary> {
    const { data } = await http.get<OverdueSummary>("/bookings/overdue/summary");
    return data;
  },
  async remindOverdue(): Promise<OverdueSummary> {
    const { data } = await http.post<OverdueSummary>("/bookings/overdue/remind");
    return data;
  },
  async requestRevision(id: string, adminNotes?: string): Promise<Booking> {
    const { data } = await http.put<ApiBookingRaw>(`/bookings/${id}/request-revision`, {
      adminNotes,
    });
    return normalizeBooking(data);
  },
  async history(id: string): Promise<TimelineEntry[]> {
    const { data } = await http.get<TimelineEntry[] | { data: TimelineEntry[] }>(
      `/bookings/${id}/history`,
    );
    return Array.isArray(data) ? data : (data.data ?? []);
  },
};
