---
name: automotive-search
description: Search, category filtering, and side-by-side comparison across the shop, home, and comparison screens.
license: Complete terms in LICENSE.txt
---

# Automotive Search

## Purpose
Own the discovery experience — category browsing, filters, and the up-to-3-item comparison feature — so search/filter logic is consistent between `HomeScreen`, `ShopScreen`, and `ComparisonScreen`.

## Scope
- `screens/ShopScreen.jsx` (category/search filtering)
- `screens/HomeScreen.jsx` (category shortcuts, promoted carousel)
- `screens/ComparisonScreen.jsx` + `App.jsx#handleCompare`/`compareList`/`compareSet`

## Responsibilities
- Keep the comparison list's 3-item cap and toggle-to-remove behavior (`handleCompare` in `App.jsx`) as the single source of truth — do not reimplement comparison state inside `ShopScreen` or `ComparisonScreen`.
- Keep category filtering consistent between `HomeScreen`'s shortcuts (which set `selectedCategory` via `navigate("shop", meta)`) and `ShopScreen`'s own filter UI.

## Architecture
Search/filter state (`selectedCategory`) and comparison state (`compareList`, `compareSet`) both live in `App.jsx` and are passed down as props — there's no separate search context/store. `compareSet` is derived (`new Set(compareList.map(...))`) fresh each render.

## Coding Standards
- Match the existing codebase: plain JS + JSX (no TypeScript), inline `style={}` objects using `utils/theme.js#T`, no CSS framework.
- Prefer small, focused functions/components over adding more branches to already-large files (see `docs/AUDIT.md` for current file-size hotspots).
- Every Supabase write checks its `error` before reporting success (see `automotive-security`).

## Naming Conventions
- Use `String(product.id)` consistently for comparison-set membership checks (already the convention in `App.jsx`) since ids may be numeric (`MOCK`) or UUID (live) depending on the data source.

## Folder Structure
```
screens/ShopScreen.jsx
screens/HomeScreen.jsx
screens/ComparisonScreen.jsx
App.jsx#handleCompare / compareList / compareSet
```

## Workflow
- 1. Any new discovery entry point (e.g. a new home-screen shortcut) should call the existing `navigate("shop", categoryMeta)` pattern rather than inventing a new filter mechanism.
- 2. Any new comparable attribute added to `ComparisonScreen` should also be considered for the base `ProductCard`/product query so the two stay in sync.

## Performance Rules
- Debounce any free-text search input added to `ShopScreen` before querying Supabase on every keystroke.
- Cap comparison-related queries to only the up-to-3 selected products, never the full catalog.

## Security Rules
- Search/filter inputs that build a Supabase `.ilike()`/`.textSearch()` query must not be concatenated into raw SQL — use the query builder's parameterized methods only.

## Review Rules
- Flag any new comparison-like state introduced outside `App.jsx`'s existing `compareList`/`compareSet`.

## Do
- Reuse `handleCompare`'s toggle/cap-at-3 logic for any new comparison entry point.
- Keep category ids/names consistent between `HomeScreen` shortcuts and `ShopScreen` filters.

## Don't
- Don't build a second, parallel comparison list.
- Don't query Supabase on every keystroke without debouncing.

## Common Mistakes
- Comparing product ids as numbers in one place and strings in another, silently breaking `compareSet` membership checks.
- Adding a filter dropdown to `ShopScreen` that doesn't reset when `initialCategory` changes via a `HomeScreen` shortcut.

## Checklist
- Comparison logic reused from App.jsx, not duplicated.
- Product id comparisons consistently use String() coercion.
- Search inputs debounced before querying.
- Category filters use the query builder, not raw string concatenation.

## Prompt Templates
- "Add a free-text search box to ShopScreen that debounces input and queries Supabase's product name column with ilike."

## Real Examples
```jsx
// Reusing the existing comparison toggle/cap pattern (App.jsx)
const handleCompare = (product) => {
  const pid = String(product.id);
  setCompareList(prev => {
    if (prev.some(p => String(p.id) === pid)) return prev.filter(p => String(p.id) !== pid);
    if (prev.length >= 3) return prev;
    return [...prev, product];
  });
};
```

## Best Practices
- Ground every change in what the codebase actually does today (see `docs/AUDIT.md`) rather than an idealized rewrite.
- Prefer additive, reviewable changes over broad refactors when touching shared files like `App.jsx`.
- Cross-reference `.claude/knowledge/` for domain facts (schema, VIN, pricing, moderation, etc.) instead of re-deriving them per PR.
