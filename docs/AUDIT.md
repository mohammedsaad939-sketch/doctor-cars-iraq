# Repository Audit — Doctor Cars Iraq

Date: 2026-07-19
Scope: full repository (frontend-only SPA; no server code in-repo)

## 1. Architecture

- **Type**: Single-page application (SPA). No file-based router — `App.jsx` (`DoctorCarsApp`) holds a
  `currentScreen` string in state and renders one of 24 screen components via a `switch` in `renderScreen()`.
  Navigation is a hand-rolled `navigate(screen, meta)` function, not React Router / TanStack Router.
- **Rendering**: Client-side only (Vite + `@vitejs/plugin-react`). No SSR/SSG. This caps SEO for
  content that should be crawlable (see `automotive-seo` skill).
- **Backend**: Supabase (Postgres + Auth + Realtime + Storage) accessed directly from the client via
  `@supabase/supabase-js`. There is no BFF/API layer in this repo — all data access, including admin
  operations, happens client-side, which makes Postgres Row Level Security (RLS) the *only* security
  boundary (see Security below).
- **State management**: Local component state + prop drilling from `App.jsx` down to screens. No
  Redux/Zustand/Context API for shared state (session/profile/cart/favorites are all threaded as props).
- **Styling**: 100% inline `style={{ }}` objects driven by a single design-token object `utils/theme.js#T`.
  No CSS framework, no CSS Modules, no Tailwind. One global `index.css` (very small) plus a `<style>` block
  injected in `App.jsx` for scrollbar/keyframes.
- **i18n**: Two languages (`ar`, `en`) toggled client-side; `ar` is RTL and is the default/primary
  experience. Persisted via `localStorage("lang")`. No translation catalog/library — this is set up but
  most screens are still Arabic-only text, so `en` toggle is largely cosmetic today.
- **PWA**: `public/manifest.json` + `public/sw.js`, registered in `App.jsx`, with a custom
  `beforeinstallprompt` banner.
- **Deployment**: Vercel (`vercel.json` is an SPA rewrite rule only). No CI pipeline in `.github/` beyond
  a Copilot review-focus doc.

## 2. Framework / Package Manager / Languages

- Framework: React 18.3 + Vite 5.4 (`@vitejs/plugin-react`).
- Package manager: npm (`package-lock.json` present; no `pnpm-lock.yaml`/`yarn.lock` — consistent).
- Languages: JavaScript + JSX only. No TypeScript anywhere (`tsconfig.json` absent). No `.d.ts`/PropTypes,
  so component contracts are undocumented and unchecked.
- Only production dependencies: `react`, `react-dom`, `@supabase/supabase-js`. Dev: `vite`, `@vitejs/plugin-react`.

## 3. Duplicated Code

- **UUID validation regex** `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i` is
  inlined twice in `App.jsx` (`toggleFavorite`, `handleCartAdd`). → extracted to `utils/validators.js`
  in this change (Phase 8).
- **Toast dismiss timers** (`setTimeout(() => set...(null), N)`) are repeated 7× across `App.jsx` with
  copy-pasted error/success strings — a good candidate for a `useToast()` hook, flagged in
  `automotive-uiux`/`automotive-performance` skills for a future pass (not extracted in this change to
  keep the refactor low-risk).
- **Screen-icon/title lookup tables** (`SCREEN_ICONS`, `SCREEN_TITLES`, `screensWithBack`) are three
  parallel data structures keyed by the same screen-id strings that must be kept in sync by hand whenever
  a screen is added — a structural duplication risk, not a copy-paste one.

## 4. Dead Code

- `utils/components.jsx` exports a `MOCK` object (products/categories/auctions/sellers/workshops/
  emergencyServices/vehicles/notifications/courses/marketStats) that is largely superseded by live
  Supabase queries in the screens that actually render lists (e.g. `HomeScreen`, `ShopScreen` query
  `products`/`categories` tables directly). `MOCK` still appears to be imported in `App.jsx`. Confirm
  per-screen whether `MOCK` is still read anywhere at runtime; if not, delete it — leaving it in place
  risks a regression where a screen is "fixed" by wiring it back to fake data (this exact risk is why
  `.github/copilot-instructions.md` already calls out "mock data presented as real" as a top review flag).
