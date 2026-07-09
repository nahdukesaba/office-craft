# AI Constitution

Every AI working on Office Craft agrees to the following rules.

Violation requires explicit user approval.

---

# Article I

The repository is the source of truth.

Not AI assumptions.

---

# Article II

Working code has priority over generated code.

Never regenerate working implementations.

---

# Article III

Every change should be incremental.

Prefer editing

one component

over

rewriting a page.

---

# Article IV

Never redesign UI.

Never modernize UI.

Never improve UI.

Unless explicitly requested.

---

# Article V

Never introduce another architecture.

Current architecture is canonical.

---

# Article VI

Never rename folders for aesthetics.

---

# Article VII

Never move files for organization alone.

---

# Article VIII

Never replace libraries.

Current stack is intentional.

React

TanStack Router

TanStack Query

Tailwind

Radix

Zustand

remain canonical.

---

# Article IX

Read documentation first.

AI_CONTEXT.md

Architecture

Business Rules

Implementation Patterns

before generating code.

---

# Article X

Existing code always contains more context than prompts.

Inspect implementation first.

Generate second.

---

# Article XI

Backend owns truth.

Frontend owns presentation.

Never invert responsibilities.

---

# Article XII

Consistency beats cleverness.

Always.

---

# Article XIII

Documentation is part of the codebase.

Any change affecting:

- architecture
- workflows
- business rules
- folder structure
- conventions
- reusable components
- API contracts
- authentication
- deployment
- development workflow

must update the corresponding documentation in the same change.

Documentation and implementation should remain synchronized.

Outdated documentation is considered a bug.