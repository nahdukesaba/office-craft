# Folder Structure

The folder organization reflects application responsibility.

It should remain stable.

Avoid introducing parallel structures.

---

## Recommended Mental Model

src/

application

shared

features

routes

components

hooks

stores

lib

api

types

styles

---

## Routes

Contains route definitions.

Responsibilities:

- route registration
- layouts
- page entry points

Routes should remain lightweight.

Business logic belongs elsewhere.

---

## Components

Contains reusable UI.

Should not contain page-specific business logic.

Examples:

- buttons
- tables
- dialogs
- cards
- inputs
- navigation

---

## Features

Contains feature-specific UI.

A feature owns:

- dialogs
- widgets
- feature tables
- feature forms

If another feature needs it,

promote it into shared components.

---

## Hooks

Hooks represent behavior.

Examples

useLogin()

useEmployees()

usePagination()

usePermissions()

Avoid embedding UI logic inside hooks.

---

## Stores

Stores represent application state.

Examples

authentication

sidebar

theme

preferences

selected entity

Avoid storing server state.

Server state belongs to TanStack Query.

---

## API

Responsible for HTTP.

Every request should pass through this layer.

Never call fetch directly from components.

---

## Types

Contains shared interfaces.

Prefer deriving types from backend contracts.

Avoid duplicate type definitions.

---

## Utilities

Pure functions only.

Utilities should have no React dependency.

---

## Assets

Static assets only.

Avoid embedding business data inside assets.

---

## Future Rule

Every new feature should naturally fit into the existing structure.

Never create a second "components" folder inside another unrelated feature unless it is intentionally feature-scoped.