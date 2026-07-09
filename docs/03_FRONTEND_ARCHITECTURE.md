# Frontend Architecture

## Purpose

The frontend is responsible for providing a modern, responsive interface for Office Craft while remaining intentionally "thin."

Business rules belong in the backend.

The frontend should orchestrate interactions, not make business decisions.

---

## Technology Stack

Framework

- React 19

Application Framework

- TanStack Start

Routing

- TanStack Router

Bundler

- Vite

Language

- TypeScript

Styling

- Tailwind CSS v4

State

- Zustand

Server State

- TanStack Query

Forms

- React Hook Form

Validation

- Zod

UI Components

- Radix UI

Icons

- Lucide

---

## Layered Frontend

The application is organized into logical layers rather than technical layers.

Presentation

↓

Shared Components

↓

Feature Components

↓

Hooks

↓

State

↓

API

↓

Backend

Each layer has one responsibility.

---

## Frontend Responsibilities

The frontend owns:

- rendering
- routing
- interaction
- loading states
- optimistic UI
- local validation
- caching
- responsiveness

The frontend does NOT own:

- permissions
- authorization
- workflow decisions
- audit logs
- business validation

---

## Feature-Oriented Design

Features should be self-contained.

A feature should contain:

- pages
- dialogs
- local hooks
- local utilities
- feature components

Shared functionality should move into shared directories.

---

## Reusability First

Whenever building a new screen:

Search existing components first.

Search existing hooks second.

Search existing utilities third.

Only create new code if reuse is impossible.

---

## Component Hierarchy

Application

↓

Layout

↓

Page

↓

Feature Section

↓

Reusable Component

↓

Primitive Component

↓

HTML

The lower the level, the more reusable it should become.

---

## Separation of Concerns

Pages

Responsible for composition.

Components

Responsible for presentation.

Hooks

Responsible for behavior.

Stores

Responsible for state.

API

Responsible for communication.

No layer should absorb another layer's responsibility.