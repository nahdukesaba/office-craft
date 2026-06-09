import { useMutation, useQueryClient } from "@tanstack/react-query";
import { proofsApi } from "@/services/api/proofs.api";
import { qk } from "@/lib/queryKeys";
import type { ProofKind } from "@/types";

export const useUploadProof = (bookingId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, file }: { kind: ProofKind; file: File }) => proofsApi.upload(bookingId, kind, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.proofs.list(bookingId) });
      qc.invalidateQueries({ queryKey: qk.bookings.detail(bookingId) });
    },
  });
};