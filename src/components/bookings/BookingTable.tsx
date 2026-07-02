import { Link } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { fmtDate } from "@/lib/format";
import type { Booking } from "@/types";
import { Button } from "@/components/ui/button";

export function BookingTable({
  bookings,
  detailHrefBase = "/my-bookings",
}: {
  bookings: Booking[];
  detailHrefBase?: "/my-bookings" | "/admin/bookings";
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resource</TableHead>
            <TableHead className="hidden sm:table-cell">User</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="hidden md:table-cell">Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="font-medium">
                {detailHrefBase === "/admin/bookings" ? (
                  <Link to="/admin/bookings/$id" params={{ id: b.id }} className="hover:underline">
                    {b.resource?.name ?? b.resourceId}
                  </Link>
                ) : (
                  <Link to="/my-bookings/$id" params={{ id: b.id }} className="hover:underline">
                    {b.resource?.name ?? b.resourceId}
                  </Link>
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell">{b.user?.fullName ?? "-"}</TableCell>
              <TableCell>{fmtDate(b.date)}</TableCell>
              <TableCell className="hidden md:table-cell">{b.startTime} – {b.endTime}</TableCell>
              <TableCell><StatusBadge status={b.status} /></TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="ghost">
                  {detailHrefBase === "/admin/bookings" ? (
                    <Link to="/admin/bookings/$id" params={{ id: b.id }}>View</Link>
                  ) : (
                    <Link to="/my-bookings/$id" params={{ id: b.id }}>View</Link>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}