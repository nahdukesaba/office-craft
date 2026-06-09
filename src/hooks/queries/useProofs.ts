import { useQuery, queryOptions } from "@tanstack/react-query";
import { proofsApi } from "@/services/api/proofs.api";
import { qk } from "@/lib/queryKeys";

export const proofsQueryOptions = (bookingId: string) =>
  queryOptions({ queryKey: qk.proofs.list(bookingId), queryFn: () => proofsApi.list(bookingId) });

export const useProofs = (bookingId: string) => useQuery(proofsQueryOptions(bookingId));