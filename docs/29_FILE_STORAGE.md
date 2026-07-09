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

Storage

Naming

Security

Persistence

---

Future Storage Providers

The storage implementation should remain replaceable.

Frontend should only understand

Upload

Download

Preview

Delete

Not storage internals.