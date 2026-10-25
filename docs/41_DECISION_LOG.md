# Changelog Guidelines

> This document defines **how architectural and project changes are recorded**.
>
> It is intended for developers and AI assistants, not end users.

---

# Philosophy

The changelog is not a commit log.

The Git history answers **what** changed.

The changelog explains **why** it changed.

Only meaningful project changes belong here.

Routine bug fixes, formatting changes, dependency updates, and refactoring without behavioral changes should remain in Git history only.

---

# What Should Be Recorded

Record changes that affect:

- Architecture
- Business rules
- API contracts
- Authentication
- Authorization
- Database schema
- Folder structure
- Shared components
- Shared hooks
- Shared utilities
- Development workflow
- Deployment
- AI documentation
- Coding conventions
- Public user behavior
- Breaking changes
- New modules
- Deprecated functionality

---

# What Should NOT Be Recorded

Do not record:

- Typo fixes
- Formatting changes
- Lint fixes
- Dependency version bumps
- Variable renames
- Internal refactoring with no behavioral change
- Test-only changes
- Documentation wording improvements

Git already tracks these.

---

# Entry Format

Every entry should contain:

## Date

Use ISO format.

Example

2026-08-01

---

## Version

Example

v0.9.0

or

Unreleased

---

## Category

One of:

Added

Changed

Deprecated

Removed

Fixed

Security

Documentation

Architecture

Workflow

AI

---

## Summary

A short description.

One paragraph maximum.

---

## Reason

Explain why the change was made.

This is the most important section.

Future developers should understand the decision.

---

## Impact

Describe what is affected.

Examples

Frontend

Backend

Database

Authentication

Permissions

Deployment

Documentation

UI

API

---

## Required Documentation Updates

List every document that should have been updated.

Example

- PROJECT_CONTEXT.md
- docs/CURRENT_FOCUS.md
- docs/18_ARCHITECTURAL_DECISIONS.md
- docs/31_IMPLEMENTATION_PATTERNS.md
- docs/39_AI_MEMORY.md

---

## Breaking Change

Yes / No

If Yes,

describe migration steps.

---

# Categories

## Added

New capabilities.

Examples

- New module
- New feature
- New API
- New workflow

---

## Changed

Behavior changed without removal.

Examples

- Permission model
- Validation
- UI flow
- Authentication flow

---

## Deprecated

Something still exists but should no longer be used.

Always include:

- replacement
- expected removal version

---

## Removed

Removed functionality.

Always explain why.

---

## Fixed

Only major fixes belong here.

Examples

- Security issue
- Data corruption
- Workflow bug

Minor fixes remain in Git history.

---

## Security

Authentication

Authorization

Encryption

Secrets

Permissions

Audit logging

Anything affecting security.

---

## Architecture

Any change affecting:

- folder structure
- module boundaries
- state management
- routing
- design system
- shared infrastructure

---

## Workflow

Changes affecting development practices.

Examples

- new branching strategy
- CI/CD
- deployment
- release process

---

## AI

Changes affecting:

- CLAUDE.md
- AGENTS.md
- .cursorrules
- PROJECT_CONTEXT.md
- AI documentation
- implementation patterns
- bootstrap prompts

---

# Changelog Workflow

Whenever a pull request changes:

- Architecture
- Business rules
- Folder structure
- API contracts
- Shared components
- Shared hooks
- Shared utilities
- Authentication
- Authorization
- Deployment
- Development workflow
- AI documentation

the pull request should also include a changelog entry.

---

# AI Responsibility

AI assistants should update the changelog whenever they introduce:

- architectural decisions
- new modules
- reusable components
- API changes
- workflow changes
- documentation structure changes

Do not leave major project changes undocumented.

---

# Relationship to Other Documents

The changelog records **history**.

Other documents record the **current state**.

For every significant change:

1. Update the implementation.

2. Update the documentation.

3. Update the changelog.

Documentation should describe how the project works today.

The changelog should explain how it arrived there.

---

# Example Entry

## 2026-08-01

### Version

Unreleased

### Category

Architecture

### Summary

Introduced centralized AI documentation and project operating system.

### Reason

The project is developed across multiple AI tools. Repository-contained documentation replaces reliance on chat history and enables consistent development regardless of the AI assistant used.

### Impact

- Frontend
- Backend
- Development workflow
- Documentation

### Required Documentation Updates

