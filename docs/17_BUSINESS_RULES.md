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