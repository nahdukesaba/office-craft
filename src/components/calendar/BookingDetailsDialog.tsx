import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import type { Booking } from "@/types";
import { colorForResource } from "@/lib/colors";
import { fmtBookingRange, daysBetweenInclusive } from "@/lib/format";
import { useT } from "@/i18n/LanguageProvider";

export function BookingDetailsDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { isAuthed, isAdmin, user } = useAuth();
  const t = useT();
  if (!booking) return null;
  const isOwnBooking = isAuthed && user?.id === booking.userId;
  const color = colorForResource(booking.resourceId, booking.resource);
  const days = daysBetweenInclusive(booking.date, booking.endDate);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-block size-3 rounded-full" style={{ background: color }} />
            {booking.resource?.name ?? "Booking"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">{t("calendar.when")}</span>
            <span className="text-right">
              {fmtBookingRange(booking.date, booking.endDate, booking.startTime, booking.endTime)}
              {days > 1 && ` · ${days} ${t("bookingDetail.daysSuffix")}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("calendar.status")}</span>
            <StatusBadge status={booking.status} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("calendar.bookedBy")}</span>
            <span>{booking.user?.fullName ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("calendar.purpose")}</span>
            <span>{booking.purpose ?? "—"}</span>
          </div>

          {(booking.resource?.type === "room" || booking.resource?.type === "equipment") && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("resource.location")}</span>
              <span>{booking.resource.location || "—"}</span>
            </div>
          )}
          {(booking.resource?.type === "car" || booking.resource?.type === "bike") && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("calendar.plate")}</span>
              <span>{booking.resource.licensePlate}</span>
            </div>
          )}
          {booking.adminNotes && (
            <div className="rounded-md border border-border bg-muted/40 p-2 text-xs text-muted-foreground">
              {booking.adminNotes}
            </div>
          )}
        </div>
        <DialogFooter>
          {isAuthed ? (
            <>
              <Button asChild variant="outline">
                <Link to="/resources/$id" params={{ id: booking.resourceId }}>
                  {t("calendar.viewResource")}
                </Link>
              </Button>
              {isOwnBooking && (
                <Button asChild>
                  <Link to="/my-bookings/$id" params={{ id: booking.id }}>
                    {t("calendar.goToMyBooking")}
                  </Link>
                </Button>
              )}
              {isAdmin && (
                <Button asChild>
                  <Link to="/admin/bookings/$id" params={{ id: booking.id }}>
                    {t("calendar.goToBooking")}
                  </Link>
                </Button>
              )}
            </>
          ) : (
            <Button asChild>
              <Link to="/login">{t("calendar.signInToBook")}</Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
