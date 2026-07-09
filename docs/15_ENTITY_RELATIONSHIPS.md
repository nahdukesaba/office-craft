# Entity Relationships

## Overview

Entities should model the business.

Avoid UI-driven entities.

---

## User

Represents

authentication identity.

Owns

login

profile

preferences

roles

permissions

A user may exist independently of employee records if business rules allow.

---

## Role

Represents

a collection of permissions.

Roles should remain descriptive.

Avoid hardcoding role names throughout the frontend.

---

## Permission

Represents

one capability.

Permissions should be granular.

Examples

view

create

update

delete

approve

export

Permissions should never be inferred from UI state.

---

## Menu

Menus should derive from permissions.

Not the other way around.

---

## Employee

Represents

organizational membership.

Employee data belongs to organizational management.

Authentication and employee records should remain conceptually separate.

---

## Department

Groups employees.

Responsible for organizational structure.

---

## Position

Represents job responsibility.

Not application permissions.

Avoid mixing HR concepts with access control.

---

## Reference Data

Reference entities should remain configurable.

Examples

Status

Category

Type

Priority

Reference data should rarely require code changes.

---

## Operational Records

Operational entities represent work performed.

Examples

Requests

Approvals

Assignments

Submissions

These entities should own workflow state.

---

## Reports

Reports should derive from operational entities.

Never duplicate business data solely for reporting.