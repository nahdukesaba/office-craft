import { describe, expect, it } from "bun:test";
import { getBookingProofLifecycle, isTodayInRange } from "../src/lib/format";
import type { BookingStatus } from "../src/types";

describe("SILAPET Booking Proof & Usage Lifecycle Eligibility", () => {
  // 2026-10-20 01:15:00 WIB (Asia/Jakarta, UTC+7) is 2026-10-19T18:15:00.000Z in UTC
  const nowJakartaEarlyMorning = new Date("2026-10-19T18:15:00.000Z");

  it("evaluates isTodayInRange using Asia/Jakarta date even between 00:00 and 06:59 WIB", () => {
    expect(isTodayInRange("2026-10-20", "2026-10-20", nowJakartaEarlyMorning)).toBe(true);
    expect(isTodayInRange("2026-10-19", "2026-10-19", nowJakartaEarlyMorning)).toBe(false);
    expect(isTodayInRange("2026-10-21", "2026-10-21", nowJakartaEarlyMorning)).toBe(false);
  });

  it("Case A: status=approved, within booking window, before proof missing -> BEFORE upload available, Start Usage disabled", () => {
    const state = getBookingProofLifecycle({
      status: "approved",
      date: "2026-10-20",
      endDate: "2026-10-20",
      proofs: [],
      isOwner: true,
      now: nowJakartaEarlyMorning,
    });

    expect(state.inWindow).toBe(true);
    expect(state.hasBefore).toBe(false);
    expect(state.showBeforeUploader).toBe(true);
    expect(state.showAfterUploader).toBe(false);
    expect(state.showWindowHint).toBe(false);
    expect(state.canStart).toBe(false);
    expect(state.canFinish).toBe(false);
  });

  it("Case B: status=approved, within booking window, before proof exists -> proof visible & Start Usage available", () => {
    const state = getBookingProofLifecycle({
      status: "approved",
      date: "2026-10-20",
      endDate: "2026-10-20",
      proofs: [{ kind: "before", uploadedAt: "2026-10-19T18:16:00.000Z" }],
      isOwner: true,
      now: nowJakartaEarlyMorning,
    });

    expect(state.inWindow).toBe(true);
    expect(state.hasBefore).toBe(true);
    expect(state.showBeforeUploader).toBe(true);
    expect(state.showAfterUploader).toBe(false);
    expect(state.showWindowHint).toBe(false);
    expect(state.canStart).toBe(true);
    expect(state.canFinish).toBe(false);
  });

  it("Case C: status=in_use, after proof missing -> AFTER upload available, Finish Usage disabled", () => {
    const state = getBookingProofLifecycle({
      status: "in_use",
      date: "2026-10-20",
      endDate: "2026-10-20",
      proofs: [{ kind: "before", uploadedAt: "2026-10-19T18:16:00.000Z" }],
      isOwner: true,
      now: nowJakartaEarlyMorning,
    });

    expect(state.hasBefore).toBe(true);
    expect(state.hasAfter).toBe(false);
    expect(state.showBeforeUploader).toBe(false);
    expect(state.showAfterUploader).toBe(true);
    expect(state.showWindowHint).toBe(false);
    expect(state.canStart).toBe(false);
    expect(state.canFinish).toBe(false);
  });

  it("Case D: status=in_use, after proof exists -> Finish Usage available", () => {
    const state = getBookingProofLifecycle({
      status: "in_use",
      date: "2026-10-20",
      endDate: "2026-10-20",
      proofs: [
        { kind: "before", uploadedAt: "2026-10-19T18:16:00.000Z" },
        { kind: "after", uploadedAt: "2026-10-19T18:20:00.000Z" },
      ],
      isOwner: true,
      now: nowJakartaEarlyMorning,
    });

    expect(state.hasBefore).toBe(true);
    expect(state.hasAfter).toBe(true);
    expect(state.showBeforeUploader).toBe(false);
    expect(state.showAfterUploader).toBe(true);
    expect(state.canStart).toBe(false);
    expect(state.canFinish).toBe(true);
  });

  it("Case E: status=needs_revision -> AFTER/revised proof upload remains available even outside original window", () => {
    const futureDate = new Date("2026-10-25T10:00:00.000Z");
    const beforeRevision = getBookingProofLifecycle({
      status: "needs_revision",
      date: "2026-10-20",
      endDate: "2026-10-20",
      proofs: [
        { kind: "before", uploadedAt: "2026-10-20T01:00:00.000Z" },
        { kind: "after", uploadedAt: "2026-10-20T02:00:00.000Z" },
      ],
      isOwner: true,
      updatedAt: "2026-10-21T00:00:00.000Z",
      now: futureDate,
    });

    expect(beforeRevision.needRevision).toBe(true);
    expect(beforeRevision.showBeforeUploader).toBe(false);
    expect(beforeRevision.showAfterUploader).toBe(true);
    expect(beforeRevision.hasRevisedAfter).toBe(false);
    expect(beforeRevision.canFinish).toBe(true);

    const afterRevision = getBookingProofLifecycle({
      status: "needs_revision",
      date: "2026-10-20",
      endDate: "2026-10-20",
      proofs: [
        { kind: "before", uploadedAt: "2026-10-20T01:00:00.000Z" },
        { kind: "after", uploadedAt: "2026-10-20T02:00:00.000Z" },
        { kind: "after", uploadedAt: "2026-10-22T03:00:00.000Z" },
      ],
      isOwner: true,
      updatedAt: "2026-10-21T00:00:00.000Z",
      now: futureDate,
    });

    expect(afterRevision.showAfterUploader).toBe(true);
    expect(afterRevision.hasRevisedAfter).toBe(true);
    expect(afterRevision.canFinish).toBe(true);
  });

  it("Case F: status=pending/cancelled/rejected/closed/finished -> no inappropriate proof uploader", () => {
    const nonUploadStatuses: BookingStatus[] = [
      "pending",
      "cancelled",
      "rejected",
      "closed",
      "finished",
      "completed",
    ];

    for (const status of nonUploadStatuses) {
      const state = getBookingProofLifecycle({
        status,
        date: "2026-10-20",
        endDate: "2026-10-20",
        proofs: [
          { kind: "before", uploadedAt: "2026-10-20T01:00:00.000Z" },
          { kind: "after", uploadedAt: "2026-10-20T02:00:00.000Z" },
        ],
        isOwner: true,
        now: nowJakartaEarlyMorning,
      });

      expect(state.showBeforeUploader).toBe(false);
      expect(state.showAfterUploader).toBe(false);
      expect(state.canStart).toBe(false);
      expect(state.canFinish).toBe(false);
    }
  });

  it("denies upload and start/finish actions when viewer is not the booking owner", () => {
    const approvedNonOwner = getBookingProofLifecycle({
      status: "approved",
      date: "2026-10-20",
      endDate: "2026-10-20",
      proofs: [{ kind: "before", uploadedAt: "2026-10-19T18:16:00.000Z" }],
      isOwner: false,
      now: nowJakartaEarlyMorning,
    });

    expect(approvedNonOwner.showBeforeUploader).toBe(false);
    expect(approvedNonOwner.showAfterUploader).toBe(false);
    expect(approvedNonOwner.canStart).toBe(false);
    expect(approvedNonOwner.canCancel).toBe(false);

    const inUseNonOwner = getBookingProofLifecycle({
      status: "in_use",
      date: "2026-10-20",
      endDate: "2026-10-20",
      proofs: [{ kind: "after", uploadedAt: "2026-10-19T18:20:00.000Z" }],
      isOwner: false,
      now: nowJakartaEarlyMorning,
    });

    expect(inUseNonOwner.showBeforeUploader).toBe(false);
    expect(inUseNonOwner.showAfterUploader).toBe(false);
    expect(inUseNonOwner.canFinish).toBe(false);
  });
});
