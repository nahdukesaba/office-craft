# System Architecture

Office Craft follows a layered architecture.

+----------------------+
|      Browser         |
+----------+-----------+
|
v
+----------------------+
| React Application    |
| TanStack Router      |
+----------+-----------+
|
v
+----------------------+
| Feature Layer        |
| Pages                |
| Components           |
| Hooks                |
| Stores               |
+----------+-----------+
|
v
+----------------------+
| API Client           |
+----------+-----------+
|
v
+----------------------+
| Office Craft API     |
+----------+-----------+
|
v
+----------------------+
| Business Logic       |
+----------+-----------+
|
v
+----------------------+
| PostgreSQL           |
+----------------------+

---

## Layer Responsibilities

### Presentation Layer

Responsible for:

- rendering
- interaction
- accessibility
- responsiveness

Contains:

- pages
- layouts
- dialogs
- reusable UI

---

### Application Layer

Responsible for:

- state management
- routing
- API communication
- caching
- validation

Contains:

- stores
- hooks
- services
- query logic

---

### API Layer

Acts as a gateway.

Responsible for:

- HTTP
- authentication headers
- request lifecycle
- response normalization

Business rules should not live here.

---

### Backend

Responsible for:

- permissions
- validation
- workflows
- persistence
- auditing

---

### Database

Stores:

users

roles

permissions

application data

audit logs

relationships

---

## Data Flow

User

↓

React Component

↓

Hook

↓

Query

↓

API Client

↓

Backend

↓

Database

↓

Backend

↓

Query Cache

↓

React

---

## Frontend Philosophy

The frontend should remain relatively thin.

Its job is to present backend state.

Not replace backend decisions.

---

## Backend Philosophy

Backend owns truth.

Frontend owns presentation.

---

## Scaling Strategy

Future modules should plug into:

Navigation

Routing

Permissions

Shared Layouts

Shared Components

Existing API Client

without changing the core architecture.

---

## Architectural Constraints

Never bypass API client.

Never call fetch directly from components.

Never duplicate permission logic.

Never duplicate validation already performed by backend.

Never duplicate reusable UI.

Always extend shared infrastructure.