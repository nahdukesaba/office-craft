# Backend Changes Spec + Frontend Task Breakdown

Only ~1.2 daily credits remain. I'll deliver the backend spec + task breakdown now, then implement in chunks over the next days.

---

## Part A — Backend Changes (hand to backend AI)

### 1. Booking overlap semantics (NEW RULE)

Multiple `pending` bookings may exist on the same resource/time window. An `approved` booking is exclusive: it blocks any other approval on an overlapping window, and on approval **auto-rejects** every other `pending` booking that overlaps.

- `POST /bookings` — no longer rejects on overlap with `pending`. Still rejects if overlap with an `approved`/`in_use`/`finished` booking. Error response shape:
  ```json
  { "error": "BOOKING_CONFLICT",
    "message": "Slot already approved for another user",
    "conflictWith": { "id": "...", "userFullName": "...", "startTime": "...", "endTime": "...", "date": "...", "endDate": "..." } }
  ```
- `PUT /bookings/:id/approve` — server transaction:
  1. verify no other overlapping booking is already `approved`/`in_use`/`finished`
  2. set this booking `approved`
  3. update all other `pending` bookings whose window overlaps → `rejected` with `adminNotes = "Auto-rejected: slot approved for another request"`
  4. return `{ booking, autoRejectedIds: string[] }`

### 2. Admin revoke approved booking (NEW ENDPOINT)

`PUT /bookings/:id/revoke` (admin)
- Allowed from statuses: `approved`, `in_use`
- Body: `{ adminNotes?: string, reason?: string }`
- Transitions booking → `cancelled` with `adminNotes` prefixed `"Revoked by admin: "`
- Should trigger a notification to the owner (same channel as `/notify`).
- Response: full `Booking`.

### 3. Proof upload gating (RULE CHANGE)

`POST /bookings/:id/proofs`:
- `kind: "before"` — allowed only when booking status ∈ {`approved`,`in_use`} **AND** current server date (Asia/Jakarta) is between `date` and `endDate` inclusive.
- `kind: "after"` — allowed only when booking status = `in_use` AND today ≤ `endDate`.
- Reject with `403 { error: "PROOF_NOT_ALLOWED", message: "..." }` otherwise.

### 4. Start/Finish gating (RULE CHANGE)

- `PUT /bookings/:id/start` — additionally requires `today (Asia/Jakarta) ∈ [date, endDate]`. Error `403 { error: "NOT_START_DAY" }` otherwise.
- `PUT /bookings/:id/finish` — unchanged apart from photo requirement.

### 5. Notify gating

`POST /bookings/:id/notify` — restrict to bookings with status ∈ {`approved`,`in_use`,`finished`}. Reject otherwise with 400.

### 6. Error contract

All 4xx bodies should be `{ error: string, message: string, details?: any }` so the frontend can surface friendly toasts (currently the overlap error only returns a generic message; frontend can't tell "conflict" from "500").

### 7. Database

No schema changes required — existing `bookings.status` enum already covers `cancelled`/`rejected`. Recommended additions:
- Index: `create index on public.bookings (resource_id, date, end_date, status);`
- RLS on `bookings.update`: admin-only for `approve`/`reject`/`revoke`/`close`; owner-only for `cancel` (status ∈ pending|approved).

### 8. TypeScript types delta (frontend will mirror)

```ts
// added to BookingStatus? — no, reuse "cancelled" for revoke.
// New response shape from approve:
export interface ApproveBookingResponse { booking: Booking; autoRejectedIds: string[] }
// New error payload:
export interface ApiError { error: string; message: string; details?: unknown }
```

No new tables, no new columns. Just endpoints + rules.

---

## Part B — Frontend Task Breakdown (credit-aware)

### Chunk 1 — today (fits ≤1 credit)
Small UX fixes only:
1. Auto-shift `endTime` = `startTime + 1h` in `BookingForm` when start changes.
2. Better overlap error toast: parse `error.response.data` and show conflict details.
3. Gate "Notify User" button — only render when status ∈ {approved, in_use, finished}.
4. Gate "Mulai Pemakaian" + before-photo uploader — hide unless today is within booking window.
5. Gate all proof uploaders — hide unless status ∈ {approved, in_use}.
6. Show "N days" in `my-bookings/$id` header and format range as `Jul 3 09:00 – Jul 6 10:00`.
7. Make resource name a link in `BookingTable`.

### Chunk 2 — next day
i18n expansion:
1. Move every hardcoded string in nav, sidebar, `PageHeader`s, login/register, dashboard, my-bookings, admin pages into `dictionaries.ts`.
2. Wire `useT()` through all layouts and pages.

### Chunk 3 — DONE
Booking form upgrade:
1. Show selected resource photo + description under the picker.
2. Show existing bookings on the chosen date for that resource (mini list).
3. Add "New booking" dialog to Dashboard (reuse BookingForm).
4. Update `BookingDetailsDialog` + calendar block rendering to span multi-day correctly.

### Chunk 4 — final
Business rule wiring (needs backend live OR mockDb update):
1. Change `mockDb.createBooking` to allow overlapping `pending`.
2. Change `mockDb.updateBookingStatus('approved')` to auto-reject conflicts + return list.
3. Add `revokeBooking` mock + `bookingsApi.revoke` + admin "Revoke" button on approved bookings.
4. Toast for auto-rejected count on approve.

---

## What I need from you

1. Approve this plan → I'll start Chunk 1 immediately (fits today's credits).
2. Hand Part A to your backend AI.
3. Ping me tomorrow to continue Chunk 2, etc.
