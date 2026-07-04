import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { useStats } from "@/hooks/queries/useStats";
import { useMyBookings } from "@/hooks/queries/useBookings";
import { useAuth } from "@/hooks/useAuth";
import { BookingTable } from "@/components/bookings/BookingTable";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Boxes, Clock, CheckCircle2, ClipboardList } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";
import { NewBookingDialog } from "@/components/bookings/NewBookingDialog";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · SILAP Aset" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data: stats } = useStats();
  const { data: mine, isLoading } = useMyBookings(user?.id ?? "");
  const t = useT();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${t("dashboard.welcome")}, ${user?.fullName ?? ""}`}
        description={t("dashboard.subtitle")}
        actions={<NewBookingDialog />}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("dashboard.stats.resources")} value={stats?.totalResources ?? "—"} icon={Boxes} />
        <StatCard label={t("dashboard.stats.pending")} value={stats?.pending ?? "—"} icon={Clock} />
        <StatCard label={t("dashboard.stats.approved")} value={stats?.approved ?? "—"} icon={CheckCircle2} />
        <StatCard label={t("dashboard.stats.completed")} value={stats?.completed ?? "—"} icon={ClipboardList} />
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("dashboard.yourBookings")}</h2>
        {isLoading ? <LoadingSkeleton /> : <BookingTable bookings={mine?.items ?? []} />}
      </section>
    </div>
  );
}