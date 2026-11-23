import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CameraCapture } from "@/components/bookings/CameraCapture";
import { useUploadProof } from "@/hooks/mutations/useProofMutations";
import { useFinishBooking, useStartBooking } from "@/hooks/mutations/useBookingMutations";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/i18n/LanguageProvider";

/**
 * Combines "capture proof photo(s)" + "start/finish usage" into one step.
 * Multiple photos can be captured and reviewed before anything is sent —
 * all photos upload first, and only once every upload succeeds do we call
 * start/finish, so the booking's status never advances on a partial/failed
 * upload.
 */
export function UsageActionDialog({
  bookingId,
  action,
  open,
  onOpenChange,
}: {
  bookingId: string;
  action: "start" | "finish";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const upload = useUploadProof(bookingId);
  const start = useStartBooking();
  const finish = useFinishBooking();
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const kind = action === "start" ? "before" : "after";

  // Reset when the dialog is closed/reopened for a different booking/action.
  useEffect(() => {
    if (!open) setFiles([]);
  }, [open]);

  function addFile(file: File) {
    setFiles((prev) => [...prev, file]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (files.length === 0) return;
    setSubmitting(true);
    try {
      // Sequential, not Promise.all: keeps upload order stable and makes
      // partial-failure handling (which file failed) unambiguous.
      for (const file of files) {
        await upload.mutateAsync({ kind, file });
      }
      if (action === "start") {
        await start.mutateAsync(bookingId);
        toast.success(t("bookingDetail.usageStarted"));
      } else {
        await finish.mutateAsync(bookingId);
        toast.success(t("bookingDetail.usageFinished"));
      }
      onOpenChange(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("bookingDetail.failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{action === "start" ? t("booking.start") : t("booking.finish")}</DialogTitle>
          <DialogDescription>
            {action === "start"
              ? t("bookingDetail.captureBeforeDesc")
              : t("bookingDetail.captureAfterDesc")}
          </DialogDescription>
        </DialogHeader>

        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {files.map((file, i) => (
              <FileThumb
                key={`${file.name}-${i}`}
                file={file}
                onRemove={() => removeFile(i)}
                disabled={submitting}
              />
            ))}
          </div>
        )}

        {!submitting && <CameraCapture onFile={addFile} />}

        {files.length > 0 && !submitting && (
          <p className="rounded-md border border-chart-5/30 bg-chart-5/10 p-2 text-xs text-chart-5-text">
            {t("bookingDetail.proofsLockedNotice")}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            className="w-full"
            disabled={files.length === 0 || submitting}
            onClick={handleSubmit}
          >
            {submitting
              ? t("bookingDetail.submitting")
              : `${action === "start" ? t("booking.start") : t("booking.finish")}${files.length > 0 ? ` (${files.length})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FileThumb({
  file,
  onRemove,
  disabled,
}: {
  file: File;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const t = useT();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="relative aspect-square overflow-hidden rounded-md border border-border">
      {url && <img src={url} alt={file.name} className="h-full w-full object-cover" />}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`${t("action.delete")} ${file.name}`}
        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow transition-colors after:absolute after:-inset-1.5 hover:bg-background disabled:opacity-50"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
