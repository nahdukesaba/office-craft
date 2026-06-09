import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { BookingTable } from "@/components/bookings/BookingTable";
import { useMyBookings } from "@/hooks/queries/useBookings";
import { useAuth } from "@/hooks/useAuth";
import { useBookingStore } from "@/stores/bookingStore";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BookingStatus } from "@/types";

export const Route = createFileRoute("/_authenticated/my-bookings/")({
  head: () => ({ meta: [{ title: "My Bookings · Resource Hub" }] }),
  component: MyBookingsPage,
});

function MyBookingsPage() {
  const { user } = useAuth();
  const { filters, setFilter } = useBookingStore();
  const { data, isLoading } = useMyBookings(user?.id ?? "", { status: filters.status });
  const items = data?.items ?? [];
  return (
    <div className="space-y-4">
      <PageHeader
        title="My Bookings"
        description="Your booking history and pending requests."
        actions={
          <Select value={filters.status ?? "all"} onValueChange={(v) => setFilter("status", v as BookingStatus | "all")}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      {isLoading ? <LoadingSkeleton /> : items.length === 0 ? (
        <EmptyState title="No bookings yet" description="Browse resources to make your first booking." />
      ) : <BookingTable bookings={items} />}
    </div>
  );
}