import { format, parseISO } from "date-fns";
import { isoToJakartaYMD } from "@/lib/bookingTime";
import type { BookingStatus, Proof } from "@/types";

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

export function isTodayInRange(
  startDate: string,
  endDate?: string,
  now: Date = new Date(),
): boolean {
  const today = isoToJakartaYMD(now.toISOString());
  const end = endDate ?? startDate;
  return today >= startDate && today <= end;
}

export interface BookingProofLifecycleInput {
  status: BookingStatus;
  date: string;
  endDate?: string;
  proofs: Pick<Proof, "kind" | "uploadedAt">[];
  isOwner?: boolean;
  updatedAt?: string;
  now?: Date;
}

export interface BookingProofLifecycleState {
  inWindow: boolean;
  hasBefore: boolean;
  hasAfter: boolean;
  hasRevisedAfter: boolean;
  showBeforeUploader: boolean;
  showAfterUploader: boolean;
  showWindowHint: boolean;
  canStart: boolean;
  canFinish: boolean;
  canCancel: boolean;
  needRevision: boolean;
}

export function getBookingProofLifecycle({
  status,
  date,
  endDate,
  proofs,
  isOwner = true,
  updatedAt,
  now = new Date(),
}: BookingProofLifecycleInput): BookingProofLifecycleState {
  const inWindow = isTodayInRange(date, endDate, now);
  const hasBefore = proofs.some((p) => p.kind === "before");
  const hasAfter = proofs.some((p) => p.kind === "after");
  const needRevision = status === "needs_revision";

  const updatedMs = updatedAt ? Date.parse(updatedAt) : Number.NaN;
  const hasRevisedAfter =
    needRevision &&
    proofs.some((p) => {
      if (p.kind !== "after") return false;
      if (Number.isNaN(updatedMs)) return true;
      const proofMs = Date.parse(p.uploadedAt);
      return !Number.isNaN(proofMs) && proofMs >= updatedMs;
    });

  const showBeforeUploader = isOwner && status === "approved" && inWindow;
  const showAfterUploader =
    isOwner && (status === "in_use" || status === "needs_revision");
  const showWindowHint = status === "approved" && !inWindow;

  const canStart = isOwner && status === "approved" && inWindow && hasBefore;
  const canFinish =
    isOwner && ((status === "in_use" && hasAfter) || status === "needs_revision");
  const canCancel = isOwner && (status === "pending" || status === "approved");

  return {
    inWindow,
    hasBefore,
    hasAfter,
    hasRevisedAfter,
    showBeforeUploader,
    showAfterUploader,
    showWindowHint,
    canStart,
    canFinish,
    canCancel,
    needRevision,
  };
}