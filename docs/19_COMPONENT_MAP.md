# Component Map

## Philosophy

Office Craft follows a composition-first architecture.

Pages should be composed from reusable building blocks rather than implementing
their own UI.

The objective is consistency, not uniqueness.

---

# Component Hierarchy

Application

↓

Providers

↓

Layouts

↓

Pages

↓

Feature Components

↓

Shared Components

↓

Primitive Components

↓

HTML

A component should only know about the layer directly beneath it.

---

# Root Layer

Responsible for:

- Theme
- Router
- Query Client
- Authentication Context
- Notifications
- Global Providers

No business UI should exist here.

---

# Layout Layer

Owns:

Navigation

Sidebar

Top Bar

Breadcrumbs

Content Container

Footer (if present)

Future pages should reuse layouts instead of introducing new shells.

---

# Page Layer

Pages orchestrate.

Pages rarely implement.

Responsibilities:

- compose sections
- coordinate data loading
- coordinate mutations
- coordinate dialogs

Pages should stay relatively small.

---

# Feature Layer

Feature components represent business concepts.

Examples:

EmployeeTable

RoleEditor

PermissionTree

DashboardWidget

Feature components may understand domain models.

---

# Shared Layer

Shared components solve recurring UI problems.

Examples:

Button

Card

Table

Pagination

Search Input

Confirm Dialog

Empty State

Loading State

Badge

Avatar

These should never become feature-specific.

---

# Primitive Layer

Lowest reusable level.

Examples:

Input

Textarea

Checkbox

Label

Tooltip

Popover

These should remain generic forever.

---

# Composition Rules

Prefer

Card
├─ Header
├─ Content
└─ Footer

instead of

MassiveCardWith30Props

Composition beats configuration.

---

# AI Rule

Before creating a component:

1.

Search existing shared components.

2.

Search feature components.

3.

Search existing dialogs.

4.

Search existing cards.

5.

Only create new UI if reuse is impossible.