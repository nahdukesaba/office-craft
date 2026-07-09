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