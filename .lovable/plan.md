
# Resource Management System — Frontend Architecture Plan

Frontend only. Backend REST API exists at `VITE_API_BASE_URL`. Auth tokens come from Supabase (browser SDK) and are forwarded as `Authorization: Bearer <jwt>` to the backend. A mock data layer sits behind the same service interface so the UI is usable before the API is wired.

Stack reconciliation: the project is scaffolded on **TanStack Start** (file-based routing in `src/routes/`). All "React Router" items in the spec map to TanStack Router equivalents (`<Link to>`, `useNavigate`, `createFileRoute`). Zustand, React Hook Form + Zod, TanStack Query, Axios, FullCalendar, shadcn/ui, lucide-react are added as deps.

---

## 1. Folder structure

```text
src/
  routes/                       # file-based routes (TanStack Router)
    __root.tsx                  # shell + providers + auth listener
    index.tsx                   # public landing → redirects auth'd users to /dashboard
    login.tsx
    register.tsx
    calendar.tsx                # public calendar
    _authenticated/
      route.tsx                 # auth gate (ssr:false) + MainLayout
      dashboard.tsx
      resources.index.tsx
      resources.$id.tsx
      my-bookings.index.tsx
      my-bookings.$id.tsx
      _admin/
        route.tsx               # role gate: role === 'admin'
        admin.index.tsx                 → /admin
        admin.resources.tsx             → /admin/resources
        admin.bookings.index.tsx        → /admin/bookings
        admin.bookings.$id.tsx          → /admin/bookings/:id
  layouts/
    AuthLayout.tsx
    MainLayout.tsx              # sidebar + topbar shell
  components/
    ui/                         # shadcn primitives
    common/                     # PageHeader, EmptyState, LoadingSkeleton, ErrorBoundary, ConfirmDialog, StatusBadge, DataTable, Pagination
    resources/                  # ResourceCard, ResourceFilters, ResourceForm, RoomFields, CarFields
    bookings/                   # BookingForm, BookingTable, BookingTimeline, BookingStatusBadge, ProofUploader, ProofGallery
    calendar/                   # CalendarView, CalendarFilters, BookingEventPopover
    layout/                     # Sidebar, Topbar, UserMenu, NavItem, MobileNav
    charts/                     # TrendChart, UtilizationChart (recharts)
  stores/
    authStore.ts
    resourceStore.ts
    bookingStore.ts
    uiStore.ts
  services/
    http.ts                     # axios instance + interceptors
    api/
      auth.api.ts
      resources.api.ts
      bookings.api.ts
      proofs.api.ts
      public.api.ts
    mocks/
      index.ts                  # MSW-style toggle via VITE_USE_MOCKS
      handlers/{resources,bookings,public,auth}.ts
      fixtures/                 # seed JSON
  hooks/
    queries/                    # useResources, useResource, useBookings, useMyBookings, usePublicBookings
    mutations/                  # useCreateBooking, useApproveBooking, useRejectBooking, useCloseBooking, useUploadProof, useCRUDResource
    useAuth.ts, useRole.ts, useMediaQuery.ts, useDebounce.ts
  lib/
    queryClient.ts, queryKeys.ts, dates.ts, format.ts, cn.ts, env.ts, errors.ts
  schemas/                      # zod schemas (login, register, booking, room, car, proof)
  types/                        # TS models (see §6)
  config/
    nav.ts                      # nav items + role visibility
    constants.ts                # booking rules, intervals, status colors
```

---

## 2. Route structure

Public: `/` (public booking calendar — landing page for users and admins), `/login`, `/register`. `/calendar` redirects to `/`.
Authenticated (under `_authenticated/`): `/dashboard`, `/resources`, `/resources/:id`, `/my-bookings`, `/my-bookings/:id`. Booking creation and proof upload only happen on these routes — the gate forces login.
Admin (nested under `_authenticated/_admin/`): `/admin`, `/admin/resources`, `/admin/bookings`, `/admin/bookings/:id`.

The public calendar (`/`) shows approved, completed AND pending (requested) bookings, with per-resource color coding, a legend, click-to-detail dialog, and Month / Week view toggle. Pending bookings render with a dashed outline; approved/completed render as filled blocks. CTAs to sign in / register appear for unauthenticated visitors.

Gating:
- `_authenticated/route.tsx` — `ssr:false`; `beforeLoad` checks Supabase session, else `redirect({ to: '/login', search: { redirect: location.href } })`.
- `_admin/route.tsx` — `beforeLoad` reads `authStore.user.role`; if not `admin`, `redirect({ to: '/dashboard' })`.

