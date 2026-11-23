import assert from "node:assert/strict";
import test from "node:test";
import { hasBookingDateArrived } from "./bookingTime.ts";

test("a booking opens on its Jakarta start date and stays open afterward", () => {
  const lastMinuteOfNov23 = new Date("2026-11-23T16:59:00Z");
  const firstMinuteOfNov24 = new Date("2026-11-23T17:00:00Z");
  assert.equal(hasBookingDateArrived("2026-11-24", lastMinuteOfNov23), false);
  assert.equal(hasBookingDateArrived("2026-11-24", firstMinuteOfNov24), true);
  assert.equal(hasBookingDateArrived("2026-07-16", firstMinuteOfNov24), true);
});
