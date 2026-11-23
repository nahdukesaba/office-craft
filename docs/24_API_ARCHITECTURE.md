# API Architecture

## Philosophy

The backend is a service provider.

The frontend is a client.

The API Client is the contract between them.

No React component should know HTTP details.

---

# Request Lifecycle

User

↓

Component

↓

Hook

↓

TanStack Query

↓

API Client

↓

HTTP

↓

Fiber

↓

Middleware

↓

Handler

↓

Service

↓

Repository

↓

Database

↓

Response

↓

Cache

↓

React

Every feature should follow this lifecycle.

---

# API Client

The API client owns

authentication header

token refresh

serialization

deserialization

error normalization

request cancellation

React components should not.

---

# Service Boundaries

Each backend module should expose its own endpoints.

Avoid giant "utility" endpoints.

Good

/users

/employees

/roles

/permissions

Bad

/dashboard/everything

---

# Versioning

Always communicate through versioned routes.

Example

/api/v1/

Breaking changes require a new version.

---

# Frontend Rule

React components should never know

URL construction

authorization headers

token format

retry policy

These belong inside the API layer.

---

## Booking Rule and Reminder Endpoints

All require an admin session.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/settings/booking-rules` | Read both rule toggles |
| `PUT` | `/api/settings/booking-rules` | Save `blockResourceOpenUsage` and `blockUserUnfinished` |
| `GET` | `/api/bookings/overdue/summary` | Count overdue bookings, users, and users without a phone |
| `POST` | `/api/bookings/overdue/remind` | Queue reminders, returns `202` |

Booking create and approve can return `409` with `USER_HAS_UNFINISHED_BOOKING` or `RESOURCE_IN_USE`. `details` holds `isSelf`, `userFullName`, and `resourceNames`.

---

## Password Endpoints

Authentication mutations belong to `authApi`, including `PUT /auth/password`
for the signed-in user and `PUT /auth/reset` for an administrator resetting a
selected user. User-management UI accesses the reset operation through its
existing mutation hook; neither UI surface constructs authorization headers.
