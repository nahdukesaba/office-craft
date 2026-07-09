# Reusability Guide

Every implementation should follow this decision tree.

Need new functionality?

↓

Does a component already exist?

↓

YES

↓

Extend it.

↓

NO

↓

Does a hook already solve most of the behavior?

↓

YES

↓

Extend it.

↓

NO

↓

Does a utility already solve the problem?

↓

YES

↓

Reuse it.

↓

NO

↓

Create a new implementation.

---

## General Rule

Prefer

extension

over

replacement.

Prefer

reuse

over

duplication.

Prefer

composition

over

configuration.

Prefer

consistency

over

innovation.

---

## Technical Debt

The following create technical debt:

Duplicated components

Duplicated hooks

Duplicated API logic

Duplicated validation

Duplicated stores

Duplicated layouts

Duplicated styling

Avoid them.

---

## AI Rule

Before generating code,

inspect imports.

Often the correct component already exists.