import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { useStats } from "@/hooks/queries/useStats";
import { useBookings } from "@/hooks/queries/useBookings";
import { Boxes, Clock, CheckCircle2, ClipboardList } from "lucide-react";
import { BookingTable } from "@/components/bookings/BookingTable";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";

export const Route = createFileRoute("/_authenticated/_admin/admin/")({
  head: () => ({ meta: [{ title: "Admin · SILAP Aset" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats } = useStats();
  const { data: pending, isLoading } = useBookings({ status: "pending" });
  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Operational overview." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Resources" value={stats?.totalResources ?? "—"} icon={Boxes} />
        <StatCard label="Pending" value={stats?.pending ?? "—"} icon={Clock} />
        <StatCard label="Approved" value={stats?.approved ?? "—"} icon={CheckCircle2} />
        <StatCard label="Bookings" value={stats?.totalBookings ?? "—"} icon={ClipboardList} />
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Pending requests</h2>
        {isLoading ? <LoadingSkeleton /> : <BookingTable bookings={pending?.items ?? []} detailHrefBase="/admin/bookings" />}
      </section>
    </div>
  );
}