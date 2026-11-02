import { isoToJakartaYMD } from "./bookingTime.ts";

export const MONDAY_WEEK_OPTIONS = { weekStartsOn: 1 as const };

export function calendarDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseCalendarDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new RangeError(`Invalid calendar date: ${value}`);

  const [, year, month, day] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day), 12);
  if (calendarDateKey(parsed) !== value) {
    throw new RangeError(`Invalid calendar date: ${value}`);
  }
  return parsed;
}

export function jakartaCalendarToday(now: Date = new Date()): Date {
  return parseCalendarDate(isoToJakartaYMD(now.toISOString()));
}

export function isJakartaCalendarToday(date: Date, now: Date = new Date()): boolean {
  return calendarDateKey(date) === isoToJakartaYMD(now.toISOString());
}
