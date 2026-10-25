# AI Memory

Office Craft values:

Consistency

Predictability

Reusability

Scalability

Maintainability

Incremental evolution

The project intentionally avoids

rapid rewrites

experimental UI

large refactors

architecture churn

The preferred workflow is

inspect

↓

understand

↓

extend

↓

test

↓

commit

not

generate

↓

replace

↓

regret

Every feature should look like it was built by the same team.

Even if years apart.

The documentation is the project's permanent memory.

Not any individual AI conversation.

## Resources API Contract

As of 2026-07-11, the Resources API provides a shared `capacity` field and
optional `color`, `licensePlate`, and `fuelType` fields. It does not provide
legacy `equipment` or `engineCc` fields. Keep the frontend DTO, form payload,
and resource detail UI aligned with this response shape.

## Calendar Callback Rule

`CalendarView` calls `onMonthChange` from an effect. Its parent must provide a
stable callback and must not replace the current month state with an equivalent
value, otherwise React enters a maximum-update-depth render loop.

## Storage Upload Rule

As of 2026-10-22, resource photos and booking proofs upload through
`office-craft-api`; the browser does not call Supabase Storage directly. The
backend owns Storage authorization, object paths, persistence, and signed proof
URLs.

## Public Configuration Rule

As of 2026-10-22, `VITE_API_BASE_URL` is the required integration setting.
Legacy Supabase browser variables remain in the template until a later cleanup,
but the active auth and Storage paths do not consume them. Never place private
credentials in any `VITE_*` value.

## Password Management Rule

As of 2026-07-16, password changes and administrator resets are represented by
`authApi` methods and always use the shared cookie-aware HTTP client. The
current API payloads are `{ oldPassword, newPassword }`
for `PUT /auth/password` and `{ userId }` for `PUT /auth/reset`; keep these
contracts aligned with the backend when the endpoints are deployed.

## Central Authentication Integration Rule

As of 2026-10-25, SILAPET uses `office-craft-api` as its only authentication
entry point. Login, SSO exchange, and refresh expose only the business user;
Central access tokens, refresh tokens, and trusted Browser SSO `sid` stay in an
encrypted HttpOnly SILAPET cookie. Do not persist auth state in localStorage or
attach browser bearer headers. Protected and admin routes bootstrap through
cookie-authenticated `GET /auth/me`; temporary service failures expose retry,
while invalid or revoked sessions clear in-memory presentation state.

Existing Akun Balai users use the normal login form. Central SSO automatically
creates or reopens a pending SILAPET `user` membership after valid credentials,
then revokes the temporary session and returns no token. The frontend maps the
pending response to `/auth/pending`; no public request-access UI is exposed.

Public registration follows the Central SSO contract: full name, email, and an
8–128 character password are required, while phone is optional. Successful
registration returns no session, clears the form state, and routes directly to
`/auth/pending`. The `/me` bootstrap refreshes without a browser credential body
and retries automatically through the shared HTTP interceptor after `401`.

Resource photos and booking proofs are uploaded through backend endpoints.
The legacy browser Supabase wrapper remains in the tree for later cleanup but
has no active call site.

## Browser SSO Rule

As of 2026-10-22, browser SSO is an optional login path in addition to direct
login. The frontend starts it through `GET /auth/sso/start` and handles only
`code`, `state`, or a safe membership status at `/auth/sso/callback`. Never add
Supabase tokens to callback URLs or share auth state across applications via
localStorage. The callback exchanges through `office-craft-api`, which creates
the HttpOnly application session, and reuses the existing pending/rejected
routes.

The only user-facing logout action is **Keluar**. DIRECT logout clears only
its app session immediately. SSO logout initiation preserves the app cookie,
upstream credentials, and in-memory auth/query state until Central's decision.
The backend derives the source from the authenticated application session and
returns `centralLogoutRequired`. Both Central outcomes return to the registered
frontend `/login`: existing `/auth/me` bootstrap restores the role route after
Cancel, or rejects the revoked SID after Confirm. Other SSO apps invalidate on
their next introspection; DIRECT sessions remain independent.

Do not infer the source from URL, referrer, or browser storage, add separate
application/SSO logout buttons, or replace Central's CSRF-protected navigation
with cross-origin XHR. Local app URLs use `silapet.test` for host-only cookie
isolation. The portal launch URL is the API's `/api/auth/sso/start` endpoint,
not the public calendar root.
