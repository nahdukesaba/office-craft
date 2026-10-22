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

The login response uses `token` for the access token and also returns the
refresh token and authoritative business user. Authentication always enters
through the SILAPET backend; the browser does not call Supabase Auth directly.

---

## Session Bootstrap

`localStorage["auth-storage"]` is a persisted credential candidate, not proof
that the user may access a protected route. After Zustand hydration, protected
and admin routes call `GET /auth/me` and wait for it before rendering.

The `/auth/me` response replaces the cached business user and synchronizes the
separate cached role. Temporary network or service failures retain the
credential candidate and expose a retry state. Invalid or revoked sessions are
cleared by the shared HTTP client.

Business role and application status must come from backend response data.
Never decode the Supabase JWT to determine UI authorization.

---

## Refresh

Protected requests refresh through `POST /auth/refresh` after a `401`. The
client shares one refresh promise per tab, coordinates tabs with
`navigator.locks`, and retries a request at most once. A successful refresh
atomically replaces access token, refresh token, and business user. A rejected
refresh clears the session; network and `5xx` failures retain it and surface a
retryable service error.

Bootstrap uses this same interceptor path. If the first `GET /auth/me` receives
`401`, a valid refresh token rotates the session and the original `/auth/me`
request is retried automatically before bootstrap resolves; a second browser
refresh is not required.

---

## Registration

Registration sends `fullName`, optional `phone`, `email`, and `password` to the
SILAPET backend. Full name, email, and password are required. The active
password policy is 8 through 128 characters and rejects whitespace-only values.
Phone has no backend format or length restriction; blank values are omitted,
and a nonblank value beginning with `0` is normalized to the `62` country code
by Central SSO.

Validation errors are rendered beside their fields when the backend identifies
a field. Registration never stores a token or auto-signs in. Success clears the
form credential state and redirects to `/auth/pending` after showing that the
account awaits administrator approval.

---

## Automatic Application Enrollment

Users sign in through the normal `/login` page. When Central SSO validates an
existing identity without SILAPET membership, it creates or reopens exactly one
pending `user` membership and returns `ACCOUNT_PENDING_APPROVAL` without any
token. The frontend routes that result to `/auth/pending`; it does not expose a
separate request-access form.

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

The frontend calls `POST /auth/logout` before local cleanup so the backend can
revoke the Supabase session. Local credentials and query state are still
cleared if that request fails, with a non-sensitive warning to the user.

---

## Token Handling

Authentication tokens should remain centralized.

Never duplicate storage logic.

Never manually append tokens throughout the application.

The API client should own authorization headers.

---

## Password Management

Authenticated users can change their password from the account menu. The
frontend validates the current password, new password, and confirmation before
calling `PUT /auth/password` with `{ oldPassword, newPassword }` through the
shared API client. New passwords use the backend policy of 8 through 128
characters. Request-access passwords are only required to be non-empty because
an existing account may predate the current creation policy.

Administrators can reset an approved user's password from Manage Users after a
confirmation. This calls `PUT /auth/reset` with `{ userId }`. Both requests use
the API client's centralized bearer-token interceptor; the backend remains
responsible for authorization and password policy.

---

## Future Expansion

Support for

multiple roles

organizations

departments

feature flags

should integrate into the existing authentication architecture.

Avoid redesigning authentication later.
