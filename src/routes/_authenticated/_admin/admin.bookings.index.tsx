import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { GroupedBookingTable } from "@/components/bookings/GroupedBookingTable";
import { ExportBookingsDialog } from "@/components/admin/ExportBookingsDialog";
import { useBookings } from "@/hooks/queries/useBookings";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useBookingStore } from "@/stores/bookingStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BookingStatus } from "@/types";
import { useT } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/_authenticated/_admin/admin/bookings/")({
  head: () => ({ meta: [{ title: "Review Bookings · Admin" }] }),
  component: AdminBookings,
});

function AdminBookings() {
  const { filters, setFilter } = useBookingStore();
  const { data, isLoading } = useBookings({ status: filters.status });
  const t = useT();
  return (
    <div className="space-y-4">
      <PageHeader
        title={t("adminBookings.title")}
        actions={
          <div className="flex items-center gap-2">
            <Select value={filters.status ?? "all"} onValueChange={(v) => setFilter("status", v as BookingStatus | "all")}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("adminBookings.filterAll")}</SelectItem>
                <SelectItem value="pending">{t("status.pending")}</SelectItem>
                <SelectItem value="approved">{t("status.approved")}</SelectItem>
                <SelectItem value="in_use">{t("status.in_use")}</SelectItem>
                <SelectItem value="finished">{t("status.finished")}</SelectItem>
                <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
                <SelectItem value="completed">{t("status.completed")}</SelectItem>
                <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
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