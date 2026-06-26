import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "@/services/api/bookings.api";
import { qk } from "@/lib/queryKeys";
import type { CreateBookingInput } from "@/types";

export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput & { userId: string }) => bookingsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.bookings.all });
      qc.invalidateQueries({ queryKey: qk.public.bookings() });
    },
  });
};

export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.bookings.all }),
  });
};

export const useApproveBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => bookingsApi.approve(id, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.bookings.all }),
  });
};

export const useRejectBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => bookingsApi.reject(id, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.bookings.all }),
  });
};

export const useCloseBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => bookingsApi.close(id, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.bookings.all }),
  });
};

export const useStartBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.start(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.bookings.all }),
  });
};

export const useFinishBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.finish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.bookings.all }),
  });
};