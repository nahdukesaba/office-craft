# Backend Integration Plan — Office-Craft API

Goal: replace the in-memory mock (`src/services/mocks/db.ts`) with real HTTP calls to `https://ephsilalahi.tailf32e23.ts.net/api`, add the new flows the backend requires (admin approval of registrations, real notifications, timeline, reports), and keep the UI working throughout.

Guiding rules
- Field names / endpoints mirror the doc exactly — no invented shapes.
- Flip `env.useMocks = false` only at the end of a chunk that leaves the app runnable; before that, wire endpoint-by-endpoint behind the existing `env.useMocks` switch.
- Each chunk is sized to comfortably fit one day of free build credits (~roughly the size of previous Phase-4 chunks). If a chunk feels tight mid-build, stop at the last runnable checkpoint and resume next day.

---

## Chunk 1 — Types, HTTP client, auth wiring (small)

**STATUS: DONE**

Foundational so every later chunk just calls `bookingsApi.x()` etc.

1. Update `src/types/index.ts`
   - Add `phone`, `status: "pending"|"approved"|"rejected"` to `AppUser`.
   - Change `Booking` to use ISO `startTime`/`endTime` (full timestamps) + `date`/`endDate` (YYYY-MM-DD, Asia/Jakarta), `purpose`, `adminNotes: string`.
   - Add `BookingWithDetails`, `PaginatedBookings`, `PublicBooking`, `TimelineEntry`, `NotifyResult`, `ApproveBookingResponse`, `BookingInsights`, `ApiError`.
2. `src/lib/env.ts` — read `VITE_API_BASE_URL`, default to the Tailscale URL; keep `useMocks` env-driven.
3. `src/lib/errors.ts` — parse `{error, message, details}` shape into `ApiError` (keep `.code`, `.message`, `.details`); expose helper `isCode(e, "BOOKING_CONFLICT")`.
4. `src/services/http.ts` — already correct shape; verify `Authorization: Bearer <token>` from `authStore` and 401 → signOut.
5. Add `GET /health` smoke-test helper (used by a dev-only banner if it fails).

Deliverable: build passes, no behavior change (mocks still on).

---

## Chunk 2 — Auth + approval gating (medium)

**STATUS: DONE**

1. `src/services/api/auth.api.ts` — real `POST /auth/login`, `POST /auth/register`, `GET /auth/me`.
   - Register no longer returns a token; do NOT auto-login.
2. `src/stores/authStore.ts` — store `user.status`; add `isPending`, `isRejected` selectors.
3. New routes:
   - `src/routes/auth.pending.tsx` — "Awaiting admin approval" screen.
   - `src/routes/auth.rejected.tsx` — "Access declined" screen.
4. `login.tsx` — on 403 `ACCOUNT_PENDING_APPROVAL` → route to `/auth/pending`; on `ACCOUNT_REJECTED` → `/auth/rejected`; other errors → toast `message`.
5. `register.tsx` — add optional `phone` field (digits-only hint, e.g. `6281234567890`), show pending screen on success.
6. `_authenticated/route.tsx` — if `user.status !== "approved"` redirect to the matching screen.
7. i18n keys for the new screens + phone hint.

Turn off mocks for auth only (`if (env.useMocks && !endpointLive) …`), keep the rest on mocks.

---

## Chunk 3 — Users admin (small–medium)

1. `src/services/api/users.api.ts` — `list({status})`, `approve(id)`, `reject(id)`.
2. `src/hooks/queries/useUsers.ts` + `src/hooks/mutations/useUserMutations.ts`.
3. New route `src/routes/_authenticated/_admin/admin.users.tsx`
   - Tabs: Pending / Approved / Rejected.
   - Table: name, email, phone, createdAt, actions (Approve/Reject with confirm).
4. Add sidebar entry + i18n.

---

## Chunk 4 — Resources + Bookings core (large — split if credits run low)

Split checkpoint: 4a resources, then 4b bookings.

