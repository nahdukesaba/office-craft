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

export const Route = createFileRoute("/_authenticated/my-bookings/$id")({
  head: () => ({ meta: [{ title: "Booking · SILAP Aset" }] }),
  component: BookingDetail,
});

function BookingDetail() {
  const { id } = Route.useParams();
  const { data: booking, isLoading } = useBooking(id);
  const { data: proofs } = useProofs(id);
  const cancel = useCancelBooking();
  const start = useStartBooking();
  const finish = useFinishBooking();

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
        <Link to="/my-bookings"><ArrowLeft className="mr-1 size-4" />Back</Link>
      </Button>
      <PageHeader
        title={booking.resource?.name ?? "Booking"}
        description={`${fmtBookingRange(booking.date, booking.endDate, booking.startTime, booking.endTime)}${days > 1 ? ` · ${days} days` : ""}`}
        actions={<StatusBadge status={booking.status} />}
      />
      <Card>
        <CardContent className="space-y-2 p-4 text-sm">
          <p><span className="text-muted-foreground">Requested:</span> {fmtDateTime(booking.createdAt)}</p>
          {booking.adminNotes && <p><span className="text-muted-foreground">Admin notes:</span> {booking.adminNotes}</p>}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {booking.status === "approved" && (
          <Button
            disabled={!canStart || !hasBefore}
            title={!inWindow ? "You can only start on the booked day" : !hasBefore ? "Upload a 'before' photo first" : undefined}
            onClick={async () => {
              try { await start.mutateAsync(booking.id); toast.success("Usage started"); }
              catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
            }}
          >
            Mulai Pemakaian
          </Button>
        )}
        {booking.status === "in_use" && (
          <Button
            disabled={!canFinish || !hasAfter}
            title={!hasAfter ? "Upload an 'after' photo first" : undefined}
            onClick={async () => {
              try { await finish.mutateAsync(booking.id); toast.success("Usage finished"); }
              catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
            }}
          >
            Selesai Pemakaian
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            onClick={async () => {
              try { await cancel.mutateAsync(booking.id); toast.success("Booking cancelled"); }
              catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
            }}
          >
            Cancel booking
          </Button>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Proof photos</h2>
        {booking.status === "pending" && (
          <p className="text-sm text-muted-foreground">Photos can be uploaded once your booking is approved.</p>
        )}
        {(booking.status === "approved" || booking.status === "in_use") && !inWindow && (
          <p className="text-sm text-muted-foreground">Photo upload becomes available on your booked day.</p>
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