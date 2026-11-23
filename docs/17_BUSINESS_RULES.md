# Business Rules

## Source of Truth

Business rules belong exclusively to the backend.

Frontend may assist the user.

It must never become the authority.

---

## Validation

Frontend

Improves user experience.

Backend

Guarantees correctness.

Never rely solely on frontend validation.

---

## Authorization

Buttons may disappear.

Endpoints must still reject unauthorized access.

Hidden UI is not security.

---

## Entity Integrity

Updates should preserve

relationships

ownership

history

audit information

---

## Soft Deletes

When applicable,

records should remain recoverable.

Avoid destructive deletion unless explicitly required.

---

## Data Consistency

The same business entity should have one canonical representation.

Avoid duplicate models.

---

## Optimistic Updates

Use only when

rollback

is possible.

Otherwise invalidate and refetch.

---

## Business Calculations

Financial

workflow

approval

statistics

aggregations

should remain backend responsibilities.

---

## Booking Rules

The backend enforces these rules. `booking_rules` stores two admin toggles, both off by default. Admins change them on the Admin dashboard.

- **Lock assets with open usage** (`block_resource_open_usage`): an asset cannot be booked or approved while it has an `in_use`, `finished`, or `needs_revision` booking, or an `approved` booking whose end time has passed. The warning names the person holding the asset.
- **Finish before borrowing again** (`block_user_unfinished`): a user with an `in_use` or `needs_revision` booking cannot book or be approved for another asset. The warning names the unfinished asset.
- **Late completion:** a booking can be started and completed any time from its start date. There is no end-date limit on the before photo, start, after photo, or finish.
- **Overdue reminders:** an admin can message every user with an `approved`, `in_use`, or `needs_revision` booking past its end time. Each user gets one message with a numbered list and a link per booking.

---

## AI Decision Rules

When implementing a feature:

1.

Look for existing backend capability.

2.

Reuse existing API.

3.

Reuse existing types.

4.

Reuse existing components.

5.

Reuse existing queries.

Only after exhausting reuse options should new implementation be proposed.

---

## Architecture Rule

Business logic should migrate

toward

the backend.

Never away from it.

This principle should remain true as the application grows.