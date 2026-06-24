## SILAP Aset — Phased Build Plan

Daily Build Credits remaining: **1.60 / 5.00**. The full scope is large, so the work is split into phases. Each phase is independently shippable. I'll execute Phase 1 today and resume the next phases once daily credits reset.

---

### Phase 1 — Foundation (today, fits in remaining credits)
1. **Rebrand** "Resource Hub" → **SILAP Aset** with subtitle *Sistem Informasi Laporan Pemakaian Aset* (sidebar, public header, page titles, meta).
2. **i18n scaffolding** (lightweight, no extra deps): `src/i18n/` with `en.ts` + `id.ts` dictionaries, `LanguageProvider` + `useT()` hook, persisted in `localStorage`.
3. **Theme toggle** (light/dark) using existing Tailwind tokens — provider + persisted, with a toggle button.
4. **Header controls** (EN/ID + theme) rendered in both `PublicHeader` and `AppSidebar` so they appear on every page.
5. **Bike resource type**: extend `Resource` types, schema, form, fixtures, badges, color logic.
6. **Env feature flag**: `VITE_PROOF_CAMERA_ONLY` in `src/lib/env.ts` (consumed in Phase 3).

### Phase 2 — Booking UX (next day)
1. **Add Booking button** on `My Bookings` (opens dialog with `BookingForm`).
2. **Circular 24h time picker** component (custom, no extra deps) replacing the native `<input type="time">`.
3. **Multi-day bookings**: `numberOfDays` field (default 1) → derives `endDate`. Extend `Booking` type with `endDate`, update fixtures, calendar rendering, validation.
4. **Resource color picker** in `ResourceForm` (stored on resource, overrides hash-based color in calendar/legend).

### Phase 3 — Usage lifecycle + camera capture (following day)
1. New booking statuses: `in_use`, `finished` (added to `BookingStatus` union, status badges, filters, translations).
2. **Booking detail actions** for approved bookings: *Mulai Pemakaian* / *Selesai Pemakaian* with proof checks.
3. **Camera-only capture component**: uses `<input capture="environment">` + MediaDevices fallback; gated by `VITE_PROOF_CAMERA_ONLY` flag (falls back to gallery when false).
4. **Cancel rules**: user can cancel only if status not yet `in_use`; once `in_use`, only *Selesai Pemakaian* path is allowed.
5. Admin **Close** restricted to `finished` bookings.

### Phase 4 — Admin tools (following day)
1. **Admin notification action** (mock API): "Remind to cancel" for unused approved bookings; "Remind to upload after-photo" for `in_use` bookings.
2. **Export bookings** (CSV) with date-range picker on Admin dashboard.
3. **Pending Requests / Review Booking grouped by resource type** (Mobil / Ruangan / Motor) with tabs or section headers.

---

### Technical notes
- i18n: zero-dependency module — `LanguageContext`, `t(key, vars?)` returning string from nested dict; fall back to `en`.
- Theme: simple `theme` provider toggling `class="dark"` on `<html>`; tokens already exist in `styles.css`.
- Camera capture: web standard `<input type="file" accept="image/*" capture="environment">` is sufficient for "force camera" on mobile; on desktop the flag falls back to gallery with a banner.
- Resource color: optional `color?: string` on `ResourceBase`; `colorForResource()` prefers stored color, else hash.
- Multi-day: store `endDate` separately from per-day `startTime/endTime`; calendar renders a spanning event.
- Export CSV: client-side blob download from `bookingsApi.list({ from, to })`.
- New statuses require updates to: `types/index.ts`, mock DB transitions, `StatusBadge`, status filter Selects, calendar legend.

Phases 2–4 will each require a fresh daily credit budget; I'll confirm credits at the start of each.