**4a Resources**
- `resources.api.ts` → real `GET/POST/PUT/DELETE /resources`.
- Reshape `Resource` union to match doc (`amenities`, `seats`, `location` required, `photoUrl` optional).
- Update `ResourceForm`, `ResourceCard`, `resources.$id.tsx`, admin resources page.

**4b Bookings CRUD + list/detail**
- `bookings.api.ts` → real `GET /bookings` (paginated), `GET /bookings/:id`, `POST /bookings` (send `resourceId, startTime, endTime, purpose` — construct ISO timestamps from date+time inputs, Asia/Jakarta), `PUT cancel`.
- `BookingForm` — add `purpose` textarea; compose `startTime`/`endTime` as ISO; on 409 `BOOKING_CONFLICT` show details dialog (owner name, window).
- `BookingTable` / `GroupedBookingTable` / list pages — read `data` + `totalPages`; adopt server pagination.
- `my-bookings.$id.tsx` / `admin.bookings.$id.tsx` — read new `Booking` shape (ISO times + `purpose`).

Public calendar continues on mocks until chunk 6.

---

## Chunk 5 — Booking actions + proofs + timeline (medium–large)

1. `bookings.api.ts` → `approve` (returns `{booking, autoRejectedIds}`), `reject({note})`, `revoke({adminNotes, reason})`, `start`, `finish`, `notify({note})`, `history()`.
2. `useBookingMutations.ts` — surface `autoRejectedIds` in `useApproveBooking` toast; on notify show `emailSent` / `whatsAppSent` split status (with error hint when phone missing).
3. Proofs — new flow:
   - Upload file directly to Supabase Storage from browser (add `@supabase/supabase-js`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` as secrets), then `POST /bookings/:id/proofs` with `{kind, path}`.
   - Gate Start button until `before` upload 201s.
4. New `BookingTimeline` component consuming `GET /bookings/:id/history`; render on booking detail (both user and admin).
5. Admin detail: add optional note textarea for reject / revoke / notify.
6. Remove any client-side "click Notify after approving" step — approve/reject/revoke now auto-notify.

---

## Chunk 6 — Public calendar + stats + reports (medium)

1. `public.api.ts` → `GET /public/bookings/all`, `/public/bookings/resource/:id`. Map `PublicBooking` into calendar block shape.
2. Remove `usePublicBookings` mock fallback; calendar view now unauthenticated.
3. `stats.api.ts` → `GET /stats/overview`; update admin dashboard cards to real fields (`totalUsers`, `bookingsByStatus`, etc.).
4. New `src/routes/_authenticated/_admin/admin.reports.tsx`
   - Date range picker (from/to).
   - "Export CSV" button — fetch as blob with `Authorization` header, `URL.createObjectURL`, trigger download with the server-provided filename.
   - Insights charts using existing `recharts`: byStatus (donut), byResourceType (bar), byDay (line), byResource (horizontal bar), topUsers (table), autoRejected % stat card.
5. Delete `src/services/mocks/*` and remove `env.useMocks` branches; flip default to real API.

---

## Chunk 7 — Polish & verification (small)

- Error boundaries: map every documented error code to a friendly toast (`VALIDATION_ERROR`, `PAST_BOOKING`, `NOT_START_DAY`, `PHOTO_REQUIRED`, `NOTIFY_NOT_ALLOWED`, …).
- i18n sweep for all new strings (EN + ID).
- README section: env vars (`VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), CORS reminder for the Tailscale host.
- Manual smoke test checklist against a live backend: health, register → pending screen, admin approve, login, create booking, approve (autoReject toast), upload before → start, upload after → finish, notify, revoke, reports CSV download.

---

### Secrets/config to set before Chunk 2

- `VITE_API_BASE_URL` = `https://ephsilalahi.tailf32e23.ts.net/api`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Chunk 5, for direct Storage upload) — you'll need to paste these from your Supabase project.

Tell me to start on **Chunk 1** whenever you're ready.
