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

---

## Synchronization Strategy

Every successful mutation should result in one of

invalidate query

optimistic update

cache replacement

Never leave stale UI.