import { createFileRoute, Link } from "@tanstack/react-router";
import { useBooking } from "@/hooks/queries/useBookings";
import { useProofs } from "@/hooks/queries/useProofs";
import { useCancelBooking } from "@/hooks/mutations/useBookingMutations";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProofUploader } from "@/components/bookings/ProofUploader";
import { ProofGallery } from "@/components/bookings/ProofGallery";
import { fmtDate, fmtDateTime } from "@/lib/format";
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

  if (isLoading || !booking) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/my-bookings"><ArrowLeft className="mr-1 size-4" />Back</Link>
      </Button>
      <PageHeader
        title={booking.resource?.name ?? "Booking"}
        description={`${fmtDate(booking.date)} · ${booking.startTime} – ${booking.endTime}`}
        actions={<StatusBadge status={booking.status} />}
      />
      <Card>
        <CardContent className="space-y-2 p-4 text-sm">
          <p><span className="text-muted-foreground">Requested:</span> {fmtDateTime(booking.createdAt)}</p>
          {booking.adminNotes && <p><span className="text-muted-foreground">Admin notes:</span> {booking.adminNotes}</p>}
        </CardContent>
      </Card>

      {(booking.status === "pending" || booking.status === "approved") && (
        <Button
          variant="outline"
          onClick={async () => {
            try {
              await cancel.mutateAsync(booking.id);
              toast.success("Booking cancelled");
            } catch (e: unknown) {
              toast.error(e instanceof Error ? e.message : "Failed");
            }
          }}
        >
          Cancel booking
        </Button>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Proof photos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ProofUploader bookingId={booking.id} kind="before" />
          <ProofUploader bookingId={booking.id} kind="after" />
        </div>
        <ProofGallery proofs={proofs ?? []} />
      </section>
    </div>
  );
}