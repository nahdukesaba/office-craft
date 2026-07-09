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

# Definition of Done

A significant project change is not complete until:

- Implementation is merged.
- Documentation reflects the current state.
- Relevant architectural decisions are updated.
- The changelog records the reason for the change.
- Future AI assistants can understand why the decision was made.