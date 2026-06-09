import { env } from "@/lib/env";
import { mockDb } from "@/services/mocks/db";
import { http } from "@/services/http";
import type { Proof, ProofKind } from "@/types";

export const proofsApi = {
  async list(bookingId: string): Promise<Proof[]> {
    if (env.useMocks) return mockDb.listProofs(bookingId);
    const { data } = await http.get<Proof[]>(`/bookings/${bookingId}/proofs`);
    return data;
  },
  async upload(bookingId: string, kind: ProofKind, file: File): Promise<Proof> {
    if (env.useMocks) return mockDb.uploadProof(bookingId, kind, file);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    const { data } = await http.post<Proof>(`/bookings/${bookingId}/proofs`, fd);
    return data;
  },
};