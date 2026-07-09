# Performance Guide

Performance should come from architecture.

Not micro-optimizations.

---

Prefer

Query cache

over

Repeated API calls

---

Prefer

Component reuse

over

Component regeneration

---

Prefer

Memoization

only when profiling proves benefit.

---

Avoid

Duplicated requests

Duplicated stores

Duplicated rendering

Large page components

---

Loading

Every page should provide

Loading

Empty

Error

Success

states.

---

Pagination

Prefer backend pagination.

Avoid loading complete datasets.

---

Rendering

Pages compose.

Components render.

Hooks compute.

Queries fetch.

Keep responsibilities separate.

---

AI Rule

Performance improvements should never reduce readability unless profiling
demonstrates measurable gains.