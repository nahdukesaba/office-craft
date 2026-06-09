import type { BookingStatus } from "@/types";

export const BOOKING_TIME_STEP_MIN = 30;
export const BOOKING_MAX_DURATION_MIN = 240;

export const STATUS_COLOR: Record<BookingStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
  approved: "bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30",
  rejected: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
  completed: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
  cancelled: "Cancelled",
};