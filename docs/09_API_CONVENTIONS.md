# API Conventions

## API Layer

Every request should originate from the shared API client.

Never call

fetch()

axios()

directly inside components.

---

## Request Flow

Component

↓

Hook

↓

Mutation / Query

↓

API Client

↓

Backend

---

## Query Responsibilities

Queries

Read data.

Mutations

Modify data.

Avoid combining both responsibilities.

---

## DTO Philosophy

Frontend types should mirror backend DTOs.

Avoid creating parallel models unless presentation requires it.

---

## Request Pattern

Every request should have

request type

response type

error type

Prefer strong typing.

---

## Cache Keys

Query keys should be predictable.

Example

users

users:list

users:detail

employees

employees:id

Never generate random keys.

Consistency improves cache reuse.

---

## Pagination

Pagination belongs to backend.

Frontend displays it.

Avoid downloading unnecessary records.

---

## Filtering

Backend performs filtering.

Frontend provides filter controls.

---

## Sorting

Large datasets should be sorted server-side.

Frontend sorting should remain limited to already-loaded data.

---

## Uploads

Uploads should follow:

Frontend

↓

Temporary progress

↓

Backend upload

↓

Stored path

↓

Database reference

Never store binary data in application state.

---

## API Evolution

Never modify existing endpoint behavior if extension is possible.

Prefer additive changes.

Maintain backward compatibility.