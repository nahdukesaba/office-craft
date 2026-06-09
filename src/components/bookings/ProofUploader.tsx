import { FileDropzone } from "@/components/common/FileDropzone";
import { useUploadProof } from "@/hooks/mutations/useProofMutations";
import { toast } from "sonner";
import type { ProofKind } from "@/types";

export function ProofUploader({ bookingId, kind }: { bookingId: string; kind: ProofKind }) {
  const upload = useUploadProof(bookingId);
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium capitalize">{kind} photo</p>
      <FileDropzone
        onFile={async (file) => {
          try {
            await upload.mutateAsync({ kind, file });
            toast.success(`${kind} photo uploaded`);
          } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Upload failed");
          }
        }}
      />
    </div>
  );
}