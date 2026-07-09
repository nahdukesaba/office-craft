# Current Focus

> This document is intentionally temporary.
>
> It should be the first document updated whenever priorities change.
> Unlike the architecture documents, this file reflects **what is being worked on right now**, not permanent project knowledge.

---

# Project Status

Project Phase

Active Development

Overall Stability

Architecture is stable.

The focus is expanding functionality while preserving the existing design system
and architecture.

---

# Current Objectives

Primary goals:

- Continue developing Office Craft without architectural rewrites.
- Expand business modules incrementally.
- Preserve UI consistency across all new pages.
- Maintain close alignment with `office-craft-api`.
- Improve AI documentation so development can continue across different AI tools and accounts.

---

# Active Modules

Current work is concentrated around:

- Authentication integration
- Authorization and permissions
- User management
- Employee management
- Dashboard improvements
- Shared UI components
- API integration
- Documentation

---

# Frontend Priorities

- Extend existing layouts.
- Reuse existing shared components.
- Expand feature modules.
- Improve form consistency.
- Improve loading, empty and error states.
- Keep responsive behavior consistent.

Avoid introducing new UI patterns unless necessary.

---

# Backend Priorities

Coordinate closely with:

`office-craft-api`

Backend remains responsible for:

- Business rules
- Workflow
- Validation
- Permissions
- Database
- Audit logging
- File storage

Frontend should adapt to backend contracts rather than duplicating business logic.

---

# Current Architectural Goals

Continue strengthening:

- Reusable components
- Shared hooks
- Shared utilities
- Query consistency
- API typing
- Documentation
- AI onboarding

Avoid architectural churn.

---

# Known Technical Debt

Review periodically:

- Duplicate UI patterns that can be consolidated.
- Feature-specific code that should become shared components.
- Hooks with overlapping responsibilities.
- API calls that bypass shared abstractions.
- Documentation that falls behind implementation.

Technical debt should be reduced incrementally, not through large rewrites.

---

# Short-Term Roadmap

Next milestones may include:

- Complete remaining administration modules.
- Expand dashboard capabilities.
- Continue role and permission improvements.
- Strengthen reusable CRUD patterns.
- Improve file upload workflows.
- Continue documentation refinement.

---

# AI Instructions

When beginning a new session:

1. Read `PROJECT_CONTEXT.md`
2. Read `docs/00_AI_CONTEXT.md`
3. Read `docs/32_AI_CONSTITUTION.md`
4. Read this document.
5. Inspect the relevant implementation before writing code.

This file provides current priorities.

The repository remains the ultimate source of truth.

---

# Last Updated

YYYY-MM-DD

Owner

Development Team

Status

Living Document