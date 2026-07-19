---
name: automotive-platform
description: Overall app architecture for Doctor Cars Iraq: the single-page navigation model, session/profile flow, PWA shell, and bilingual (Arabic RTL / English) UI.
license: Complete terms in LICENSE.txt
---

# Automotive Platform

## Purpose
Own the shape of the application shell: how `App.jsx` boots, how navigation between the 24 screens works, how session/profile/cart/favorites state is threaded down, and how the PWA + language-toggle behave. Any change that adds a new screen, changes the bottom nav, or touches `useAuth`/`App.jsx` routing belongs here.

## Scope
- `App.jsx` (root component, screen switch, navigation, global toasts, PWA banner)
- `useAuth.js` (session/profile bootstrap, sign up/in/out, OAuth)
- `utils/theme.js` (design tokens `T`, `toWhatsAppNumber`, `relativeTime`)
- `screens/RoleSelectionScreen.jsx` (first-run role picker)
- `public/manifest.json`, `public/sw.js` (PWA)

## Responsibilities
- Keep the screen registry (`renderScreen` switch, `SCREEN_ICONS`, `SCREEN_TITLES`, `screensWithBack`) in sync whenever a screen is added, renamed, or removed.
- Ensure every new screen receives the props it needs from `App.jsx` (session, profile, navigate, favSet/onFavToggle, onCartAdd) rather than re-fetching global state itself.
- Preserve RTL-by-default behavior (`dir="rtl"`, `document.documentElement.dir`) and only flip to LTR for the `en` toggle.
- Keep the PWA install banner and service-worker registration non-blocking (never throw if `serviceWorker` is unsupported).

## Architecture
Client-only SPA. `App.jsx` is a hand-rolled router: one `currentScreen` string in state, a `switch` in `renderScreen()`, and a `navigate(screen, meta)` helper that also manages `prevScreen` for back-navigation. There is no route library, no URL sync (the browser address bar never changes), and no code-splitting — every screen is imported eagerly.

## Coding Standards
- Match the existing codebase: plain JS + JSX (no TypeScript), inline `style={}` objects using `utils/theme.js#T`, no CSS framework.
- Prefer small, focused functions/components over adding more branches to already-large files (see `docs/AUDIT.md` for current file-size hotspots).
- Every Supabase write checks its `error` before reporting success (see `automotive-security`).

## Naming Conventions
- Screen ids are `camelCase` strings matching the `case` labels in `renderScreen()` (e.g. `sellerDash`, `sellerPublic`) — never introduce a new id without adding it to `SCREEN_ICONS` *and* `SCREEN_TITLES` *and*, if it needs a back button, `screensWithBack`.
- Screen components are `PascalCase` + `Screen.jsx` (e.g. `GarageScreen.jsx`) — keep this suffix for every new screen.
- Do not introduce a fourth id spelling for the same screen (see the audit finding: `sellerProfile` exists in the lookup tables but is unreachable — the real id is `sellerPublic`).

## Folder Structure
```
App.jsx                  # root shell + navigation + global state
useAuth.js                # session/profile hook
utils/theme.js            # design tokens + i18n-adjacent helpers
screens/*.jsx              # one component per screen id
public/manifest.json      # PWA manifest
public/sw.js               # service worker
```

## Workflow
- 1. Decide the screen id (camelCase) and whether it needs a back header.
- 2. Add the screen component under `screens/`, accepting only the props it actually reads.
- 3. Import it in `App.jsx`, add a `case` in `renderScreen()`, and add matching entries to `SCREEN_ICONS`/`SCREEN_TITLES`/`screensWithBack` if applicable.
- 4. Wire any navigation entry points (bottom nav, shortcut toolbar, or a `navigate("newScreen", meta)` call from another screen).
- 5. Run `npm run build` locally to catch import/typo errors before opening a PR (there is no router-level type safety here).

## Performance Rules
- Do not add a 25th screen to the eager top-of-file import list without considering `React.lazy(() => import(...))` + `Suspense` — bundle size only grows from here.
- Keep `navigate()` a pure state transition; never perform a network call inside it.
- Static style objects (e.g. the `<style>` block in `App.jsx`) should not be recreated per render if they don't depend on props/state.

## Security Rules
- Never gate access to sensitive data using only `currentScreen` — the client-side switch in `App.jsx` (e.g. `profile?.is_admin ? <AdminScreen/> : ...`) is a UX convenience, not a security boundary. The real boundary is Supabase RLS (see `automotive-security`).
- `useAuth.js` must keep clearing `profile` on sign-out (it does — do not regress this) so stale role/permission data never survives a session change.

## Review Rules
- Any PR touching `App.jsx` navigation must show the `SCREEN_ICONS`/`SCREEN_TITLES`/`screensWithBack` diff alongside the new `case`, not as a follow-up.
- Reject PRs that add a new global `useState` in `App.jsx` for state that's only used by one screen — push it down into that screen instead.

## Do
- Keep new screens self-contained: fetch their own screen-specific data, accept only shared state as props.
- Reuse `navigate(screen, meta)` for all cross-screen transitions instead of inventing a second navigation mechanism.
- Default every new screen's text to Arabic; add English strings only where the `en` toggle is actually wired end-to-end.

## Don't
- Don't add a screen id in one lookup table (icons/titles/back-list) without adding it to the others.
- Don't call `supabase` directly from `App.jsx` for screen-specific data — that belongs inside the screen.
- Don't block `serviceWorker.register` or `beforeinstallprompt` handling with unhandled promise rejections.

## Common Mistakes
- Adding a new screen id to `SCREEN_TITLES` but forgetting `screensWithBack`, leaving the screen without a way to navigate back.
- Spelling a screen id differently between the `case` label and the lookup tables (see the real `sellerPublic`/`sellerProfile` drift found in the audit).
- Fetching `session`/`profile` again inside a screen instead of receiving it as a prop from `App.jsx`, causing two sources of truth.

## Checklist
- New screen id added consistently to `renderScreen`, `SCREEN_ICONS`, `SCREEN_TITLES`, and `screensWithBack` (if it needs a back button).
- Screen only receives the props it uses.
- No direct Supabase admin-bypass logic added to `App.jsx`.
- `npm run build` passes.
- RTL layout verified for the new screen (test with `lang="ar"`, the default).

## Prompt Templates
- "Add a new screen `<name>` reachable from the shortcut toolbar, following the existing screen-registration pattern in App.jsx."
- "Audit App.jsx's screen lookup tables for id drift like the sellerPublic/sellerProfile mismatch and report any other mismatches."

## Real Examples
```jsx
// Registering a new screen consistently (App.jsx)
case "warrantyClaims":
  return <WarrantyClaimsScreen session={session} profile={profile} onNavigate={navigate} />;
// ...and in the same PR:
const SCREEN_ICONS = { ..., warrantyClaims: "🛡️" };
const SCREEN_TITLES = { ..., warrantyClaims: "مطالبات الضمان" };
const screensWithBack = [..., "warrantyClaims"];
```

## Best Practices
- Ground every change in what the codebase actually does today (see `docs/AUDIT.md`) rather than an idealized rewrite.
- Prefer additive, reviewable changes over broad refactors when touching shared files like `App.jsx`.
- Cross-reference `.claude/knowledge/` for domain facts (schema, VIN, pricing, moderation, etc.) instead of re-deriving them per PR.
