## Phase 4 — Admin Tools (DONE)

- CSV export of bookings filtered by date range (`ExportBookingsDialog` in Admin Dashboard + Review Bookings).
- Notify-user mock endpoint (`bookingsApi.notify`) with admin button on booking detail; backend will send the actual notification.
- Pending / review lists grouped by resource type (Cars / Rooms / Bikes) via `GroupedBookingTable`.
- i18n entries added for all new copy (EN/ID).

## Phase 3 — Usage Lifecycle + Camera Capture (DONE)

Daily credits look sufficient for this phase. Scope is locked to what was promised in `.lovable/plan.md`.

### 1. New booking statuses
- Extend `BookingStatus` in `src/types/index.ts` with `in_use` and `finished`.
- Update `STATUS_LABEL` and `STATUS_COLOR` in `src/config/constants.ts` (EN + ID via i18n keys where applicable).
- Add translations in `src/i18n/dictionaries.ts` for the two new statuses and the new action buttons (`booking.start`, `booking.finish`, `booking.cameraOnlyHint`, etc.).
- Add the new statuses to status filter `<Select>` options in `BookingTable`, admin bookings index, my-bookings index, and calendar legend.
- `StatusBadge` auto-picks up new entries from the constant maps.

### 2. Lifecycle transitions in mock DB
- `mockDb.updateBookingStatus` already accepts any `BookingStatus`; add two thin helpers `startBooking(id)` and `finishBooking(id)` enforcing legal transitions:
  - `approved → in_use` requires a `before` proof to exist.
  - `in_use → finished` requires an `after` proof to exist.
- `cancelBooking` rejects when current status is `in_use` or `finished`.
- Admin "Close" action restricted server-side to `finished` bookings (returns 409 otherwise).
- Update `publicBookings` to also surface `in_use` and `finished` so the public calendar stays accurate.

### 3. API + hooks
- Add `bookingsApi.start(id)` / `bookingsApi.finish(id)` calling the new mock helpers.
- Add `useStartBooking` / `useFinishBooking` mutations in `src/hooks/mutations/useBookingMutations.ts`, invalidating booking + proofs queries.

### 4. Camera-only proof capture
- New component `src/components/bookings/CameraCapture.tsx`:
  - When `env.proofCameraOnly` is true, render `<input type="file" accept="image/*" capture="environment">` (forces rear camera on mobile, gallery-blocked) plus an optional `getUserMedia` live-preview fallback for desktop with a visible "camera-only" notice.
  - When the flag is false, delegate to existing `FileDropzone`.
- Refactor `ProofUploader` to use `CameraCapture` internally; keep its `bookingId` + `kind` API unchanged.

### 5. Booking detail UX (`src/routes/_authenticated/my-bookings.$id.tsx`)
- Show "Mulai Pemakaian" button only when `status === "approved"` and a `before` proof exists; calls `useStartBooking`.
- Show "Selesai Pemakaian" button only when `status === "in_use"` and an `after` proof exists; calls `useFinishBooking`.
- Disable/hide "Cancel booking" when status is `in_use`, `finished`, `completed`, `cancelled`, or `rejected`.
- Only show the `before` uploader while status is `pending`/`approved`; only show the `after` uploader while status is `in_use`. Both remain visible in the gallery afterwards.

### 6. Admin "Close" guard
- In `admin.bookings.$id.tsx`, only render the Close → `completed` action when status is `finished`; otherwise show a hint explaining it.

### Out of scope (Phase 4)
- Notification reminders, CSV export, grouping pending requests by resource type.

### Technical notes
- No new dependencies. Camera capture relies on the standard `capture` attribute; desktop fallback uses `navigator.mediaDevices.getUserMedia` already supported by all evergreen browsers.
- All new strings routed through `useT()` so EN/ID stay in sync.
- Status colors reuse existing Tailwind tokens (e.g. `in_use` → amber, `finished` → indigo) defined in `STATUS_COLOR`.
- Plan file `.lovable/plan.md` will be updated at the end of the phase to mark Phase 3 done.