Each route file owns its own `head()` (title + description). Loaders prime TanStack Query via `ensureQueryData`; components read via `useSuspenseQuery`. Every route declares `errorComponent` and `notFoundComponent`.

---

## 3. Layout structure

- **AuthLayout** — centered card on muted background; used by `/login`, `/register`. Logo, slot for form, footer link to the other auth page.
- **MainLayout** — `SidebarProvider` + collapsible sidebar + sticky topbar + `<Outlet/>`. Sidebar items filtered by role from `config/nav.ts`. Topbar: breadcrumb, notifications bell, theme toggle, `UserMenu` (avatar → profile, logout).
- **Mobile**: sidebar becomes an off-canvas `Sheet` triggered from the topbar; bottom-safe paddings on forms.

---

## 4. Zustand store design

All stores typed; `authStore` persisted via `persist` middleware (user + role only — token lives in Supabase session, never duplicated).

- **authStore**
  - state: `user: AppUser | null`, `role: 'user' | 'admin' | null`, `status: 'idle'|'loading'|'authenticated'|'unauthenticated'`
  - actions: `hydrateFromSession()`, `setUser()`, `signOut()`
  - selectors: `useIsAdmin()`, `useCurrentUser()`
- **resourceStore** (UI-only; server data stays in TanStack Query)
  - state: `filters: { search, type: 'room'|'car'|'all', availability }`, `view: 'grid'|'list'`
  - actions: `setFilter`, `resetFilters`
- **bookingStore** (UI-only)
  - state: `filters: { status, resourceId, dateRange }`, `selectedBookingId`
  - actions: `setFilter`, `selectBooking`
- **uiStore**
  - state: `theme`, `sidebarCollapsed`, `commandPaletteOpen`, `activeModal`
  - actions: `toggleTheme`, `toggleSidebar`, `openModal`, `closeModal`

Rule: server data is owned by TanStack Query; Zustand holds session, UI, and filter state.

---

## 5. API service architecture

- `services/http.ts` — single axios instance with `baseURL = import.meta.env.VITE_API_BASE_URL`.
  - Request interceptor: `const { data } = await supabase.auth.getSession(); headers.Authorization = ``Bearer ${data.session.access_token}```.
  - Response interceptor: normalize errors → `ApiError { status, code, message, fieldErrors }`; on 401 trigger `authStore.signOut()` + redirect to `/login`.
- One module per resource (`resources.api.ts`, `bookings.api.ts`, `proofs.api.ts`, `public.api.ts`, `auth.api.ts`). Each function is fully typed and returns plain DTOs.
- **TanStack Query** layer in `hooks/queries` and `hooks/mutations` wraps the api functions. Centralized `queryKeys` factory (`qk.resources.list(filters)`, `qk.bookings.detail(id)`, …) for safe invalidation after mutations.
- **Mock layer**: `VITE_USE_MOCKS=true` starts MSW in the browser before React renders; handlers serve the fixtures so every screen works pre-backend. Swapping to real API requires only env vars — no component changes.

Endpoint → service map:
```
GET    /resources                          resources.api.list
GET    /resources/:id                      resources.api.get
POST   /resources, PUT /:id, DELETE /:id   resources.api.{create,update,remove}
GET    /bookings, /bookings/:id            bookings.api.{list,get}
POST   /bookings, PUT /bookings/:id        bookings.api.{create,update}
PUT    /bookings/:id/{approve,reject,close} bookings.api.{approve,reject,close}
POST   /bookings/:id/proofs                proofs.api.upload (multipart)
GET    /bookings/:id/proofs                proofs.api.list
GET    /public/bookings/all                public.api.allBookings
GET    /public/bookings/resource/:id       public.api.resourceBookings
```

---

## 6. TypeScript models (`src/types/`)

