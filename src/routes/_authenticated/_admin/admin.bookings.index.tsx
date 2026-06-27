import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { GroupedBookingTable } from "@/components/bookings/GroupedBookingTable";
import { ExportBookingsDialog } from "@/components/admin/ExportBookingsDialog";
import { useBookings } from "@/hooks/queries/useBookings";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useBookingStore } from "@/stores/bookingStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BookingStatus } from "@/types";

export const Route = createFileRoute("/_authenticated/_admin/admin/bookings/")({
  head: () => ({ meta: [{ title: "Review Bookings · Admin" }] }),
  component: AdminBookings,
});

function AdminBookings() {
  const { filters, setFilter } = useBookingStore();
  const { data, isLoading } = useBookings({ status: filters.status });
  return (
    <div className="space-y-4">
      <PageHeader
        title="Review Bookings"
        actions={
          <div className="flex items-center gap-2">
            <Select value={filters.status ?? "all"} onValueChange={(v) => setFilter("status", v as BookingStatus | "all")}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="in_use">In Use</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <ExportBookingsDialog />
          </div>
        }
      />
      {isLoading ? <LoadingSkeleton /> : <GroupedBookingTable bookings={data?.items ?? []} detailHrefBase="/admin/bookings" />}
    </div>
  );
}