import type { BookingStatus } from "@/types";

export const BOOKING_TIME_STEP_MIN = 30;
export const BOOKING_MAX_DURATION_MIN = 240;

export const STATUS_COLOR: Record<BookingStatus, string> = {
  pending: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  approved: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  in_use: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  finished: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  completed: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  in_use: "In Use",
  finished: "Finished",
  rejected: "Rejected",
  completed: "Completed",
  cancelled: "Cancelled",
};
