# UI Composition

The UI follows composition rather than generation.

Pages are assembled.

Not handcrafted.

---

## Design Language

The design language is already established.

Never redesign it without explicit instruction.

This includes:

spacing

typography

corner radius

colors

elevation

animations

navigation

tables

forms

dialogs

---

## Screen Composition

Header

↓

Toolbar

↓

Content

↓

Cards

↓

Tables

↓

Dialogs

↓

Notifications

Maintain this hierarchy.

---

## Forms

Forms should follow a consistent pattern.

Validation

↓

Field

↓

Error

↓

Submission

↓

Feedback

Reuse existing form components.

---

## Tables

Tables represent data.

They should remain:

predictable

sortable

filterable

responsive

Avoid inventing new interaction patterns.

---

## Dialogs

Dialogs should perform focused tasks.

Avoid multi-page dialogs.

Complex workflows deserve dedicated pages.

---

## Empty States

Every feature should define:

loading

empty

error

success

states.

Consistency improves usability.

---

## Feedback

Users should never wonder:

Did it work?

Every important action should provide feedback.

---

## Accessibility

Prefer Radix primitives.

Maintain keyboard navigation.

Preserve focus management.

Do not remove accessible behaviors.

---

## AI Rule

When modifying a page:

Never replace the entire page.

Inspect the component tree.

Modify the smallest responsible component.

Preserve the rest.