import { CameraCapture } from "@/components/bookings/CameraCapture";
import { useUploadProof } from "@/hooks/mutations/useProofMutations";
import { useT } from "@/i18n/LanguageProvider";
import { friendlyError } from "@/lib/errors";
import { toast } from "sonner";
import type { ProofKind } from "@/types";

export function ProofUploader({
  bookingId,
  kind,
  onUploaded,
}: {
  bookingId: string;
  kind: ProofKind;
  onUploaded?: () => void;
}) {
  const upload = useUploadProof(bookingId);
  const t = useT();
  const label = kind === "before" ? t("booking.beforePhoto") : t("booking.afterPhoto");

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <CameraCapture
        onFile={async (file) => {
          try {
            await upload.mutateAsync({ kind, file });
            onUploaded?.();
            toast.success(`${label} uploaded`);
          } catch (e: unknown) {
            toast.error(friendlyError(e, t("bookingDetail.failed")));
          }
        }}
      />
    </div>
  );
}