import { http } from "@/services/http";
import type { Proof, ProofKind } from "@/types";

/** Backend proof row. `path` is the storage key; `url` is a signed/public URL. */
interface ApiProof {
  id: string;
  bookingId: string;
  kind: ProofKind;
  path: string;
  url?: string;
  createdAt: string;
}

const MAX_PROOF_IMAGE_BYTES = 10 * 1024 * 1024;

function normalize(p: ApiProof): Proof {
  return {
    id: p.id,
    bookingId: p.bookingId,
    kind: p.kind,
    url: p.url || p.path,
    uploadedAt: p.createdAt,
  };
}

export const proofsApi = {
  async list(bookingId: string): Promise<Proof[]> {
    const { data } = await http.get<ApiProof[] | { data: ApiProof[] }>(
      `/bookings/${bookingId}/proofs/signed`,
    );
    const rows = Array.isArray(data) ? data : data.data ?? [];
    return rows.map(normalize);
  },
  async upload(bookingId: string, kind: ProofKind, file: File): Promise<Proof> {
    if (!file || file.size <= 0 || file.size > MAX_PROOF_IMAGE_BYTES) {
      throw new Error("Image must be between 1 byte and 10 MiB");
    }
    if (file.type && !file.type.startsWith("image/")) {
      throw new Error("Please upload a valid image file");
    }

    const formData = new FormData();
    formData.append("kind", kind);
    formData.append("file", file);

    const { data } = await http.post<ApiProof | { data: ApiProof }>(
      `/bookings/${bookingId}/proofs/upload`,
      formData,
    );
    const raw = (data as { data?: ApiProof }).data ?? (data as ApiProof);
    return normalize(raw);
  },
};