```ts
type Role = 'user' | 'admin';
type ResourceType = 'room' | 'car';
type BookingStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
type ProofKind = 'before' | 'after';

interface AppUser { id: string; email: string; fullName: string; role: Role; avatarUrl?: string; }

interface ResourceBase { id: string; name: string; description: string; type: ResourceType; photoUrl?: string; isAvailable: boolean; createdAt: string; }
interface Room extends ResourceBase { type: 'room'; location: string; capacity: number; equipment: string[]; }
interface Car  extends ResourceBase { type: 'car'; licensePlate: string; fuelType: 'gasoline'|'diesel'|'electric'|'hybrid'; }
type Resource = Room | Car;

interface Booking { id: string; resourceId: string; resource?: Resource; userId: string; user?: Pick<AppUser,'id'|'fullName'|'email'>; date: string; startTime: string; endTime: string; status: BookingStatus; adminNotes?: string; createdAt: string; updatedAt: string; }
interface Proof { id: string; bookingId: string; kind: ProofKind; url: string; uploadedAt: string; }

interface Paginated<T> { items: T[]; page: number; pageSize: number; total: number; }
interface ApiError { status: number; code?: string; message: string; fieldErrors?: Record<string,string>; }
```

Zod schemas in `src/schemas/` mirror these for form validation and infer types where useful.

---

## 7. Component hierarchy (key screens)

- `/dashboard` → `DashboardPage` → `StatCardGrid`, `UpcomingBookingsList`, `RecentBookingsList`, `StatusSummaryChart`.
- `/resources` → `ResourcesPage` → `ResourceFilters` + `ResourceGrid` → `ResourceCard`.
- `/resources/:id` → `ResourceDetailPage` → `ResourceHeader`, `ResourceInfo` (RoomInfo|CarInfo), `AvailabilityCalendar` (FullCalendar), `BookingForm`.
- `/my-bookings` → `MyBookingsPage` → `BookingFilters`, `BookingTable` → row actions (View, Cancel, UploadProof).
- `/my-bookings/:id` → `BookingDetailPage` → `BookingSummary`, `BookingTimeline`, `ProofSection` (`ProofUploader` × before/after, `ProofGallery`).
- `/admin` → `AdminDashboardPage` → KPI cards + `TrendChart` + `UtilizationChart`.
- `/admin/resources` → `AdminResourcesPage` → `DataTable` + `ResourceFormDialog` (tabs: Room / Car).
- `/admin/bookings` → `AdminBookingsPage` → `DataTable` with status filter chips.
- `/admin/bookings/:id` → `AdminBookingReviewPage` → `BookingSummary`, `UserInfoCard`, `ResourceInfoCard`, `ProofReview`, `AdminActionsBar`, `AdminNotesField`.

---

## 8. Shared reusable components (`components/common`)

`PageHeader`, `SectionCard`, `StatCard`, `StatusBadge` (color map per BookingStatus), `DataTable` (sortable, paginated, slotted actions), `EmptyState`, `LoadingSkeleton`, `ErrorBoundary` + `ErrorState`, `ConfirmDialog`, `FormField` (RHF + shadcn glue), `DateRangePicker`, `TimeRangePicker` (30-min steps, ≤4h), `FileDropzone` (image preview + size/type validation), `Toast` wrapper around `sonner`, `RoleGate` (renders children only for matching role).

---

## 9. Authentication flow

1. **Login** (`/login`): RHF + Zod → `supabase.auth.signInWithPassword`. On success → `authStore.hydrateFromSession()` → navigate to `search.redirect ?? '/dashboard'`.
2. **Register** (`/register`): RHF + Zod → `supabase.auth.signUp`. Default role `'user'`; admin role is granted server-side (out of scope).
3. **Session hydration**: `__root.tsx` registers `supabase.auth.onAuthStateChange` once → filters to `SIGNED_IN | SIGNED_OUT | USER_UPDATED` → updates `authStore` and invalidates queries.
4. **Token propagation**: axios request interceptor pulls the current session JWT and sets `Authorization: Bearer …` on every backend call.
5. **Role detection**: read `role` from JWT app metadata (decoded via `jwt-decode`) and/or `user.user_metadata.role`; mirrored into `authStore.role`.
6. **Logout**: cancel queries → clear query cache → `supabase.auth.signOut()` → `navigate('/login', { replace: true })`.

No Lovable Cloud / Supabase tables are created here — the existing backend owns data; Supabase is only the identity provider.

---

## 10. Role-based routing strategy

- `_authenticated/route.tsx` guards all signed-in routes (session check; redirect to `/login` with `redirect` search param).
- `_authenticated/_admin/route.tsx` guards admin subtree: `if (context.auth.role !== 'admin') throw redirect({ to: '/dashboard' })`.
- `Sidebar` reads `nav.ts` which tags each item with `roles: Role[]`; filtered before render so users never see admin links.
- A `<RoleGate role="admin">` component hides inline admin-only actions inside shared pages (e.g., admin shortcuts on a resource card).
- Router context exposes `{ auth: { user, role, isAdmin } }` so `beforeLoad` is the single source of truth — no per-component re-checks.