- No other unused exports were found via manual review; there is no bundler/tree-shake report configured
  to verify this automatically (see Testing/Performance below for the tooling gap).

## 5. Unused Packages

- All 5 declared packages (`react`, `react-dom`, `@supabase/supabase-js`, `vite`, `@vitejs/plugin-react`)
  are used. No unused packages found. However there is **no dependency-audit tooling** (`depcheck`,
  `npm-check`) wired in, so this can silently drift as the app grows — recommend adding a CI check.

## 6. Security Risks

- **RLS is the only access-control layer** and the client uses the public/anon key directly
  (`utils/supabase.js` → `VITE_SUPABASE_PUBLISHABLE_KEY`). Any table without RLS enabled, or with RLS
  enabled but missing the matching `GRANT` to `anon`/`authenticated`, is either wide open or totally
  broken — this exact failure mode is already documented in `.github/copilot-instructions.md` (Pattern 3)
  and is the single highest-leverage risk in this codebase.
- **Client-side admin gating only**: `case "admin": return profile?.is_admin ? <AdminScreen /> : ...` in
  `App.jsx` hides the admin screen in the UI, but does **not** protect the underlying data — `AdminScreen`
  must rely on RLS policies keyed off `profiles.is_admin` (or a Postgres role), not on this client check,
  or any user can call the same Supabase queries directly from the browser console.
  → captured as a hard rule in `automotive-security`/`automotive-admin` skills.
  For the same reason, treat client-passed props like `profile.is_admin` as **never a real permission
  check** — every write path that matters must be re-validated by RLS.
- **Non-atomic check-then-write** against unique constraints (`cart_items`) is called out in
  `.github/copilot-instructions.md` Pattern 4, and `handleCartAdd` in `App.jsx` already uses the
  recommended insert-then-catch-unique-violation pattern — good; this should be the template used going
  forward instead of the reverse pattern.
- **Secrets hygiene** is currently correct: `.env*` is gitignored, `git ls-files` shows no tracked env
  file, and `supabaseClient.js` warns (not throws) on missing env vars. No hardcoded keys found in the
  repo.
- **External links** (`window.open(ad.external_url, "_blank")` in `utils/components.jsx`) omit
  `rel="noopener noreferrer"`, a minor tabnabbing risk for admin-configured ad URLs.

## 7. Performance Bottlenecks

- **No code-splitting**: all 24 screens are imported eagerly at the top of `App.jsx`, so the entire app
  (including admin/seller-only screens) ships in the initial bundle for every visitor. `React.lazy` +
  `Suspense` per-screen would materially cut first-load JS for a mobile-first Iraqi user base on slower
  connections.
- **Inline style objects** are re-created on every render for every component (no `useMemo`/module-level
  hoisting for static style objects), which is a real but secondary cost next to bundle size.
- **`SellerDashScreen.jsx` (949 lines) and `AuctionsScreen.jsx` (615 lines)** are large monoliths likely
  doing multiple sequential Supabase round-trips per mount — worth profiling for request waterfalls and
  splitting into sub-components with colocated data fetching.
- **Un-memoized derived data**: `compareSet` in `App.jsx` is rebuilt from `compareList` on every render of
  the top-level component (cheap today at ≤3 items, but a pattern to watch as lists grow).
- No image optimization pipeline (raw `<img>` tags with `loading="lazy"`, good — but no responsive
  `srcset`/CDN transform for Supabase Storage or ad images).

## 8. Missing Documentation

- No `ARCHITECTURE.md`, `CONTRIBUTING.md`, or coding-standards doc existed before this change (added in
  Phase 10).
- No JSDoc/PropTypes on any component — prop contracts must be inferred by reading call sites.
- No documented Supabase schema (tables/columns/RLS policies) anywhere in-repo — this repo only contains
  the frontend, so the schema lives entirely in the Supabase project. `docs/` now includes an
  Automotive Knowledge base (`.claude/knowledge/vehicle-schema.md`, etc.) documenting the schema *as
  inferred from client code*, but it should be reconciled against the real Supabase project migrations
  when those become available.

