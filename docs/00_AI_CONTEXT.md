# AI Context

This repository is the canonical implementation of Office Craft.

This project is actively developed and already contains working architecture,
business logic, routing, reusable components, design decisions and coding
conventions.

The objective of every AI assistant is to CONTINUE the project.

Not recreate it.

---

## Golden Rule

The repository is the source of truth.

Never assume something should be rewritten simply because there is another
possible implementation.

Existing implementation always wins unless the user explicitly requests a
refactor.

---

## Primary Objective

Every modification should preserve:

- project architecture
- routing
- reusable components
- design language
- coding style
- naming conventions
- user experience

The goal is consistency.

---

## AI Workflow

Before writing code:

1. Read this document.
2. Read PROJECT_CONTEXT.md.
3. Read .lovable/plan.md.
4. Read the backend LOVABLE.md.
5. Inspect related routes.
6. Inspect parent layouts.
7. Inspect imported components.
8. Inspect stores.
9. Inspect hooks.
10. Inspect utilities.

Only after understanding existing implementation should code be produced.

---

## Repository Responsibilities

Frontend

Responsible for:

- UI
- Routing
- State management
- Form validation
- API communication
- Authentication state
- User interaction
- Responsive layout

Backend

Responsible for:

- Business logic
- Database
- Authentication
- Authorization
- Validation
- File storage
- Email
- Audit logging
- API

---

## Development Philosophy

Always extend.

Never rebuild.

Never redesign.

Never regenerate.

Always modify existing implementation whenever possible.

---

## Architectural Principles

Prefer:

Modify existing component

over

Create new component

Reuse existing hook

over

Duplicate hook

Reuse existing page

over

Generate another page

Extend existing API

over

Create another endpoint

---

## UI Philosophy

Visual consistency is more important than introducing new ideas.

Spacing

Typography

Color

Animation

Layouts

should remain consistent throughout the application.

---

## Performance Philosophy

Avoid unnecessary rerenders.

Reuse TanStack Query.

Reuse Zustand stores.

Avoid duplicated API requests.

Prefer optimistic updates only when already established.

---

## Coding Philosophy

Readable code beats clever code.

Explicit beats implicit.

Consistency beats perfection.

Never introduce another architectural style into an existing one.

---

## Documentation Philosophy

If business logic is discovered that is not documented,
update documentation before implementing additional features.