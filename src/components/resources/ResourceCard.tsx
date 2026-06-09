import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Resource } from "@/types";
import { Car as CarIcon, DoorOpen } from "lucide-react";

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Link
      to="/resources/$id"
      params={{ id: resource.id }}
      className="group block focus:outline-none"
    >
      <Card className="overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {resource.photoUrl ? (
            <img
              src={resource.photoUrl}
              alt={resource.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              {resource.type === "car" ? <CarIcon className="size-8" /> : <DoorOpen className="size-8" />}
            </div>
          )}
        </div>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight">{resource.name}</h3>
            <Badge variant={resource.isAvailable ? "default" : "secondary"}>
              {resource.isAvailable ? "Available" : "Unavailable"}
            </Badge>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{resource.description}</p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {resource.type === "room" ? `Room · ${resource.location}` : `Car · ${resource.licensePlate}`}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}