## 9. Missing Tests

- **Zero automated tests existed** before this change — no test runner, no CI test gate. Added in this
  change: Vitest + a first slice of unit tests for the pure, dependency-free helpers in `utils/theme.js`
  and the new `utils/validators.js` (Phase 9). Component/integration tests (React Testing Library) and
  Supabase-backed tests (mocked client) are recommended next steps and are documented in the
  `automotive-testing` skill and `.claude/workflows/testing.md`.

## 10. Folder Organization

- Flat structure: `screens/` (all 24 screens, no sub-grouping by domain) and `utils/` (4 files mixing
  theme tokens, a Supabase re-export, a generic hook, and a large `components.jsx` that mixes true
  reusable UI primitives with the `MOCK` data blob and one data-fetching component (`AdCarousel`).
  As the app grows, `screens/` would benefit from domain subfolders (e.g. `screens/marketplace/`,
  `screens/seller/`, `screens/account/`) and `utils/components.jsx` should be split into
  `components/ui/*` (Badge, Btn, Card, Input, Modal, Tabs, Section — pure presentational) vs
  `components/commerce/ProductCard.jsx` and `components/commerce/AdCarousel.jsx` (data-aware).
- `supabaseClient.js` (root) and `utils/supabase.js` (re-export) are two entry points to the same client;
  harmless today but a redundant indirection worth collapsing later.

## 11. Naming Inconsistencies

- Screen id strings mix English domain terms with ad-hoc casing conventions (`sellerDash`, `sellerPublic`,
  `sellerProfile` — note `sellerProfile` appears in `SCREEN_ICONS`/`SCREEN_TITLES` but the actual case in
  `renderScreen()`'s switch is `sellerPublic`; `sellerProfile` is unreachable dead config for those two
  lookup tables). This is exactly the kind of drift that the three-parallel-arrays structure in section 3
  produces.
- File naming is consistently `PascalCase` + `Screen.jsx` suffix — good, no action needed there.
- Arabic UI strings are inlined directly in JSX (not centralized in a translation dictionary), so the same
  phrase (e.g. error toast strings) is retyped at each call site with no guarantee of consistency.

## Improvement Plan (prioritized)

| # | Action | Phase | Risk |
|---|---|---|---|
| 1 | Extract UUID validation into `utils/validators.js`; use in `App.jsx` | 8 | Low |
| 2 | Fix `sellerProfile`/`sellerPublic` naming drift in screen lookup tables | 8 | Low |
| 3 | Add `rel="noopener noreferrer"` to the external ad link `window.open` | 8 | Low |
| 4 | Introduce Vitest; add unit tests for `utils/theme.js` and `utils/validators.js` | 9 | Low |
| 5 | Introduce ESLint (flat config, React hooks plugin) + `npm run lint` | 2/4 | Low |
| 6 | Document Supabase schema-as-inferred in `.claude/knowledge/vehicle-schema.md` | 7 | None (docs only) |
| 7 | Add `.claude/` Skills/Agents/Hooks/Workflows/Templates ecosystem | 2–6 | None (additive) |
| 8 | Add root docs (`ARCHITECTURE.md`, `CONTRIBUTING.md`, etc.) | 10 | None (additive) |
| 9 (follow-up, not in this change) | Code-split screens with `React.lazy` | — | Medium — needs Suspense fallback UX pass |
| 10 (follow-up, not in this change) | Split `utils/components.jsx` into `components/ui` + `components/commerce`, remove `MOCK` after confirming no remaining reads | — | Medium — touches every screen's imports |
| 11 (follow-up, not in this change) | Move admin/seller-only screens to enforce checks server-side via RLS audit | — | Requires access to the live Supabase project |

Items 9–11 are refactors that touch every screen's import graph or require access to the live Supabase
project (outside this repo) to verify safely, so they are documented as prioritized follow-ups rather than
executed blind in this change — consistent with "refactor safely where needed" rather than a risky
wall-to-wall rewrite with no way to test the result end-to-end in this environment.

## Change Log — what this pass actually did

**Tooling added** (previously absent): ESLint 9 flat config (`eslint.config.js`), Vitest
(`vitest.config.js`) with 17 passing unit tests for `utils/theme.js`/`utils/validators.js`, and
`npm run lint` / `npm test` / `npm run review` scripts. Verified with `0 errors, 45 warnings` on
lint and `0 vulnerabilities` in production dependencies (`npm audit --omit=dev`); the 5
vulnerabilities in `npm audit`'s full report are all in the `esbuild`/`vite`/`vitest` dev-server
chain (moderate/high/critical but dev-only, not shipped) — not fixed in this pass because the
available fix (`vite@8`) is a breaking major-version jump that needs its own testing pass.

**Real bugs found and fixed** (not hypothetical — found via the build/lint/scan tooling added
above, then fixed and re-verified):
1. `App.jsx`: duplicate `minHeight` object key (`"100vh"` immediately overwritten by `"100dvh"`) —
   caught by `vite build`'s esbuild warning; removed the dead first value (no behavior change).
2. `App.jsx`: duplicated inline UUID-regex validation — extracted to `utils/validators.js#isUUID`
   with unit tests.
3. `App.jsx`: dead/unreachable `"sellerProfile"` entries in `SCREEN_ICONS`/`SCREEN_TITLES`/
   `screensWithBack` (no such case exists in `renderScreen()`) — removed after confirming, via the
   fix below, that nothing legitimately targets that id.
4. `utils/components.jsx#AdCarousel.handleTap`: **the actual bug behind #3** — tapping a
   `seller_store` ad called `onNavigate("sellerProfile")` with no metadata, silently falling
   through to the `default` (home) case instead of opening the seller's storefront. Fixed to
   `onNavigate("sellerPublic", { sellerId: ad.link_target_id })`, matching the established
   `navigate("sellerPublic", { sellerId })` convention used elsewhere (`HomeScreen.jsx`,
   `ProductDetailScreen.jsx`).
5. `screens/HomeScreen.jsx`: two unescaped `"` characters inside JSX text — an actual
   `react/no-unescaped-entities` **error** (not a warning) surfaced by the new lint config; fixed
   with `&quot;`.
6. `screens/CarPriceEstimatorScreen.jsx`: a live "اعرض سيارتك للبيع" button with
   `onClick={() => {}}` — exactly Pattern 6 from `.github/copilot-instructions.md` (dead handler
   presented as active). No "list your car" destination screen exists yet and the screen isn't
   even passed an `onNavigate` prop, so inventing a destination would be scope creep; disabled the
   button and labeled it "(قريباً)" instead of leaving a silently-broken affordance.
7. `utils/components.jsx#AdCarousel` and 6 screen files (`HomeScreen.jsx`, `ProfileScreen.jsx`,
   `ProductDetailScreen.jsx`, `EmergencyScreen.jsx`, `SellerPublicScreen.jsx`,
   `SellerDashScreen.jsx`): `window.open(...)` calls to external `https://` URLs (WhatsApp deep
   links, Google Maps, ad external links) without `noopener,noreferrer`, a tabnabbing risk —
   found by the new `.claude/hooks/security-scan.sh` and fixed everywhere it applies. `tel:`-scheme
   `window.open` calls were deliberately left as-is (no browsing context/`window.opener` risk for a
   non-web URI scheme).

**Confirmed, not yet fixed** (would require a wider, riskier change than this pass's scope):
ESLint's new `no-unused-vars` pass shows `App.jsx` importing `MOCK` and several presentational
components (`Badge`, `Stars`, `isImageUrl`, `Btn`, `Card`, `Input`, `Modal`, `Tabs`, `Section`,
`AdCarousel`, `ProductCard`) that it never actually uses — empirical confirmation of this audit's
Section 4 dead-code hypothesis about `MOCK`. Left as a follow-up (item 10 above) rather than
deleted blind, since removing `MOCK` requires first confirming per-screen that no screen still
reads it (out of this pass's grep-only verification).
