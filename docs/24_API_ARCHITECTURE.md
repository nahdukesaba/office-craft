# API Architecture

## Philosophy

The backend is a service provider.

The frontend is a client.

The API Client is the contract between them.

No React component should know HTTP details.

---

# Request Lifecycle

User

↓

Component

↓

Hook

↓

TanStack Query

↓

API Client

↓

HTTP

↓

Fiber

↓

Middleware

↓

Handler

↓

Service

↓

Repository

↓

Database

↓

Response

↓

Cache

↓

React

Every feature should follow this lifecycle.

---

# API Client

The API client owns

authentication header

token refresh

serialization

deserialization

error normalization

request cancellation

React components should not.

---

# Service Boundaries

Each backend module should expose its own endpoints.

Avoid giant "utility" endpoints.

Good

/users

/employees

/roles

/permissions

Bad

/dashboard/everything

---

# Versioning

Always communicate through versioned routes.

Example

/api/v1/

Breaking changes require a new version.

---

# Frontend Rule

React components should never know

URL construction

authorization headers

token format

retry policy

These belong inside the API layer.