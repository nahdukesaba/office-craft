# File Storage

Files should never become application state.

---

Upload Flow

Select

↓

Validate

↓

Upload

↓

Storage

↓

Database reference

↓

Frontend refresh

---

Frontend Responsibility

Display upload progress.

Handle cancellation.

Display success.

Display failure.

---

Backend Responsibility

Validation

Authorization

Persistence

Storage access policy

## Supabase Storage

Supabase Storage access is mediated by `office-craft-api`. The browser sends
resource images to `POST /resources/photos/upload` and booking proof images to
`POST /bookings/:bookingId/proofs/upload`. Private proof display URLs come from
`GET /bookings/:bookingId/proofs/signed`.

The backend owns object naming, authorization, ownership checks, persistence,
and signed-URL generation. Do not add direct browser Storage calls or derive
Storage ownership from `app_users.id`; Supabase `auth.uid()` represents the
linked `auth.users.id`, which is a different identity namespace.

---

Future Storage Providers

The storage implementation should remain replaceable.

Frontend should only understand

Upload

Download

Preview

Delete

Not storage internals.
