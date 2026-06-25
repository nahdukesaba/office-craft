import { z } from "zod";
import { BOOKING_MAX_DURATION_MIN } from "@/config/constants";
import { diffMinutes } from "@/lib/format";

export const bookingSchema = z
  .object({
    resourceId: z.string().min(1, "Required"),
    date: z.string().min(1, "Required"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    numberOfDays: z.coerce.number().int().min(1).max(30).default(1),
  })
  .refine((v) => diffMinutes(v.startTime, v.endTime) > 0, {
    message: "End must be after start", path: ["endTime"],
  })
  .refine((v) => diffMinutes(v.startTime, v.endTime) <= BOOKING_MAX_DURATION_MIN, {
    message: `Max ${BOOKING_MAX_DURATION_MIN / 60}h`, path: ["endTime"],
  });
export type BookingValues = z.infer<typeof bookingSchema>;