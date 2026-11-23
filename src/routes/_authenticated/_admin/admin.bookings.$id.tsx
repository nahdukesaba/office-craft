import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useBooking } from "@/hooks/queries/useBookings";
import { useProofs } from "@/hooks/queries/useProofs";
import {
  useApproveBooking,
  useCloseBooking,
  useRejectBooking,
  useRevokeBooking,
  useRequestRevisionBooking,
  useNotifyBooking,
} from "@/hooks/mutations/useBookingMutations";
import { useT } from "@/i18n/LanguageProvider";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { QueryError } from "@/components/common/QueryError";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceColorDot } from "@/components/common/ResourceColorDot";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ProofGallery } from "@/components/bookings/ProofGallery";
import { BookingTimeline } from "@/components/bookings/BookingTimeline";
import { fmtDateTime, fmtBookingRange, daysBetweenInclusive } from "@/lib/format";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { bookingRuleMessage, friendlyError } from "@/lib/errors";

export const Route = createFileRoute("/_authenticated/_admin/admin/bookings/$id")({
  head: () => ({ meta: [{ title: "Review Booking · Admin" }] }),
  component: AdminBookingReview,
});

function AdminBookingReview() {
  const { id } = Route.useParams();
  const { data: booking, isLoading, isError, refetch } = useBooking(id);
  const { data: proofs } = useProofs(id);
  const approve = useApproveBooking();
  const reject = useRejectBooking();
  const close = useCloseBooking();
  const revoke = useRevokeBooking();
  const requestRevision = useRequestRevisionBooking();
  const notify = useNotifyBooking();
  const t = useT();
  const [notes, setNotes] = useState("");

  if (isError && !booking) return <QueryError onRetry={() => void refetch()} />;
  if (isLoading || !booking) return <LoadingSkeleton rows={4} />;

  const act = async (fn: () => Promise<unknown>, msg: string) => {
    try {
      await fn();
      toast.success(msg);
    } catch (e: unknown) {
      toast.error(friendlyError(e));
    }
  };

  const canRevoke = booking.status === "approved" || booking.status === "in_use";

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/admin/bookings">
          <ArrowLeft className="mr-1 size-4" />
          {t("action.back")}
        </Link>
      </Button>
      <PageHeader
        title={booking.resource?.name ?? "Booking"}
        titlePrefix={
          <ResourceColorDot resourceId={booking.resourceId} resource={booking.resource} />
        }
        description={`${fmtBookingRange(
          booking.date,
          booking.endDate,
          booking.startTime,
          booking.endTime,
        )}${
          daysBetweenInclusive(booking.date, booking.endDate) > 1
            ? ` · ${daysBetweenInclusive(booking.date, booking.endDate)} days`
            : ""
        }`}
        actions={<StatusBadge status={booking.status} />}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-2 p-4 text-sm">
            <p className="font-semibold">{t("adminBookingDetail.requester")}</p>
            <p>{booking.user?.fullName}</p>
            <p className="text-muted-foreground">{booking.user?.email}</p>
            <p className="pt-2 text-muted-foreground">
              {t("bookingDetail.requested")} {fmtDateTime(booking.createdAt)}
            </p>
            {booking.purpose && (
              <p>
                <span className="text-muted-foreground">Purpose:</span> {booking.purpose}
              </p>
            )}
            {booking.adminNotes && (
              <p>
                {t("bookingDetail.adminNotes")}: {booking.adminNotes}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-semibold">{t("bookingDetail.adminNotes")}</p>
            <Textarea
              aria-label={t("bookingDetail.adminNotes")}
              placeholder={t("adminBookingDetail.notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={booking.status !== "pending"}
                onClick={async () => {
                  try {
                    const res = await approve.mutateAsync({ id: booking.id, notes });
                    const count = res?.autoRejectedIds?.length ?? 0;
                    toast.success(
                      count > 0
                        ? `${t("adminBookingDetail.approved")} · ${count} ${t("adminBookingDetail.autoRejected")}`
                        : t("adminBookingDetail.approved"),
                    );
                  } catch (e: unknown) {
                    toast.error(bookingRuleMessage(e, t) ?? friendlyError(e));
                  }
                }}
              >
                {t("action.approve")}
              </Button>
              <Button
                variant="destructive"
                disabled={booking.status !== "pending"}
                onClick={() =>
                  act(
                    () => reject.mutateAsync({ id: booking.id, notes }),
                    t("adminBookingDetail.rejected"),
                  )
                }
              >
                {t("action.reject")}
              </Button>
              <Button
                variant="destructive"
                disabled={!canRevoke || revoke.isPending}
                onClick={() =>
                  act(
                    () => revoke.mutateAsync({ id: booking.id, notes: notes || undefined }),
                    t("adminBookingDetail.revoked"),
                  )
                }
              >
                {t("action.revoke")}
              </Button>
              <Button
                variant="outline"
                disabled={booking.status !== "finished"}
                onClick={() =>
                  act(
                    () => close.mutateAsync({ id: booking.id, notes }),
                    t("adminBookingDetail.closed"),
                  )
                }
              >
                {t("action.closeBooking")}
              </Button>
              <Button
                variant="outline"
                disabled={!["finished", "in_use"].includes(booking.status)}
                onClick={() =>
                  act(
                    () => requestRevision.mutateAsync({ id: booking.id, notes }),
                    t("adminBookingDetail.requestRevision"),
                  )
                }
              >
                {t("action.requestRevision")}
              </Button>
              <Button
                variant="outline"
                disabled={false}
                onClick={() =>
                  act(
                    () => notify.mutateAsync({ id: booking.id, message: notes }),
                    t("adminBookingDetail.notifySent"),
                  )
                }
              >
                {t("action.notify")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("adminBookingDetail.autoNotifyHint")}
            </p>
            {booking.status !== "finished" && booking.status !== "completed" && (
              <p className="text-xs text-muted-foreground">{t("booking.closeOnlyFinished")}</p>
            )}
          </CardContent>
        </Card>
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("bookingDetail.proofPhotos")}</h2>
        <ProofGallery proofs={proofs ?? []} />
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("bookingDetail.timeline")}</h2>
        <BookingTimeline bookingId={booking.id} />
      </section>
    </div>
  );
}
