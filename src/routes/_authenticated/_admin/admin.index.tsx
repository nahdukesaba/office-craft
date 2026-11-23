import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { useStats } from "@/hooks/queries/useStats";
import { useBookings } from "@/hooks/queries/useBookings";
import { Boxes, Clock, CheckCircle2, ClipboardList, Users } from "lucide-react";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { QueryError } from "@/components/common/QueryError";
import { PaginatedList } from "@/components/common/PaginatedList";
import { GroupedBookingTable } from "@/components/bookings/GroupedBookingTable";
import { ExportBookingsDialog } from "@/components/admin/ExportBookingsDialog";
import { BookingControlsCard } from "@/components/admin/BookingControlsCard";
import { useT } from "@/i18n/LanguageProvider";
import { useBookingStore } from "@/stores/bookingStore";

export const Route = createFileRoute("/_authenticated/_admin/admin/")({
  head: () => ({ meta: [{ title: "Admin · SILAPET" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats } = useStats();
  const page = useBookingStore((s) => s.pages.adminPending ?? 1);
  const setPage = useBookingStore((s) => s.setPage);
  const {
    data: pending,
    isLoading,
    isError,
    isPlaceholderData,
    refetch,
  } = useBookings({ status: "pending", page });
  const t = useT();
  const by = stats?.bookingsByStatus ?? {};
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("adminDashboard.title")}
        description={t("adminDashboard.subtitle")}
        actions={<ExportBookingsDialog />}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label={t("dashboard.stats.users")}
          value={stats?.totalUsers ?? "—"}
          icon={Users}
        />
        <StatCard
          label={t("dashboard.stats.resources")}
          value={stats?.totalResources ?? "—"}
          icon={Boxes}
        />
        <StatCard label={t("dashboard.stats.pending")} value={by.pending ?? "—"} icon={Clock} />
        <StatCard
          label={t("dashboard.stats.approved")}
          value={by.approved ?? "—"}
          icon={CheckCircle2}
        />
        <StatCard
          label={t("dashboard.stats.bookings")}
          value={stats?.totalBookings ?? "—"}
          icon={ClipboardList}
        />
      </div>
      <BookingControlsCard />
      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("adminDashboard.pendingRequests")}</h2>
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <QueryError onRetry={() => void refetch()} />
        ) : (
          <PaginatedList
            page={page}
            data={pending}
            busy={isPlaceholderData}
            onPageChange={(p) => setPage("adminPending", p)}
          >
            <GroupedBookingTable
              bookings={pending?.items ?? []}
              detailHrefBase="/admin/bookings"
              partial={(pending?.totalPages ?? 1) > 1}
            />
          </PaginatedList>
        )}
      </section>
    </div>
  );
}
