# Hooks and Stores

## Philosophy

Behavior belongs in hooks.

State belongs in stores.

Data belongs in queries.

These responsibilities should never overlap.

---

# Hooks

Hooks coordinate behavior.

Examples:

Authentication

Pagination

Filtering

Dialogs

Forms

Permissions

API interactions

Hooks should not render UI.

---

# Store Guidelines

Zustand stores should contain only client state.

Examples:

Theme

Sidebar

Current workspace

Preferences

Open dialogs

Wizard progress

Selected IDs

Avoid storing API responses.

---

# TanStack Query

Server state belongs here.

Examples:

Users

Employees

Roles

Permissions

Reports

Dashboard Metrics

Never duplicate this state inside Zustand.

---

# Forms

Forms should own:

temporary values

validation

submission

error display

After successful submission,

invalidate queries.

---

# Derived State

Avoid duplication.

Good

selectedEmployeeId

↓

employees query

↓

selectedEmployee

Bad

selectedEmployeeObject

employees

cachedEmployees

activeEmployee

all duplicated in stores.

---

# Custom Hooks

A hook should answer one question.

Examples

useEmployeeList()

useEmployeeDetail()

useCreateEmployee()

rather than

useEmployeesEverything()

---

# AI Rule

When adding behavior,

extend an existing hook if appropriate.

Creating another hook with nearly identical responsibility is considered
technical debt.