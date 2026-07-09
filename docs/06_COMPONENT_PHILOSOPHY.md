# Component Philosophy

Components are the project's greatest reusable asset.

Protect them.

---

## Component Levels

Primitive

↓

Shared

↓

Feature

↓

Page

Never invert this hierarchy.

---

## Primitive Components

Examples

Button

Input

Badge

Dialog

Tooltip

Checkbox

These should remain generic.

---

## Shared Components

Examples

DataTable

SearchBar

ConfirmDialog

Avatar

Pagination

These should solve common problems.

---

## Feature Components

Specific to one domain.

EmployeeTable

UserPermissionCard

DashboardSummary

These may use business types.

---

## Page Components

Pages compose.

Pages rarely implement.

A page should mostly assemble existing pieces.

---

## Composition Over Inheritance

Prefer

<Card>

<Header/>

<Content/>

</Card>

rather than huge configurable components.

---

## Single Responsibility

A component should answer one question.

If a component has five unrelated responsibilities,

split it.

---

## Props

Prefer explicit props.

Avoid magic behavior.

Avoid boolean explosion.

---

## Styling

Components should inherit project styling.

Avoid inline custom design.

Visual consistency is mandatory.

---

## Extension Rule

Before creating a new component ask:

Can an existing component be extended?

If yes,

extend.

If no,

create.