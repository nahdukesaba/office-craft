import { format, parseISO } from "date-fns";

export const fmtDate = (iso: string) => format(parseISO(iso), "MMM d, yyyy");
export const fmtDateTime = (iso: string) => format(parseISO(iso), "MMM d, yyyy HH:mm");
export const fmtTime = (hhmm: string) => hhmm;

export function diffMinutes(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export function addHoursHHmm(hhmm: string, hours: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (h * 60 + m + hours * 60 + 24 * 60) % (24 * 60);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export function fmtBookingRange(
  date: string,
  endDate: string | undefined,
  startTime: string,
  endTime: string,
): string {
  const end = endDate ?? date;
  if (end === date) return `${fmtDate(date)} · ${startTime} – ${endTime}`;
  return `${fmtDate(date)} ${startTime} – ${fmtDate(end)} ${endTime}`;
}

export function daysBetweenInclusive(startDate: string, endDate?: string): number {
  if (!endDate || endDate === startDate) return 1;
  const a = parseISO(startDate).getTime();
  const b = parseISO(endDate).getTime();
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

export function isTodayInRange(startDate: string, endDate?: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const end = endDate ?? startDate;
  return today >= startDate && today <= end;
}