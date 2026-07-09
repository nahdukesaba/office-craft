# Authentication

## Philosophy

Authentication answers

Who are you?

Authorization answers

What may you do?

Treat them separately.

---

## Login Flow

User

↓

Login Form

↓

API

↓

JWT

↓

Stored Session

↓

Authenticated State

↓

Protected Routes

The frontend should never manufacture authentication state.

---

## Session Ownership

Backend owns session validity.

Frontend owns session presentation.

Expired tokens should always defer to backend response.

---

## Protected Routes

A protected page assumes

authentication exists

It should never assume

authorization exists.

Authorization should still be verified by backend.

---

## Permission Checks

UI may hide unavailable actions.

Backend must enforce permissions.

Never trust hidden buttons.

---

## Logout

Logout should clear

query cache

authentication store

temporary user data

navigation state if required

The application should return to a clean unauthenticated state.

---

## Token Handling

Authentication tokens should remain centralized.

Never duplicate storage logic.

Never manually append tokens throughout the application.

The API client should own authorization headers.

---

## Future Expansion

Support for

multiple roles

organizations

departments

feature flags

should integrate into the existing authentication architecture.

Avoid redesigning authentication later.