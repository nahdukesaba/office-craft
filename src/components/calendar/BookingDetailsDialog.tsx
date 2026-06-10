import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import type { Booking } from "@/types";
import { colorForResource } from "@/lib/colors";

export function BookingDetailsDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { isAuthed } = useAuth();
  if (!booking) return null;
  const color = colorForResource(booking.resourceId);
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
          <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{booking.date}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span>{booking.startTime} – {booking.endTime}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={booking.status} /></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Booked by</span><span>{booking.user?.fullName ?? "—"}</span></div>
          {booking.resource?.type === "room" && (
            <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span>{booking.resource.location}</span></div>
          )}
          {booking.resource?.type === "car" && (
            <div className="flex justify-between"><span className="text-muted-foreground">Plate</span><span>{booking.resource.licensePlate}</span></div>
          )}
          {booking.adminNotes && (
            <div className="rounded-md border border-border bg-muted/40 p-2 text-xs text-muted-foreground">
              {booking.adminNotes}
            </div>
          )}
        </div>
        <DialogFooter>
          {isAuthed ? (
            <Button asChild>
              <Link to="/resources/$id" params={{ id: booking.resourceId }}>View resource</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/login">Sign in to book</Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}