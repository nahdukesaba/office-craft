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
import { QueryError } from "@/components/common/QueryError";
import { PaginatedList } from "@/components/common/PaginatedList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { BookingStatus } from "@/types";
import { useT } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/_authenticated/my-bookings/")({
  head: () => ({ meta: [{ title: "My Bookings · SILAPET" }] }),
  component: MyBookingsPage,
});

function MyBookingsPage() {
  const { user } = useAuth();
  const { filters, setFilter, pages, setPage } = useBookingStore();
  const page = pages.mine ?? 1;
  const { data, isLoading, isError, isPlaceholderData, refetch } = useMyBookings(user?.id ?? "", { status: filters.status, page });
  const items = data?.items ?? [];
  const [addOpen, setAddOpen] = useState(false);
  const t = useT();
  return (
    <div className="space-y-4">
      <PageHeader
        title={t("myBookings.title")}
        description={t("myBookings.description")}
        actions={
          <div className="flex items-center gap-2">
            <Select value={filters.status ?? "all"} onValueChange={(v) => setFilter("status", v as BookingStatus | "all")}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("myBookings.allStatuses")}</SelectItem>
                <SelectItem value="pending">{t("status.pending")}</SelectItem>
                <SelectItem value="approved">{t("status.approved")}</SelectItem>
                <SelectItem value="in_use">{t("status.in_use")}</SelectItem>
                <SelectItem value="finished">{t("status.finished")}</SelectItem>
                <SelectItem value="needs_revision">{t("status.needs_revision")}</SelectItem>
                <SelectItem value="closed">{t("status.closed")}</SelectItem>
                <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
                <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="mr-1 size-4" />{t("myBookings.add")}</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-md overflow-y-auto">
                <DialogHeader><DialogTitle>{t("myBookings.new")}</DialogTitle></DialogHeader>
                <BookingForm onCreated={() => setAddOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      {isLoading ? <LoadingSkeleton /> : isError ? <QueryError onRetry={() => void refetch()} /> : (
        <PaginatedList page={page} data={data} busy={isPlaceholderData} onPageChange={(p) => setPage("mine", p)}>
          {items.length === 0 ? (
            <EmptyState title={t("myBookings.emptyTitle")} description={t("myBookings.emptyDesc")} />
          ) : <BookingTable bookings={items} />}
        </PaginatedList>
      )}
    </div>
  );
}
