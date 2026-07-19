---
name: automotive-performance
description: Bundle size, code-splitting, render cost, and mobile-first performance for a largely inline-styled, eagerly-imported SPA.
license: Complete terms in LICENSE.txt
---

# Automotive Performance

## Purpose
Keep the app fast on the mobile connections most Iraqi users are on, given the app currently ships all 24 screens eagerly and styles everything with per-render inline objects.

## Scope
- `App.jsx` (eager imports of all 24 screens)
- `screens/SellerDashScreen.jsx`, `AuctionsScreen.jsx`, `HomeScreen.jsx`, `ProductDetailScreen.jsx` (largest files)
- `utils/components.jsx` (inline style objects recreated per render)
- `public/sw.js` (PWA caching)

## Responsibilities
- Identify and propose code-splitting boundaries (`React.lazy`) for screens not needed on first paint (admin, seller dashboard, academy, diagnosis, etc.).
- Flag components whose style objects could be hoisted to module scope or memoized when they don't depend on props/state.
- Watch the largest files (`SellerDashScreen.jsx` 949 lines, `AuctionsScreen.jsx` 615, `HomeScreen.jsx` 538, `ProductDetailScreen.jsx` 458) for further growth without splitting.

## Architecture
Vite bundles the app as a single SPA with no route-based code-splitting today — every screen listed in `App.jsx`'s imports ships in the main bundle regardless of whether the visitor ever opens it. There is no bundle-analysis tooling configured (no `rollup-plugin-visualizer`).

## Coding Standards
- Match the existing codebase: plain JS + JSX (no TypeScript), inline `style={}` objects using `utils/theme.js#T`, no CSS framework.
- Prefer small, focused functions/components over adding more branches to already-large files (see `docs/AUDIT.md` for current file-size hotspots).
- Every Supabase write checks its `error` before reporting success (see `automotive-security`).

## Naming Conventions
- Follow the existing repo-wide conventions: PascalCase components, camelCase functions/variables, snake_case Supabase columns mapped to camelCase at the query boundary.

## Folder Structure
```
App.jsx                       # eager imports — lazy-split candidate
screens/SellerDashScreen.jsx  # 949 lines
screens/AuctionsScreen.jsx    # 615 lines
screens/HomeScreen.jsx        # 538 lines
public/sw.js                   # PWA cache strategy
```

## Workflow
- 1. Before adding a new heavy screen, ask whether it needs to be in the initial bundle or can be `React.lazy`-loaded behind its own `Suspense` boundary.
- 2. Profile any screen making 3+ sequential Supabase calls on mount for opportunities to parallelize with `Promise.all`.
- 3. Add `rollup-plugin-visualizer` (or `vite-bundle-visualizer`) before making large structural performance claims, so improvements are measured, not guessed.

## Performance Rules
- Lazy-load admin/seller/academy/diagnosis/price-estimator screens — they are not needed for the buyer's home/shop first-paint path.
- Hoist static style objects (that don't reference props/state) out of component bodies.
- Keep using `loading="lazy"` on all `<img>` tags (already done) and consider a CDN/image-transform layer for Supabase Storage-hosted images.

## Security Rules
- Performance changes (lazy-loading) must not accidentally change which bundle an unauthenticated user can fetch — lazy chunks are still publicly fetchable by URL, so this is a UX optimization, not a security boundary (do not rely on code-splitting to "hide" admin code).

## Review Rules
- Flag any new screen import added to `App.jsx`'s eager top-of-file import block without a lazy-loading discussion.
- Flag `SellerDashScreen.jsx`/similarly large files growing further without a split proposal.

## Do
- Propose `React.lazy` boundaries for rarely-visited screens.
- Measure before/after bundle size when claiming a performance win.

## Don't
- Don't treat code-splitting as a security control.
- Don't add new heavy dependencies without checking their bundle-size impact first.

## Common Mistakes
- Assuming inline style objects are the main performance cost when bundle size (all 24 screens eager) is the bigger lever for this app.
- Lazy-loading a screen without a loading fallback, causing a blank flash on slow connections.

## Checklist
- New heavy screens evaluated for lazy-loading.
- Sequential independent Supabase calls parallelized.
- Bundle size measured, not assumed, before claiming a win.
- Lazy boundaries have a Suspense fallback.

## Prompt Templates
- "Convert AdminScreen, SellerDashScreen, and AcademyScreen to React.lazy imports with a shared loading fallback, and report the before/after main bundle size."

## Real Examples
```jsx
// Lazy-loading a rarely-visited screen
const AdminScreen = React.lazy(() => import("./screens/AdminScreen"));
// ...
<Suspense fallback={<LoadingSpinner />}>
  {currentScreen === "admin" && profile?.is_admin && <AdminScreen />}
</Suspense>
```

## Best Practices
- Ground every change in what the codebase actually does today (see `docs/AUDIT.md`) rather than an idealized rewrite.
- Prefer additive, reviewable changes over broad refactors when touching shared files like `App.jsx`.
- Cross-reference `.claude/knowledge/` for domain facts (schema, VIN, pricing, moderation, etc.) instead of re-deriving them per PR.
