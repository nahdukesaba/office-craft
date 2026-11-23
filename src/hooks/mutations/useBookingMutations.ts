import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "@/services/api/bookings.api";
import { settingsApi } from "@/services/api/settings.api";
import { qk } from "@/lib/queryKeys";
import type { CreateBookingInput } from "@/types";

const invalidateAll = (qc: ReturnType<typeof useQueryClient>, id?: string) => {
  qc.invalidateQueries({ queryKey: qk.bookings.all });
  qc.invalidateQueries({ queryKey: qk.public.bookings() });
  if (id) {
    qc.invalidateQueries({ queryKey: qk.bookings.detail(id) });
    qc.invalidateQueries({ queryKey: qk.bookings.history(id) });
  }
};

export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput & { userId: string }) => bookingsApi.create(input),
    onSuccess: (b) => invalidateAll(qc, b.id),
  });
};

export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: (b) => invalidateAll(qc, b.id),
  });
};

export const useApproveBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => bookingsApi.approve(id, notes),
    onSuccess: (res, vars) => invalidateAll(qc, res.booking?.id ?? vars.id),
  });
};

export const useRejectBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => bookingsApi.reject(id, notes),
    onSuccess: (b) => invalidateAll(qc, b.id),
  });
};

export const useRevokeBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => bookingsApi.revoke(id, notes),
    onSuccess: (b) => invalidateAll(qc, b.id),
  });
};

export const useCloseBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => bookingsApi.close(id, notes),
    onSuccess: (b) => invalidateAll(qc, b.id),
  });
};

export const useStartBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.start(id),
    onSuccess: (b) => invalidateAll(qc, b.id),
  });
};

export const useFinishBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.finish(id),
    onSuccess: (b) => invalidateAll(qc, b.id),
  });
};

export const useNotifyBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message?: string }) =>
      bookingsApi.notify(id, message),
    onSuccess: (_r, vars) => invalidateAll(qc, vars.id),
  });
};

export const useRemindOverdue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => bookingsApi.remindOverdue(),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.bookings.overdue }),
  });
};

export const useUpdateBookingRules = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.updateBookingRules,
    onSuccess: (rules) => qc.setQueryData(qk.settings.bookingRules, rules),
  });
};

export const useRequestRevisionBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      bookingsApi.requestRevision(id, notes),
    onSuccess: (b) => invalidateAll(qc, b.id),
  });
};
