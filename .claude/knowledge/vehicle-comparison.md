# Vehicle / Product Comparison

Reference for `ComparisonScreen.jsx` and `App.jsx`'s `compareList`/`compareSet`/`handleCompare`.

## Rules
- Maximum 3 items in a comparison at once (`handleCompare` enforces this).
- Toggle semantics: tapping an already-compared item removes it; tapping a new item at the cap is
  a no-op (does not evict the oldest item) — this is intentional per current `handleCompare` logic.
- Comparison state lives in `App.jsx`, not per-screen — see `automotive-search`.

## Comparable attributes
Whatever `ComparisonScreen` renders per item should stay in sync with the base product shape (see
`vehicle-schema.md`) — don't add a comparison-only attribute that the underlying product query
doesn't actually fetch.
