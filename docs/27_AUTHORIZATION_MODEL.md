# Authorization Model

Authentication

↓

Identity

↓

Role

↓

Permissions

↓

Visible UI

↓

Backend Enforcement

The backend always has the final decision.

---

# Permission Ownership

Frontend

may hide UI.

Backend

must reject requests.

---

# Menu Visibility

Menus should derive from permissions.

Do not hardcode role names.

---

# Button Visibility

Buttons should reflect permissions.

Examples

Create

Edit

Delete

Approve

Export

Visibility improves UX.

It is not security.

---

# Route Protection

Routes should verify

authentication

before rendering.

Business authorization remains backend responsibility.

---

# Future Expansion

Support should naturally extend to

Departments

Organizations

Multi-tenancy

Feature flags

without redesigning the permission model.