- PROJECT_CONTEXT.md
- CLAUDE.md
- AGENTS.md
- docs/00_AI_CONTEXT.md
- docs/18_ARCHITECTURAL_DECISIONS.md
- docs/31_IMPLEMENTATION_PATTERNS.md
- docs/32_AI_CONSTITUTION.md
- docs/39_AI_MEMORY.md

### Breaking Change

No

---

## 2026-10-25 - Move SILAPET Session Authority Behind HttpOnly Cookie

### Category

Authentication and authorization

### Summary

Removed browser-readable access and refresh credentials from SILAPET. The
backend now owns an encrypted HttpOnly application session for direct and
Browser SSO login, refresh, protected API access, and logout.

### Reason

Browser JavaScript must not become a credential or trusted `sid` boundary.
SILAPET application role and status must continue to be verified from its own
membership data on every protected request.

### Impact

- Login, SSO exchange, refresh, `/auth/me`, and logout contracts
- Cookie-aware Axios clients and in-memory Zustand presentation state
- Protected backend routing, trusted-origin checks, and session validation
- New `APP_SESSION_KEY`, `APP_SESSION_TTL`, and `APP_SESSION_COOKIE_SECURE` settings

### Breaking Change

Yes. Existing browser-persisted sessions must sign in again.

---

## 2026-10-22 - Align Registration UX with Central Contract

### Category

Authentication UX

### Summary

Aligned the registration field order and inline validation with the active
Central SSO contract. Registration success now clears form credentials and
redirects to the pending-approval page. The existing automatic `/me` refresh
and retry flow was audited and retained unchanged.

### Reason

The previous form hid most validation errors and imposed name and phone rules
that were stricter than the backend contract.

### Impact

- Registration form and schema
- Authentication documentation
- No backend, login, membership, or refresh implementation changes

### Breaking Change

No

---

## 2026-10-22 - Replace Public Request Access with Login Auto-Enrollment

### Category

Authentication and authorization

### Summary

Removed the public request-access UI. A valid direct login without SILAPET
membership is now auto-enrolled as pending by Central SSO and routed to the
existing pending screen without storing a session.

### Reason

Membership is an implementation detail. Users should use the same email and
password login flow whether their SILAPET membership is approved or still needs
administrator approval.

### Impact

- Login pending/rejected/disabled routing
- Public auth navigation
- Centralized membership ownership remains unchanged

### Breaking Change

No

---

## 2026-10-22 - Add Authorization-Code Browser SSO

### Category

Authentication and authorization

### Summary

Added **Masuk dengan SSO Balai** as an optional login path while retaining
direct email/password login. The callback receives only a one-time code, state,
or membership status and exchanges through the SILAPET backend.

### Reason

Users with an active Central browser session should enter SILAPET without
retyping credentials, while tokens remain out of URLs and application storage
is not shared across origins.

### Impact

- Login page and `/auth/sso/callback`
- Existing `AuthSession` store and pending/rejected routing
- Backend-managed state and PKCE flow
- SILAPET logout remains separate from the Central browser session

### Breaking Change

No

---

## 2026-10-22 - Coordinate Application and Central Browser Logout

### Category

Authentication and authorization

### Summary

The single SILAPET **Keluar** action revokes the application session and clears
local state. It continues through Central's CSRF-protected browser logout only
when the backend identifies the signed Supabase session as Browser SSO;
direct-login sessions return straight to the SILAPET login page.

### Reason

Users should not need to understand separate application and Central browser
sessions. A Browser SSO logout must not leave its reusable Central session
behind, while direct logout must not terminate an unrelated Central session.

### Impact

- User menu logout navigation
- Backend Central logout start route
- Backend login-source decision from verified Supabase `amr`
- Current Central browser session only; other application sessions remain

### Breaking Change

No

---

# Definition of Done

A significant project change is not complete until:

- Implementation is merged.
- Documentation reflects the current state.
- Relevant architectural decisions are updated.
- The changelog records the reason for the change.
- Future AI assistants can understand why the decision was made.

---

## 2026-10-22

### Version

Unreleased

### Category

Authentication and authorization

### Summary

Made backend `/auth/me` validation mandatory before protected or admin UI can
render from a persisted session, and added the public SILAPET request-access
flow for existing Akun Balai identities.

### Reason

Supabase issues the session JWT, while the SILAPET backend remains authoritative
for application membership, status, and business role. Cached browser identity
must therefore not grant access by itself.

### Impact

- Frontend authentication bootstrap and route guards
- Refresh and revocation error handling
- Public request-access UI
- Authentication and Storage documentation

### Breaking Change

No
