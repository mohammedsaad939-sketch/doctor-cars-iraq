# Architecture

Doctor Cars Iraq is a client-only single-page application: React 18 + Vite, talking directly to a
Supabase (Postgres + Auth + Realtime) backend. There is no server-side API layer in this repository.

```
┌─────────────────────────────┐        ┌──────────────────────┐
│  Browser (React 18 + Vite)  │──────▶ │ Supabase (Postgres,  │
│  App.jsx (hand-rolled       │◀────── │ Auth, Realtime,      │
│  screen switch/navigation)  │        │ Storage) — anon key  │
└─────────────────────────────┘        └──────────────────────┘
```

## Navigation
There is no route library. `App.jsx` holds one `currentScreen` string in state and a `navigate
(screen, meta)` helper; `renderScreen()` is a `switch` over 24 screen ids. See the
`automotive-platform` skill (`.claude/skills/automotive-platform/`) for the full registration
pattern and its consistency rules (a real bug from exactly this pattern — a screen-id mismatch in
`AdCarousel`'s seller-store navigation — was found and fixed during the audit that produced this
doc; see `docs/AUDIT.md`).

## State
No Redux/Zustand/Context — shared state (`session`, `profile`, `role`, `cartBadgeCount`, `favSet`,
`compareList`, language) lives in `App.jsx` and is passed down as props. Screen-local state stays
in the screen.

## Authentication & Authorization
`useAuth.js` owns the Supabase Auth session lifecycle (sign up/in/out, OAuth, password reset,
email verification, session persistence/refresh) and `useProfile.js` owns profile editing + avatar
upload — kept as two hooks since they're separate concerns. Authorization is a single ranked role
hierarchy (Guest/User/Dealer/Verified Dealer/Admin/Super Admin) derived by `utils/roles.js` from
existing fields (`profiles.role`, `profiles.is_admin`, `sellers.verified`) plus one new column
(`profiles.is_super_admin`) — see `docs/AUTHENTICATION.md` for the full module design and
`supabase/migrations/` for the RLS/trigger enforcement. As with everything else in this app, the
client-side role checks in `App.jsx` are UX only; Postgres RLS is the real boundary.

## Vehicle Management
`vehicle_listings` (a new table, distinct from the personal-vehicle `vehicles` table used by
`GarageScreen`) holds dealer/user for-sale listings with their own status lifecycle
(draft/published/unpublished/reserved/sold/archived), managed by `useVehicleListings.js` and
`utils/vehicleStatus.js`. See `docs/VEHICLE_MANAGEMENT.md` for the full design, including why this
is a separate table rather than a reuse of `vehicles`.

## Data access
Every screen that needs data calls `supabase.from(table).select(...)` directly. Row Level Security
(RLS) in Postgres is the **only** access-control boundary — see `automotive-security`. Realtime
updates use `supabase.channel(...).on("postgres_changes", ...)` (see `automotive-notifications`
for the reference pattern with correct cleanup).

## Styling
No CSS framework — every style is a plain JS object referencing the `T` design-token object in
`utils/theme.js`. See `automotive-uiux`.

## i18n / RTL
Arabic (`ar`, RTL) is the default and primary experience; an `en`/LTR toggle exists but most UI
strings are Arabic-only today. See `automotive-platform`.

## PWA
`public/manifest.json` + `public/sw.js`, registered in `App.jsx`, with a custom install-prompt
banner.

## Deployment
Vercel, auto-deploying on push (`vercel.json` is an SPA rewrite rule only — Vercel auto-detects the
Vite project). See `.claude/workflows/deployment.md`.

## Known structural limitations (see `docs/AUDIT.md` for the full audit)
- No code-splitting — all 24 screens ship in one bundle.
- No TypeScript — prop contracts are implicit.
- No SSR/SSG — limits organic-search visibility (`automotive-seo`).
- `SellerDashScreen.jsx` (949 lines) and a few other screens are large monoliths, candidates for
  splitting.

## Where to go deeper
- `.claude/skills/` — one skill per domain area, each with coding standards, do/don't, and examples.
- `.claude/agents/` — role-based agents referencing the skills above.
- `.claude/knowledge/` — automotive domain facts (schema, VIN, pricing, moderation, etc.).
- `.claude/workflows/` — step-by-step playbooks for common tasks.
- `docs/AUDIT.md` — the full repository audit and prioritized improvement plan.
- `docs/AUTHENTICATION.md` — the Authentication & User Management module in full.
- `docs/VEHICLE_MANAGEMENT.md` — the Vehicle Management module in full.
