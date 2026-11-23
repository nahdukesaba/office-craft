import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { GroupedBookingTable } from "@/components/bookings/GroupedBookingTable";
import { ExportBookingsDialog } from "@/components/admin/ExportBookingsDialog";
import { useBookings } from "@/hooks/queries/useBookings";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { QueryError } from "@/components/common/QueryError";
import { PaginatedList } from "@/components/common/PaginatedList";
import { useBookingStore } from "@/stores/bookingStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { BookingStatus } from "@/types";
import { useT } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/_authenticated/_admin/admin/bookings/")({
  head: () => ({ meta: [{ title: "Review Bookings · Admin" }] }),
  component: AdminBookings,
});

function AdminBookings() {
  const { filters, setFilter, pages, setPage } = useBookingStore();
  const page = pages.admin ?? 1;
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const { data, isLoading, isError, isPlaceholderData, refetch } = useBookings({
    status: filters.status,
    search: appliedSearch || undefined,
    page,
  });
  const t = useT();

  // Search runs on the server so it covers every page, not only the rows loaded now.
  useEffect(() => {
    const q = search.trim();
    if (q === appliedSearch) return;
    const timer = setTimeout(() => {
      setAppliedSearch(q);
      setPage("admin", 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, appliedSearch, setPage]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("adminBookings.title")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("adminBookings.searchUser")}
                aria-label={t("adminBookings.searchUser")}
                className="w-56 pl-8"
              />
            </div>
            <Select
              value={filters.status ?? "all"}
              onValueChange={(v) => setFilter("status", v as BookingStatus | "all")}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("adminBookings.filterAll")}</SelectItem>
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
            <ExportBookingsDialog />
          </div>
        }
      />
      {isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <QueryError onRetry={() => void refetch()} />
      ) : (
        <PaginatedList page={page} data={data} busy={isPlaceholderData} onPageChange={(p) => setPage("admin", p)}>
          <GroupedBookingTable
            bookings={data?.items ?? []}
            detailHrefBase="/admin/bookings"
            partial={(data?.totalPages ?? 1) > 1}
          />
        </PaginatedList>
      )}
    </div>
  );
}
