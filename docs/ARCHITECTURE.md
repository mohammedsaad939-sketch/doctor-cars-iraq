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
No Redux/Zustand/Context — shared state (`session`, `profile`, `cartBadgeCount`, `favSet`,
`compareList`, language) lives in `App.jsx` and is passed down as props. Screen-local state stays
in the screen.

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
