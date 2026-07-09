# Data Flow

Office Craft follows a one-directional data flow.

Browser

↓

React

↓

Hook

↓

Query

↓

API

↓

Backend

↓

Database

↓

Response

↓

Cache

↓

React

Never bypass the flow.

---

# Read Operations

User opens page

↓

Query executes

↓

Cache checked

↓

API called if necessary

↓

Cache updated

↓

UI renders

---

# Write Operations

User submits form

↓

Mutation

↓

Backend validation

↓

Database

↓

Mutation success

↓

Query invalidation

↓

Fresh UI

Avoid manually synchronizing large datasets.

The cache already solves this problem.

---

# Local State

Local state should remain temporary.

Examples

modal open

selected tab

current page

expanded row

Everything else belongs elsewhere.

---

# Synchronization

Never assume data changed.

Always synchronize through

Query Cache

or

Invalidate

after successful mutation.