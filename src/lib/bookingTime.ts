/**
 * Backend uses ISO 8601 timestamps in Asia/Jakarta (UTC+7, no DST) plus
 * derived `date`/`endDate` (YYYY-MM-DD). The frontend historically stores
 * booking times as `HH:mm` strings with a separate `date`/`endDate`.
 * These helpers convert between the two shapes at the API boundary.
 */

const JAKARTA_OFFSET = "+07:00";

export function composeJakartaISO(dateYMD: string, timeHHmm: string): string {
  // dateYMD: YYYY-MM-DD ; timeHHmm: HH:mm
  return `${dateYMD}T${timeHHmm}:00${JAKARTA_OFFSET}`;
}

export function isoToJakartaHHmm(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
}

export function isoToJakartaYMD(iso: string): string {
  // en-CA yields YYYY-MM-DD
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

/** True from the booking's start date onward (Asia/Jakarta), with no end limit. */
export function hasBookingDateArrived(startDateYMD: string, now: Date = new Date()): boolean {
  return isoToJakartaYMD(now.toISOString()) >= startDateYMD;
}

export function roundUpToStep(hhmm: string, stepMin: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const rounded = Math.ceil((h * 60 + m) / stepMin) * stepMin;
  const clamped = rounded % (24 * 60);
  return `${String(Math.floor(clamped / 60)).padStart(2, "0")}:${String(clamped % 60).padStart(2, "0")}`;
}

/**
 * Pushes a candidate start time past any approved booking it falls inside,
 * repeating until it lands in a free slot (handles back-to-back approvals).
 */
export function nextAvailableStart(
  candidateStart: string,
  approvedBookings: { startTime: string; endTime: string }[],
): string {
  let start = candidateStart;
  const sorted = [...approvedBookings].sort((a, b) => a.startTime.localeCompare(b.startTime));
  let moved = true;
  while (moved) {
    moved = false;
    for (const b of sorted) {
      if (start >= b.startTime && start < b.endTime) {
        start = b.endTime;
        moved = true;
      }
    }
  }
  return start;
}

/**
 * Default start time for a new booking: Jakarta "now + 1h" rounded to the
 * booking step, bumped forward past any approved booking already occupying
 * that slot today. Only meaningful for today's date — the caller should
 * only use this when the selected date is today.
 */
export function defaultBookingStart(
  todaysApprovedBookings: { startTime: string; endTime: string }[],
  stepMin: number,
): string {
  const nowJakarta = isoToJakartaHHmm(new Date().toISOString());
  const oneHourFromNow = addMinutesHHmm(nowJakarta, 60);
  const rounded = roundUpToStep(oneHourFromNow, stepMin);
  return nextAvailableStart(rounded, todaysApprovedBookings);
}

function addMinutesHHmm(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (h * 60 + m + minutes + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
