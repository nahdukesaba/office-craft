# Routing

Routing is powered by TanStack Router.

The router is the backbone of navigation.

---

## Principles

Routes should define:

URL

Layout

Loader

Metadata

Composition

Routes should NOT implement business logic.

---

## Route Responsibilities

A route should:

load required data

compose components

handle navigation

render layout

Nothing more.

---

## Layout Hierarchy

Root Layout

↓

Authenticated Layout

↓

Feature Layout

↓

Page

Every shared element should live as high as possible.

Examples

navigation

sidebar

header

breadcrumbs

theme provider

auth provider

---

## Navigation Philosophy

Navigation should remain predictable.

Users should always know:

where they are

how they got there

how to go back

---

## Route Files

A route file should mostly contain:

imports

loader

component composition

Avoid long business logic.

---

## Route State

Avoid storing persistent application state inside routes.

Routes should remain declarative.

State belongs elsewhere.

---

## Authentication

Authenticated routes should assume:

authentication already verified

authorization already checked

The backend remains the ultimate authority.

---

## Route Evolution

When adding new modules:

Reuse existing layout.

Reuse navigation.

Reuse permissions.

Avoid introducing another root layout.

---

## Deep Linking

Pages should remain bookmarkable whenever possible.

Avoid depending entirely on transient local state.