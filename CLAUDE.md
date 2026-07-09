# Office Craft

> Read `D:\dev\CLAUDE.md` first. It contains the global engineering conventions for every project under `D:\dev`. This file only documents what is unique to Office Craft.

---

# 1. Project Overview

Office Craft is a modular office administration platform.

The system consists of two repositories:

- **office-craft** (Frontend)
- **office-craft-api** (Backend)

The frontend is responsible for UI, routing, forms, state management and API communication.

The backend is responsible for authentication, authorization, business logic, workflow, persistence, audit logging and file storage.

This repository should be treated as an existing production application.

Development should extend the current implementation rather than replace it.

---

# 2. AI Workflow

Before implementing any feature:

1. Read `PROJECT_CONTEXT.md`
2. Read `docs/00_AI_CONTEXT.md`
3. Read `docs/32_AI_CONSTITUTION.md`
4. Read `.lovable/plan.md`
5. Inspect the existing implementation.
6. Reuse existing components.
7. Extend existing hooks.
8. Extend existing API.
9. Modify the smallest responsible component.

Do not begin coding immediately.

Understanding comes before implementation.

---

# 3. Repository Responsibilities

This repository owns:

- UI
- Routing
- Layouts
- Forms
- Client-side validation
- State management
- API communication
- Responsive design

This repository does NOT own:

- Business rules
- Permission decisions
- Workflow validation
- Database logic
- Audit logging

Those belong in `office-craft-api`.

---

# 4. Project-Specific Architecture

The architecture is intentionally stable.

Current stack:

- React
- TanStack Start
- TanStack Router
- TanStack Query
- Zustand
- Tailwind CSS
- Radix UI

These are architectural decisions.

Do not replace them.

---

# 5. State Ownership

Client State

- Zustand

Examples:

- Sidebar
- Theme
- Dialog state
- Wizard progress
- Preferences

Server State

- TanStack Query

Examples:

- Users
- Employees
- Roles
- Permissions
- Reports
- Dashboard

Never duplicate TanStack Query data inside Zustand.

---

# 6. UI Philosophy

The design language is already established.

Future work should preserve:

- spacing
- typography
- colors
- layout
- navigation
- cards
- dialogs
- forms
- tables

Visual consistency has higher priority than redesign.

---

# 7. Component Philosophy

Always search for an existing implementation before creating a new one.

Order of preference:

1. Existing shared component
2. Existing feature component
3. Existing hook
4. Existing utility
5. New implementation

Reuse first.

---

# 8. Backend Integration

Frontend never owns business rules.

Typical request flow:

Component

↓

Hook

↓

TanStack Query

↓

API Client

↓

office-craft-api

↓

Database

↓

Response

↓

Cache

↓

UI

Never call HTTP directly from components.

---

# 9. Repository Rules

Never regenerate pages.

Never redesign layouts.

Never duplicate components.

Never duplicate hooks.

Never duplicate stores.

Never duplicate API clients.

Never replace routing.

Never replace state management.

Never replace UI libraries.

Never reorganize folders purely for aesthetics.

---

# 10. Current Focus

This section is intentionally short and should be updated frequently.

Current work includes:

- Continued frontend feature development
- Tight integration with `office-craft-api`
- Preserving UI consistency while expanding modules
- Improving AI documentation so development can continue across different AI tools and accounts

Replace this section whenever priorities change.

---

# 11. Documentation

Before making architectural changes, read:

- `PROJECT_CONTEXT.md`
- `docs/00_AI_CONTEXT.md`
- `docs/13_DOMAIN_MODEL.md`
- `docs/18_ARCHITECTURAL_DECISIONS.md`
- `docs/31_IMPLEMENTATION_PATTERNS.md`
- `docs/32_AI_CONSTITUTION.md`

Treat these documents as the project's permanent memory.

---

# 12. Success Criteria

A successful implementation should:

- Feel like it was written by the original developers.
- Reuse existing architecture.
- Preserve the current design language.
- Keep business logic in the backend.
- Introduce minimal changes.
- Leave the codebase more consistent than before.

# Documentation Responsibility

Documentation is considered part of the implementation.

Whenever modifying:

- architecture
- workflows
- reusable components
- folder structure
- API contracts
- business rules
- conventions

Claude should also update the relevant documentation under `docs/`.

Never leave documentation inconsistent with the implementation.