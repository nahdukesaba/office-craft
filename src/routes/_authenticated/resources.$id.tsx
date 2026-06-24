import { createFileRoute, Link } from "@tanstack/react-router";
import { useResource } from "@/hooks/queries/useResources";
import { usePublicBookings } from "@/hooks/queries/useBookings";
import { PageHeader } from "@/components/common/PageHeader";
import { BookingForm } from "@/components/bookings/BookingForm";
import { CalendarView } from "@/components/calendar/CalendarView";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/resources/$id")({
  head: () => ({ meta: [{ title: "Resource · SILAP Aset" }] }),
  component: ResourceDetailPage,
});

function ResourceDetailPage() {
  const { id } = Route.useParams();
  const { data: resource, isLoading } = useResource(id);
  const { data: bookings } = usePublicBookings({ resourceId: id });

  if (isLoading || !resource) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/resources"><ArrowLeft className="mr-1 size-4" />Back</Link>
      </Button>
      <PageHeader title={resource.name} description={resource.description} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          {resource.photoUrl && (
            <img src={resource.photoUrl} alt={resource.name} className="aspect-video w-full object-cover" />
          )}
          <CardContent className="space-y-2 p-4 text-sm">
            {resource.type === "room" ? (
              <>
                <p><span className="text-muted-foreground">Location:</span> {resource.location}</p>
                <p><span className="text-muted-foreground">Capacity:</span> {resource.capacity}</p>
                <p><span className="text-muted-foreground">Equipment:</span> {resource.equipment.join(", ") || "—"}</p>
              </>
            ) : (
              <>
                <p><span className="text-muted-foreground">License:</span> {resource.licensePlate}</p>
                <p><span className="text-muted-foreground">Fuel:</span> {resource.fuelType}</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 font-semibold">Request booking</h3>
            <BookingForm resourceId={resource.id} />
          </CardContent>
        </Card>
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Availability</h2>
        <CalendarView bookings={bookings ?? []} />
      </section>
    </div>
  );
}