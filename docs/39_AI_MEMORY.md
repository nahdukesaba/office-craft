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
`authApi` methods and always use the shared HTTP client so bearer-token handling
stays centralized. The current API payloads are `{ oldPassword, newPassword }`
for `PUT /auth/password` and `{ userId }` for `PUT /auth/reset`; keep these
contracts aligned with the backend when the endpoints are deployed.

## Central Authentication Integration Rule

As of 2026-10-22, SILAPET uses `office-craft-api` as its only authentication
entry point. The `token` returned by login/refresh is a Supabase JWT, but the
frontend must not decode it for business identity or role. A persisted
`auth-storage` session is only a candidate until `GET /auth/me` succeeds.
Protected and admin routes wait for that bootstrap; temporary service failures
retain credentials and expose retry, while invalid or revoked sessions clear
auth state.

Existing Akun Balai users use the normal login form. Central SSO automatically
creates or reopens a pending SILAPET `user` membership after valid credentials,
then revokes the temporary session and returns no token. The frontend maps the
pending response to `/auth/pending`; no public request-access UI is exposed.

Public registration follows the Central SSO contract: full name, email, and an
8–128 character password are required, while phone is optional. Successful
registration returns no session, clears the form state, and routes directly to
`/auth/pending`. The `/me` bootstrap already refreshes and retries automatically
through the shared HTTP interceptor when an access token receives `401`.

Resource photos and booking proofs are uploaded through backend endpoints.
The legacy browser Supabase wrapper remains in the tree for later cleanup but
has no active call site.

## Browser SSO Rule

As of 2026-10-22, browser SSO is an optional login path in addition to direct
login. The frontend starts it through `GET /auth/sso/start` and handles only
`code`, `state`, or a safe membership status at `/auth/sso/callback`. Never add
Supabase tokens to callback URLs or share auth state across applications via
localStorage. The callback exchanges through `office-craft-api`, stores the
normal `AuthSession`, and reuses the existing pending/rejected routes.

The only user-facing logout action is **Keluar**. It performs best-effort app
logout and always clears SILAPET local state. The backend derives the source
from the verified Supabase `amr` claim and returns `centralLogoutRequired`.
Direct sessions go straight to `/login`; Browser SSO sessions navigate to the
backend-owned Central logout start URL. Do not infer the source from URL,
referrer, or localStorage, add separate application/SSO logout buttons, or
replace the Central CSRF-protected browser navigation with cross-origin XHR.
