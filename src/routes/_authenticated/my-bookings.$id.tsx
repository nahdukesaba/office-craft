import { createFileRoute, Link } from "@tanstack/react-router";
import { useBooking } from "@/hooks/queries/useBookings";
import { useProofs } from "@/hooks/queries/useProofs";
import {
  useCancelBooking,
  useFinishBooking,
  useStartBooking,
} from "@/hooks/mutations/useBookingMutations";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProofUploader } from "@/components/bookings/ProofUploader";
import { ProofGallery } from "@/components/bookings/ProofGallery";
import { fmtDateTime, fmtBookingRange, daysBetweenInclusive, isTodayInRange } from "@/lib/format";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/_authenticated/my-bookings/$id")({
  head: () => ({ meta: [{ title: "Booking · SILAPET" }] }),
  component: BookingDetail,
});

function BookingDetail() {
  const { id } = Route.useParams();
  const { data: booking, isLoading } = useBooking(id);
  const { data: proofs } = useProofs(id);
  const cancel = useCancelBooking();
  const start = useStartBooking();
  const finish = useFinishBooking();
  const t = useT();

  if (isLoading || !booking) return <LoadingSkeleton rows={4} />;

  const hasBefore = (proofs ?? []).some((p) => p.kind === "before");
  const hasAfter = (proofs ?? []).some((p) => p.kind === "after");
  const inWindow = isTodayInRange(booking.date, booking.endDate);
  const canCancel = booking.status === "pending" || booking.status === "approved";
  const canStart = booking.status === "approved" && inWindow;
  const canFinish = booking.status === "in_use";
  // Proofs only allowed once approved AND today is within booking window
  const showBeforeUploader = booking.status === "approved" && inWindow;
  const showAfterUploader = booking.status === "in_use" && inWindow;
  const days = daysBetweenInclusive(booking.date, booking.endDate);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/my-bookings"><ArrowLeft className="mr-1 size-4" />{t("action.back")}</Link>
      </Button>
      <PageHeader
        title={booking.resource?.name ?? "Booking"}
        description={`${fmtBookingRange(booking.date, booking.endDate, booking.startTime, booking.endTime)}${days > 1 ? ` · ${days} ${t("bookingDetail.daysSuffix")}` : ""}`}
        actions={<StatusBadge status={booking.status} />}
      />
      <Card>
        <CardContent className="space-y-2 p-4 text-sm">
          <p><span className="text-muted-foreground">{t("bookingDetail.requested")}:</span> {fmtDateTime(booking.createdAt)}</p>
          {booking.adminNotes && <p><span className="text-muted-foreground">{t("bookingDetail.adminNotes")}:</span> {booking.adminNotes}</p>}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {booking.status === "approved" && (
          <Button
            disabled={!canStart || !hasBefore}
            title={!inWindow ? t("bookingDetail.startTitleWindow") : !hasBefore ? t("bookingDetail.startTitleNeedBefore") : undefined}
            onClick={async () => {
              try { await start.mutateAsync(booking.id); toast.success(t("bookingDetail.usageStarted")); }
              catch (e: unknown) { toast.error(e instanceof Error ? e.message : t("bookingDetail.failed")); }
            }}
          >
            {t("booking.start")}
          </Button>
        )}
        {booking.status === "in_use" && (
          <Button
            disabled={!canFinish || !hasAfter}
            title={!hasAfter ? t("bookingDetail.finishTitleNeedAfter") : undefined}
            onClick={async () => {
              try { await finish.mutateAsync(booking.id); toast.success(t("bookingDetail.usageFinished")); }
              catch (e: unknown) { toast.error(e instanceof Error ? e.message : t("bookingDetail.failed")); }
            }}
          >
            {t("booking.finish")}
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            onClick={async () => {
              try { await cancel.mutateAsync(booking.id); toast.success(t("bookingDetail.cancelled")); }
              catch (e: unknown) { toast.error(e instanceof Error ? e.message : t("bookingDetail.failed")); }
            }}
          >
            {t("booking.cancel")}
          </Button>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t("bookingDetail.proofPhotos")}</h2>
        {booking.status === "pending" && (
          <p className="text-sm text-muted-foreground">{t("bookingDetail.pendingHint")}</p>
        )}
        {(booking.status === "approved" || booking.status === "in_use") && !inWindow && (
          <p className="text-sm text-muted-foreground">{t("bookingDetail.windowHint")}</p>
        )}
        {(showBeforeUploader || showAfterUploader) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {showBeforeUploader && <ProofUploader bookingId={booking.id} kind="before" />}
            {showAfterUploader && <ProofUploader bookingId={booking.id} kind="after" />}
          </div>
        )}
        <ProofGallery proofs={proofs ?? []} />
      </section>
    </div>
  );
}