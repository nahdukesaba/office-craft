import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBooking } from "@/hooks/queries/useBookings";
import { useProofs } from "@/hooks/queries/useProofs";
import {
  useCancelBooking,
  useFinishBooking,
  useStartBooking,
} from "@/hooks/mutations/useBookingMutations";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceColorDot } from "@/components/common/ResourceColorDot";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProofGallery } from "@/components/bookings/ProofGallery";
import { ProofUploader } from "@/components/bookings/ProofUploader";
import { UsageActionDialog } from "@/components/bookings/UsageActionDialog";
import { BookingTimeline } from "@/components/bookings/BookingTimeline";
import {
  fmtDateTime,
  fmtBookingRange,
  daysBetweenInclusive,
  getBookingProofLifecycle,
} from "@/lib/format";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/errors";

import { useT } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/_authenticated/my-bookings/$id")({
  head: () => ({ meta: [{ title: "Booking · SILAPET" }] }),
  component: BookingDetail,
});

function BookingDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { data: booking, isLoading } = useBooking(id);
  const { data: proofs } = useProofs(id);
  const cancel = useCancelBooking();
  const start = useStartBooking();
  const finish = useFinishBooking();
  const t = useT();
  const [captureAction, setCaptureAction] = useState<"start" | "finish" | null>(null);
  const [revisionUploaded, setRevisionUploaded] = useState(false);

  if (isLoading || !booking) return <LoadingSkeleton rows={4} />;

  const isOwner = Boolean(user?.id && booking.userId === user.id);
  const {
    inWindow,
    hasBefore,
    hasAfter,
    hasRevisedAfter,
    showBeforeUploader,
    showAfterUploader,
    showWindowHint,
    canStart,
    canFinish,
    canCancel,
    needRevision,
  } = getBookingProofLifecycle({
    status: booking.status,
    date: booking.date,
    endDate: booking.endDate,
    proofs: proofs ?? [],
    isOwner,
    updatedAt: booking.updatedAt,
  });
  const days = daysBetweenInclusive(booking.date, booking.endDate);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/my-bookings">
          <ArrowLeft className="mr-1 size-4" />
          {t("action.back")}
        </Link>
      </Button>
      <PageHeader
        title={booking.resource?.name ?? "Booking"}
        titlePrefix={
          <ResourceColorDot resourceId={booking.resourceId} resource={booking.resource} />
        }
        description={`${fmtBookingRange(booking.date, booking.endDate, booking.startTime, booking.endTime)}${days > 1 ? ` · ${days} ${t("bookingDetail.daysSuffix")}` : ""}`}
        actions={<StatusBadge status={booking.status} />}
      />
      <Card>
        <CardContent className="space-y-2 p-4 text-sm">
          <p>
            <span className="text-muted-foreground">{t("bookingDetail.requested")}:</span>{" "}
            {fmtDateTime(booking.createdAt)}
          </p>
          {booking.purpose && (
            <p>
              <span className="text-muted-foreground">Purpose:</span> {booking.purpose}
            </p>
          )}
          {booking.adminNotes && (
            <p>
              <span className="text-muted-foreground">{t("bookingDetail.adminNotes")}:</span>{" "}
              {booking.adminNotes}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {isOwner && booking.status === "approved" && (
          <Button
            disabled={!canStart || start.isPending}
            className={canStart ? "glow-green" : undefined}
            title={
              !inWindow
                ? t("bookingDetail.startTitleWindow")
                : !hasBefore
                  ? t("booking.needBeforePhoto")
                  : undefined
            }
            onClick={async () => {
              if (hasBefore) {
                try {
                  await start.mutateAsync(booking.id);
                  toast.success(t("bookingDetail.usageStarted"));
                } catch (e: unknown) {
                  toast.error(friendlyError(e, t("bookingDetail.failed")));
                }
              } else {
                setCaptureAction("start");
              }
            }}
          >
            {t("booking.start")}
          </Button>
        )}
        {isOwner && (booking.status === "in_use" || booking.status === "needs_revision") && (
          <Button
            disabled={!canFinish || finish.isPending}
            className={canFinish ? "glow-red" : undefined}
            title={!hasAfter ? t("booking.needAfterPhoto") : undefined}
            onClick={async () => {
              if (needRevision && !hasRevisedAfter && !revisionUploaded) {
                // Re-capture on revision when a new after-proof has not been uploaded yet.
                setCaptureAction("finish");
                return;
              }
              if (hasAfter) {
                try {
                  await finish.mutateAsync(booking.id);
                  toast.success(t("bookingDetail.usageFinished"));
                } catch (e: unknown) {
                  toast.error(friendlyError(e, t("bookingDetail.failed")));
                }
              } else {
                setCaptureAction("finish");
              }
            }}
          >
            {t("booking.finish")}
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await cancel.mutateAsync(booking.id);
                toast.success(t("bookingDetail.cancelled"));
              } catch (e: unknown) {
                toast.error(friendlyError(e, t("bookingDetail.failed")));
              }
            }}
          >
            {t("booking.cancel")}
          </Button>
        )}
      </div>

      {needRevision && (
        <div className="flex items-start gap-2 rounded-md border border-chart-5/30 bg-chart-5/10 p-3 text-sm text-chart-5">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{t("bookingDetail.needsRevisionNotice")}</span>
        </div>
      )}
      {booking.status === "closed" && (
        <p className="text-sm text-muted-foreground">{t("bookingDetail.closed")}</p>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t("bookingDetail.proofPhotos")}</h2>
        {booking.status === "pending" && (
          <p className="text-sm text-muted-foreground">{t("bookingDetail.pendingHint")}</p>
        )}
        {showWindowHint && (
          <p className="text-sm text-muted-foreground">{t("bookingDetail.windowHint")}</p>
        )}
        {showBeforeUploader && !hasBefore && (
          <p className="text-sm text-muted-foreground">{t("booking.needBeforePhoto")}</p>
        )}
        {showAfterUploader && !hasAfter && !needRevision && (
          <p className="text-sm text-muted-foreground">{t("booking.needAfterPhoto")}</p>
        )}
        {(showBeforeUploader || showAfterUploader) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {showBeforeUploader && <ProofUploader bookingId={booking.id} kind="before" />}
            {showAfterUploader && (
              <ProofUploader
                bookingId={booking.id}
                kind="after"
                onUploaded={() => setRevisionUploaded(true)}
              />
            )}
          </div>
        )}
        <ProofGallery proofs={proofs ?? []} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("bookingDetail.timeline")}</h2>
        <BookingTimeline bookingId={booking.id} />
      </section>

      {captureAction && (
        <UsageActionDialog
          bookingId={booking.id}
          action={captureAction}
          open={!!captureAction}
          onOpenChange={(open) => !open && setCaptureAction(null)}
        />
      )}
    </div>
  );
}
