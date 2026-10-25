# Architectural Decisions (ADR)

This document records intentional decisions so future AI assistants do not
"improve" them away.

## ADR-001

Frontend and backend are separate repositories.

Reason

Independent deployment.

Independent scaling.

Clear responsibility boundaries.

Status

Accepted.

---

## ADR-002

Backend owns all business logic.

Reason

Single source of truth.

Consistency.

Auditability.

Status

Accepted.

---

## ADR-003

TanStack Query owns server state.

Reason

Caching.

Synchronization.

Request deduplication.

Status

Accepted.

---

## ADR-004

Zustand owns client state only.

Reason

Avoid duplicated API cache.

Status

Accepted.

---

## ADR-005

TanStack Router is the routing framework.

Alternative routing libraries should not be introduced.

Status

Accepted.

---

## ADR-006

Existing layouts are canonical.

Future features should extend layouts.

Never regenerate them.

Status

Accepted.

---

## ADR-007

Reusable UI has priority over feature-specific UI.

Status

Accepted.

---

## ADR-008

The backend API is versioned.

Breaking changes require a new API version.

Status

Accepted.

---

## ADR-009

Public deployment configuration is environment-driven.

Reason

API and Supabase connection values must be changed per local, Lovable, and
Vercel environment without source edits. The `env.ts` module remains the
single client-side adapter so existing consumers keep one consistent API.

Status

Accepted.

---

## ADR-010

SILAPET browser authentication uses a backend-managed encrypted HttpOnly
application session.

Reason

Central access tokens, refresh tokens, and trusted Browser SSO `sid` must not
be readable or writable by frontend JavaScript. The backend is the only trust
boundary that may translate the application cookie into Central verification,
and it revalidates SILAPET membership role and status on protected requests.

Zustand holds presentation state only. Page reload bootstrap uses `/auth/me`,
refresh uses the cookie without a browser credential body, and logout expires
the cookie after server-side revocation. For SSO, initiation must preserve the
cookie until Central confirms; Cancel reuses the current cookie and Confirm
is enforced by SID introspection on return. DIRECT logout remains immediate.

Status

Accepted.