---

## 11. Calendar integration strategy (FullCalendar)

- Wrapper component `CalendarView` configures plugins: `dayGridPlugin` (month), `timeGridPlugin` (week/day), `interactionPlugin` (click/select).
- Event source = TanStack Query result mapped to FullCalendar events; color by `status` via central `statusColor` map; tooltip via shadcn `HoverCard`.
- Used in three places:
  1. **Public `/calendar`** — `usePublicBookings()` → all bookings; `CalendarFilters` (resource, type) update query params (`useSearch`) so views are shareable.
  2. **Resource detail availability** — scoped to `resource_id`; click empty slot pre-fills `BookingForm`.
  3. **(Optional)** admin booking management calendar mode toggle.
- Booking creation rules enforced client-side in `BookingForm`: 30-min step `<TimeRangePicker>`, max 4 h validated by Zod (`refine((v) => diffMinutes(v.start, v.end) <= 240)`), conflict pre-check by querying existing bookings for that resource + date.
- Responsive: month view on desktop; auto-switch to `listWeek` under `md` breakpoint.

---

## 12. File upload strategy (proof photos)

- `ProofUploader` uses `FileDropzone`:
  - accept `image/jpeg,image/png,image/webp`, max 5 MB, single file per slot (`before` / `after`).
  - client-side compression via `browser-image-compression` if > 1 MB.
  - preview thumbnail with replace/remove before submit.
- Upload via `useUploadProof` mutation → `POST /bookings/:id/proofs` as `multipart/form-data` with `kind` field; progress via axios `onUploadProgress` surfaced through mutation `meta`.
- On success: invalidate `qk.bookings.detail(id)` and `qk.proofs.list(id)`; toast confirmation.
- Admin review fetches via `proofs.api.list`; `ProofGallery` lightboxes the image and shows EXIF-free metadata (uploaded at, kind).

---

## 13. Mobile responsiveness strategy

- Tailwind v4 with mobile-first breakpoints (`sm 640 / md 768 / lg 1024 / xl 1280`). Container queries for cards.
- `MainLayout`: persistent sidebar on `lg+`; collapsible icon-rail on `md`; off-canvas `Sheet` on `< md` with hamburger in topbar.
- Tables → `DataTable` switches to stacked card list under `md` via a `responsive` prop.
- Forms: full-width inputs, large tap targets (44px min), sticky action bar on mobile.
- FullCalendar swaps month → `listWeek` under `md`; toolbar collapses to a popover.
- Image uploads: prefer camera capture on mobile (`<input capture="environment">`).
- Charts (recharts) wrapped in `ResponsiveContainer`; KPI grids 1 → 2 → 4 columns.
- Light/dark theme via `next-themes`-style toggle stored in `uiStore`; tokens already defined in `src/styles.css`.

---

## Technical notes

- Dependencies to add: `zustand`, `@tanstack/react-query`, `axios`, `react-hook-form`, `@hookform/resolvers`, `zod`, `@fullcalendar/{react,daygrid,timegrid,interaction,list}`, `@supabase/supabase-js`, `jwt-decode`, `recharts`, `sonner`, `date-fns`, `browser-image-compression`, `msw` (dev).
- `QueryClient` is created inside `getRouter()` (already wired) — keep `defaultPreloadStaleTime: 0`.
- Every loader that touches the API uses `ensureQueryData`; components use `useSuspenseQuery`. No `useEffect`-based fetching.
- Error handling: global `ErrorBoundary` in `MainLayout`, per-route `errorComponent`, axios → `ApiError` mapped to toast + inline form errors via RHF `setError`.
- Env vars: `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_USE_MOCKS`.
- No backend, no Supabase tables, no edge functions, no migrations.

---

## Build order (when implementing)

1. Deps + `http.ts` + Supabase client + auth store + `__root.tsx` listener.
2. AuthLayout + `/login`, `/register`; `_authenticated` gate.
3. MainLayout (sidebar/topbar) + nav config + role gate.
4. Types + zod schemas + queryKeys + mock layer + fixtures.
5. Resources (list, detail, booking form with FullCalendar embed).
6. My bookings (list, detail, proof upload).
7. Public `/calendar`.
8. Dashboard widgets + charts.
9. Admin subtree (dashboard, resource CRUD, booking review).
10. Polish: empty/loading/error states, responsive QA, dark mode pass.
