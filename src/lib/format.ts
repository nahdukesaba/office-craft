import { format, parseISO } from "date-fns";

export const fmtDate = (iso: string) => format(parseISO(iso), "MMM d, yyyy");
export const fmtDateTime = (iso: string) => format(parseISO(iso), "MMM d, yyyy HH:mm");
export const fmtTime = (hhmm: string) => hhmm;

export function diffMinutes(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}