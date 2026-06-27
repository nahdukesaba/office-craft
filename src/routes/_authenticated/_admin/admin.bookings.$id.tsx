import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useBooking } from "@/hooks/queries/useBookings";
import { useProofs } from "@/hooks/queries/useProofs";
import { useApproveBooking, useCloseBooking, useRejectBooking, useNotifyBooking } from "@/hooks/mutations/useBookingMutations";
import { useT } from "@/i18n/LanguageProvider";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ProofGallery } from "@/components/bookings/ProofGallery";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/_admin/admin/bookings/$id")({
  head: () => ({ meta: [{ title: "Review Booking · Admin" }] }),
  component: AdminBookingReview,
});

function AdminBookingReview() {
  const { id } = Route.useParams();
  const { data: booking, isLoading } = useBooking(id);
  const { data: proofs } = useProofs(id);
  const approve = useApproveBooking();
  const reject = useRejectBooking();
  const close = useCloseBooking();
  const notify = useNotifyBooking();
  const t = useT();
  const [notes, setNotes] = useState("");
  const canNotify = booking?.status === "approved" || booking?.status === "in_use" || booking?.status === "pending";

  if (isLoading || !booking) return <LoadingSkeleton rows={4} />;

  const act = async (fn: () => Promise<unknown>, msg: string) => {
    try { await fn(); toast.success(msg); }
    catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/admin/bookings"><ArrowLeft className="mr-1 size-4" />Back</Link>
      </Button>
      <PageHeader
        title={booking.resource?.name ?? "Booking"}
        description={`${fmtDate(booking.date)} · ${booking.startTime} – ${booking.endTime}`}
        actions={<StatusBadge status={booking.status} />}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-2 p-4 text-sm">
            <p className="font-semibold">Requester</p>
            <p>{booking.user?.fullName}</p>
            <p className="text-muted-foreground">{booking.user?.email}</p>
            <p className="pt-2 text-muted-foreground">Requested {fmtDateTime(booking.createdAt)}</p>
            {booking.adminNotes && <p>Notes: {booking.adminNotes}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-semibold">Admin notes</p>
            <Textarea placeholder="Optional notes for the requester" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Button disabled={booking.status !== "pending"} onClick={() => act(() => approve.mutateAsync({ id: booking.id, notes }), "Approved")}>Approve</Button>
              <Button variant="destructive" disabled={booking.status !== "pending"} onClick={() => act(() => reject.mutateAsync({ id: booking.id, notes }), "Rejected")}>Reject</Button>
              <Button variant="outline" disabled={booking.status !== "finished"} onClick={() => act(() => close.mutateAsync({ id: booking.id, notes }), "Closed")}>Mark completed</Button>
              <Button
                variant="secondary"
                disabled={!canNotify || notify.isPending}
                onClick={() => act(() => notify.mutateAsync({ id: booking.id, message: notes || undefined }), t("admin.notifySent"))}
              >
                {t("admin.notify")}
              </Button>
            </div>
            {booking.status !== "finished" && booking.status !== "completed" && (
              <p className="text-xs text-muted-foreground">
                You can only close bookings that the user has finished.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Proof photos</h2>
        <ProofGallery proofs={proofs ?? []} />
      </section>
    </div>
  );
}