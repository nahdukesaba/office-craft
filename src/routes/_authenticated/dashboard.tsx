import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { useMyBookings } from "@/hooks/queries/useBookings";
import { useResources } from "@/hooks/queries/useResources";
import { useAuth } from "@/hooks/useAuth";
import { BookingTable } from "@/components/bookings/BookingTable";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { QueryError } from "@/components/common/QueryError";
import { PaginatedList } from "@/components/common/PaginatedList";
import { Boxes, Clock, CheckCircle2, ClipboardList } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";
import { NewBookingDialog } from "@/components/bookings/NewBookingDialog";
import { useBookingStore } from "@/stores/bookingStore";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · SILAPET" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const t = useT();
  const page = useBookingStore((s) => s.pages.dashboard ?? 1);
  const setPage = useBookingStore((s) => s.setPage);

  const { data: resources } = useResources();

  // Stat cards only read `total`, so one row per status is enough.
  const { data: pending } = useMyBookings(user?.id ?? "", {
    status: "pending",
    pageSize: 1,
  });

  const { data: approved } = useMyBookings(user?.id ?? "", {
    status: "approved",
    pageSize: 1,
  });

  const { data: finished } = useMyBookings(user?.id ?? "", {
    status: "finished",
    pageSize: 1,
  });

  const { data: closed } = useMyBookings(user?.id ?? "", {
    status: "closed",
    pageSize: 1,
  });

  const { data: mine, isLoading, isError, isPlaceholderData, refetch } = useMyBookings(
    user?.id ?? "",
    { page },
  );

  const completedCount = finished && closed ? finished.total + closed.total : "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${t("dashboard.welcome")}, ${user?.fullName ?? ""}`}
        description={t("dashboard.subtitle")}
        actions={<NewBookingDialog />}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.stats.resources")}
          value={resources?.length ?? "—"}
          icon={Boxes}
        />

        <StatCard label={t("dashboard.stats.pending")} value={pending?.total ?? "—"} icon={Clock} />

        <StatCard
          label={t("dashboard.stats.approved")}
          value={approved?.total ?? "—"}
          icon={CheckCircle2}
        />

        <StatCard
          label={t("dashboard.stats.completed")}
          value={completedCount}
          icon={ClipboardList}
        />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("dashboard.yourBookings")}</h2>

        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <QueryError onRetry={() => void refetch()} />
        ) : (
          <PaginatedList
            page={page}
            data={mine}
            busy={isPlaceholderData}
            onPageChange={(p) => setPage("dashboard", p)}
          >
            {mine?.items.length ? (
              <BookingTable bookings={mine.items} />
            ) : (
              <EmptyState title={t("myBookings.emptyTitle")} description={t("myBookings.emptyDesc")} />
            )}
          </PaginatedList>
        )}
      </section>
    </div>
  );
}
