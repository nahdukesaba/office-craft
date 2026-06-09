import { createFileRoute } from "@tanstack/react-router";
import { CalendarView } from "@/components/calendar/CalendarView";
import { usePublicBookings } from "@/hooks/queries/useBookings";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Public Calendar · Resource Hub" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const { data, isLoading } = usePublicBookings();
  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <PageHeader title="Public Calendar" description="All approved and completed bookings across resources." />
      <div className="mt-4">
        {isLoading ? <LoadingSkeleton rows={6} /> : <CalendarView bookings={data ?? []} />}
      </div>
    </div>
  );
}