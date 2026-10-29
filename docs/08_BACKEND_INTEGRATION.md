# Backend Integration

## Overview

Office Craft is intentionally split into two repositories.

office-craft/
Frontend

office-craft-api/
Backend

The frontend should never implement business rules.

The backend is the single source of truth.

---

## Responsibilities

Frontend

Responsible for

- UI
- Routing
- Forms
- User interaction
- Client-side validation
- Local state
- Query cache

Backend

Responsible for

- Authentication
- Authorization
- Workflow
- Validation
- Persistence
- Audit trail
- File storage
- Business rules

---

## Communication

Every interaction follows the same pipeline.

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

HTTP Request

↓

Fiber Backend

↓

Service Layer

↓

Repository

↓

Database

↓

Response

↓

TanStack Query Cache

↓

React Component

Never bypass this pipeline.

## Public Runtime Configuration

Browser-visible integration values are supplied by Vite environment variables,
not hard-coded in the application. Local development reads the ignored `.env`
file; copy `.env.example` when creating a new local setup. Vercel and Lovable
must define the same `VITE_*` values in their project environment settings for
the relevant environment (Development, Preview, and Production).

Required public variable:

- `VITE_API_BASE_URL`

`VITE_PROOF_CAMERA_ONLY` is optional and defaults to `true`.

All `VITE_*` variables are bundled into the browser, so private credentials
must stay in the backend environment. The frontend has no Supabase client or
browser-visible Supabase configuration.

---

## API Ownership

Business logic should never migrate into React components.

Examples

Good

Frontend asks

"Can this action be performed?"

Backend decides.

Bad

Frontend checks

role

permission

workflow status

approval stage

before calling API.

Backend must remain authoritative.

---

## Versioning

All frontend communication should target a versioned API.

Example

/api/v1/

Future versions should coexist without breaking previous modules.

---

## Authentication Boundary

Frontend

Knows

"I am authenticated."

Backend

Knows

"What I am allowed to do."

Do not mix these responsibilities.

---

## Data Contracts

Frontend should trust backend contracts.

Avoid transforming payloads into unrelated structures.

Keep DTOs close to backend definitions.

### Resources Contract

`/resources` returns shared resource fields for every type: `id`, `type`,
`name`, `description`, `location`, `photoUrl`, `isAvailable`, `color`,
`capacity`, `licensePlate`, `fuelType`, `createdAt`, and `updatedAt`.

The frontend `Resource` DTO must not require legacy `equipment` or
`engineCc` fields, because they are not included in the API response.

---

## Synchronization Strategy

Every successful mutation should result in one of

invalidate query

optimistic update

cache replacement

Never leave stale UI.
