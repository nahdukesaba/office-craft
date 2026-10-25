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

Encrypted HttpOnly application-session cookie

↓

Stored Session

↓

Authenticated State

↓

Protected Routes

The frontend should never manufacture authentication state.

The login response contains only the authoritative business user. The SILAPET
backend keeps Central access and refresh credentials inside an authenticated,
encrypted `HttpOnly` cookie. JavaScript cannot read that cookie, and the
browser never stores or sends bearer credentials itself. Authentication always
enters through the SILAPET backend; the browser does not call Supabase Auth
directly.

---

## Session Bootstrap

No authentication credential or user profile is persisted in browser storage.
On each page load, protected and admin routes call cookie-authenticated
`GET /auth/me` and wait for it before rendering.

The `/auth/me` response establishes the in-memory business user and role used
for presentation. Temporary network or service failures expose a retry state.
Invalid, expired, corrupt, or revoked sessions clear in-memory presentation
state; the backend rejects the cookie and clears it when appropriate.

Business role and application status must come from backend response data.
Never decode the Supabase JWT to determine UI authorization.

---

## Refresh

Protected requests refresh through `POST /auth/refresh` after a `401`. The
client sends no refresh credential in the request body; the backend reads and
rotates the encrypted session cookie. The client shares one refresh promise
per tab, coordinates tabs with `navigator.locks`, and retries a request at most
once. A successful refresh replaces the cookie and updates only the in-memory
business user. A rejected refresh clears presentation state; network and `5xx`
failures surface a retryable service error.

Bootstrap uses this same interceptor path. If the first `GET /auth/me` receives
`401`, a valid HttpOnly session rotates the session and the original `/auth/me`
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

Expired sessions should always defer to backend response.

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

The frontend calls cookie-authenticated `POST /auth/logout` before local
cleanup so the backend can revoke the Central session and expire the SILAPET
cookie. In-memory auth presentation and query state are still cleared if that
request fails, with a non-sensitive warning to the user.

The single visible **Keluar** action first asks the backend to revoke the
SILAPET session. The backend derives the login source from the encrypted
application session and returns `centralLogoutRequired`; the frontend never
guesses from URL, referrer, or browser storage.

For direct password login, local auth/query state is cleared and the browser
goes directly to `/login`. Any unrelated Central browser cookie remains. For a
Browser SSO session, the browser instead continues through
`GET /auth/sso/logout`; Central confirms and revokes only the current Central
browser session before returning to the registered SILAPET `/login` URI.
Sessions in other applications are not revoked by either flow.

---

## Browser SSO Balai

Direct email/password login remains available. The secondary **Masuk dengan
SSO Balai** button navigates to the backend start endpoint, which creates a
one-time state and PKCE flow before redirecting to Central SSO.

Central returns only `code` plus `state`, or `state` plus a safe membership
status, to `/auth/sso/callback`. The callback immediately removes its query
string from browser history and sends the values to the SILAPET backend. It
never reads access or refresh tokens from the URL. A successful exchange
creates the same encrypted application session as direct login; pending and
denied results use the existing status pages. The callback response exposes
only the business user. Central tokens and the trusted Central `sid` remain
inside the backend-owned application session.

---

## Credential Handling

Central authentication tokens and `sid` remain backend-only.

Never place them in Zustand, local storage, response JSON, URLs, or JavaScript
authorization headers.

All frontend API clients use `withCredentials: true`.

The SILAPET backend decrypts the app session, injects the Central access token
only into its internal verification path, and verifies current SILAPET
membership status and role before protected handlers execute. SILAPET role
continues to come from `app_memberships(application = silapet)`, never from the
browser or a Central-global role.

---

## Password Management

Authenticated users can change their password from the account menu. The
frontend validates the current password, new password, and confirmation before
calling `PUT /auth/password` with `{ oldPassword, newPassword }` through the
shared cookie-aware API client. New passwords use the backend policy of 8
through 128 characters.

Administrators can reset an approved user's password from Manage Users after a
confirmation. This calls `PUT /auth/reset` with `{ userId }`. Both requests use
the HttpOnly application session; the backend remains responsible for
authorization and password policy.

---

## Future Expansion

Support for

multiple roles

organizations

departments

feature flags

should integrate into the existing authentication architecture.

Avoid redesigning authentication later.
