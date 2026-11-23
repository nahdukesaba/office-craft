import { useBookingHistory } from "@/hooks/queries/useBookings";
import { fmtDateTime } from "@/lib/format";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { QueryError } from "@/components/common/QueryError";
import type { TimelineEntry } from "@/types";
import {
  CheckCircle2,
  XCircle,
  PlayCircle,
  Flag,
  Ban,
  ShieldAlert,
  ImagePlus,
  Circle,
} from "lucide-react";

function iconFor(e: TimelineEntry) {
  if (e.type === "proof_uploaded") return ImagePlus;
  switch (e.eventType) {
    case "approved":
      return CheckCircle2;
    case "rejected":
    case "auto_rejected":
      return XCircle;
    case "started":
      return PlayCircle;
    case "finished":
      return Flag;
    case "cancelled":
      return Ban;
    case "revoked":
      return ShieldAlert;
    default:
      return Circle;
  }
}

function labelFor(e: TimelineEntry): string {
  if (e.type === "proof_uploaded") {
    return e.proofKind === "before" ? "Before photo uploaded" : "After photo uploaded";
  }
  switch (e.eventType) {
    case "created":
      return "Booking requested";
    case "approved":
      return "Approved";
    case "auto_rejected":
      return "Auto-rejected (conflict)";
    case "rejected":
      return "Rejected";
    case "started":
      return "Usage started";
    case "finished":
      return "Usage finished";
    case "cancelled":
      return "Cancelled";
    case "revoked":
      return "Revoked by admin";
    default:
      return e.eventType;
  }
}

export function BookingTimeline({ bookingId }: { bookingId: string }) {
  const { data, isLoading, isError, refetch } = useBookingHistory(bookingId);
  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (isError) return <QueryError onRetry={() => void refetch()} />;
  const entries = data ?? [];
  if (entries.length === 0) {
    return <EmptyState title="No history yet" description="Actions on this booking will appear here." />;
  }
  return (
    <ol className="relative space-y-4 border-l border-border pl-6">
      {entries.map((e, i) => {
        const Icon = iconFor(e);
        const actorName = e.actor?.fullName ?? (e.actorId ? "System" : undefined);
        const notes = e.type === "status_change" ? e.notes : undefined;
        return (
          <li key={i} className="relative">
            <span className="absolute -left-[34px] flex size-6 items-center justify-center rounded-full border border-border bg-background">
              <Icon className="size-3.5 text-muted-foreground" />
            </span>
            <p className="text-sm font-medium">{labelFor(e)}</p>
            <p className="text-xs text-muted-foreground">
              {fmtDateTime(e.timestamp)}
              {actorName ? ` · ${actorName}` : ""}
            </p>
            {notes && <p className="mt-1 text-sm text-muted-foreground">{notes}</p>}
          </li>
        );
      })}
    </ol>
  );
}
