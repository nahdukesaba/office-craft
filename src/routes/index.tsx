import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/layouts/PublicLayout";
import { CalendarView } from "@/components/calendar/CalendarView";
import { usePublicBookings } from "@/hooks/queries/useBookings";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Booking Calendar · SILAP Aset" },
      { name: "description", content: "Browse the public booking calendar for rooms and cars. Sign in to request a booking or upload proofs." },
      { property: "og:title", content: "Booking Calendar · SILAP Aset" },
      { property: "og:description", content: "See who has booked which resource and when." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { isAuthed } = useAuth();
  const { data, isLoading } = usePublicBookings();

  return (
    <PublicLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Booking Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            See all approved and requested bookings. {isAuthed ? "Open a resource to request a new booking." : "Sign in to request a booking or upload proofs."}
          </p>
        </div>
        {!isAuthed && (
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/login">Sign in</Link></Button>
            <Button asChild><Link to="/register">Create account</Link></Button>
          </div>
        )}
        {isAuthed && (
          <Button asChild><Link to="/resources">Browse resources</Link></Button>
        )}
      </div>
      {isLoading ? <LoadingSkeleton rows={6} /> : <CalendarView bookings={data ?? []} />}
    </PublicLayout>
  );
}