import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { BookingTable } from "@/components/bookings/BookingTable";
import { BookingForm } from "@/components/bookings/BookingForm";
import { useMyBookings } from "@/hooks/queries/useBookings";
import { useAuth } from "@/hooks/useAuth";
import { useBookingStore } from "@/stores/bookingStore";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { BookingStatus } from "@/types";

export const Route = createFileRoute("/_authenticated/my-bookings/")({
  head: () => ({ meta: [{ title: "My Bookings · SILAP Aset" }] }),
  component: MyBookingsPage,
});

function MyBookingsPage() {
  const { user } = useAuth();
  const { filters, setFilter } = useBookingStore();
  const { data, isLoading } = useMyBookings(user?.id ?? "", { status: filters.status });
  const items = data?.items ?? [];
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div className="space-y-4">
      <PageHeader
        title="My Bookings"
        description="Your booking history and pending requests."
        actions={
          <div className="flex items-center gap-2">
            <Select value={filters.status ?? "all"} onValueChange={(v) => setFilter("status", v as BookingStatus | "all")}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="in_use">In Use</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="mr-1 size-4" />Add Booking</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>New booking</DialogTitle></DialogHeader>
                <BookingForm onCreated={() => setAddOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      {isLoading ? <LoadingSkeleton /> : items.length === 0 ? (
        <EmptyState title="No bookings yet" description="Browse resources to make your first booking." />
      ) : <BookingTable bookings={items} />}
    </div>
  );
}