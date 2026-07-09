# Query Strategy

TanStack Query is the canonical server-state solution.

Never duplicate it.

---

# Query Responsibilities

Loading

Caching

Refetching

Deduplication

Retry

Synchronization

Pagination

Invalidation

---

# Query Keys

Use deterministic keys.

Examples

users

users-list

users-detail

employees

employee-detail

roles

permissions

Avoid dynamically constructed strings.

---

# Mutation Rules

Mutations should

call API

return typed response

invalidate affected queries

avoid side effects

---

# Optimistic Updates

Use only when

rollback

is trivial.

Examples

toggle active

favorite

bookmark

Avoid optimistic updates for

financial

workflow

approval

permission

operations.

---

# Cache Rules

Never manually edit cache unless

performance requires it

and

correctness is guaranteed.

Invalidate is usually preferable.

---

# Infinite Queries

Use only when datasets genuinely require them.

Avoid premature complexity.

---

# Polling

Polling should remain exceptional.

Prefer

user actions

or

backend-triggered refresh

where possible.