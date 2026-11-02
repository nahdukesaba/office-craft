import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { endOfWeek, startOfWeek } from "date-fns";

import {
  calendarDateKey,
  isJakartaCalendarToday,
  jakartaCalendarToday,
  MONDAY_WEEK_OPTIONS,
  parseCalendarDate,
} from "./calendarDate.ts";

test("calendar weeks run from Monday through Sunday", () => {
  const monday = parseCalendarDate("2026-11-02");

  assert.equal(monday.getDay(), 1);
  assert.equal(calendarDateKey(startOfWeek(monday, MONDAY_WEEK_OPTIONS)), "2026-11-02");
  assert.equal(calendarDateKey(endOfWeek(monday, MONDAY_WEEK_OPTIONS)), "2026-11-08");
});

test("calendar today follows Asia/Jakarta across the UTC date boundary", () => {
  const sundayUtcMondayWib = new Date("2026-11-01T17:30:00.000Z");
  const today = jakartaCalendarToday(sundayUtcMondayWib);

  assert.equal(calendarDateKey(today), "2026-11-02");
  assert.equal(isJakartaCalendarToday(parseCalendarDate("2026-11-02"), sundayUtcMondayWib), true);
  assert.equal(isJakartaCalendarToday(parseCalendarDate("2026-11-01"), sundayUtcMondayWib), false);
});

test("public month queries preserve calendar state while the next month loads", async () => {
  const source = await readFile(
    new URL("../hooks/queries/useBookings.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /placeholderData:\s*\(previousData\)\s*=>\s*previousData/);
});
