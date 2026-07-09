# State Management

## Overview

Office Craft intentionally separates

Client State

and

Server State.

This separation should never disappear.

---

## Client State

Managed by Zustand.

Examples

sidebar

theme

selected menu

user preferences

temporary wizard state

dialog visibility

draft forms

---

## Server State

Managed by TanStack Query.

Examples

employees

roles

permissions

reports

dashboard metrics

API responses

---

## Rule

If the backend owns it,

TanStack Query owns it.

If the browser owns it,

Zustand owns it.

---

## Never Store

API collections

inside Zustand.

Doing so duplicates cache.

---

## Query Lifecycle

Loading

↓

Success

↓

Cached

↓

Invalidated

↓

Refetched

Components should rely on this lifecycle.

---

## Optimistic Updates

Only use optimistic updates when

rollback

is possible.

Otherwise invalidate.

---

## Derived State

Prefer deriving values instead of storing duplicates.

Example

selectedEmployee

should derive from

employees + selectedId

instead of duplicating the object.

---

## Global Stores

Keep stores small.

Avoid "mega stores."

Each store should have one responsibility.