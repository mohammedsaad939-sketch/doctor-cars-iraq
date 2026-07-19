---
name: vehicle-data
description: Vehicle and parts data modeling: products, categories, specs, VIN, and the live-vs-mock data boundary.
license: Complete terms in LICENSE.txt
---

# Vehicle Data

## Purpose
Own the shape of vehicle/part/product data as it flows from Supabase into the UI — `products`, `categories`, and vehicle records (`GarageScreen`'s `vehicles`) — and keep the historical `MOCK` fixture from silently substituting for live data.

## Scope
- `utils/components.jsx` (`MOCK` fixture, `ProductCard`)
- `screens/GarageScreen.jsx` (owned-vehicle records)
- `screens/ProductDetailScreen.jsx`, `screens/ComparisonScreen.jsx`, `screens/CarPriceEstimatorScreen.jsx`
- `.claude/knowledge/vehicle-schema.md`, `.claude/knowledge/vin-validation.md`, `.claude/knowledge/vehicle-specifications.md`

## Responsibilities
- Define and document the inferred Supabase schema for `products`, `categories`, and vehicle records (see `.claude/knowledge/vehicle-schema.md`).
- Ensure every screen that lists or displays a vehicle/part reads from the live Supabase table, never from `MOCK`, once that screen has been migrated (per the audit's dead-code finding).
- Normalize product shape at the query boundary (e.g. `images[0] || "📦"`, `discount_percent`, `old_price`) so downstream components like `ProductCard` don't special-case Supabase's raw column names.

## Architecture
Vehicle/part records are plain Postgres rows fetched via `supabase.from(table).select(...)`. There is no ORM, no shared TypeScript types, and no runtime schema validation (e.g. zod) — the shape is implicit in whatever `.select()` string a given screen uses, which is why the same product going through two different screens can carry two different shapes (compare the `MOCK.products` fixture shape to the mapped shape in `AdCarousel`'s `handleTap`).

## Coding Standards
- Match the existing codebase: plain JS + JSX (no TypeScript), inline `style={}` objects using `utils/theme.js#T`, no CSS framework.
- Prefer small, focused functions/components over adding more branches to already-large files (see `docs/AUDIT.md` for current file-size hotspots).
- Every Supabase write checks its `error` before reporting success (see `automotive-security`).

## Naming Conventions
- Match Supabase's actual snake_case column names in queries (`discount_percent`, `old_price`, `is_promoted`), then map to the camelCase shape (`oldPrice`) only at the UI boundary, mirroring the existing `AdCarousel` mapping.
- Keep `partNo`/`part_no` naming consistent if/when a real `products.part_no` column exists — don't invent a second field name for the same concept.

## Folder Structure
```
utils/components.jsx        # MOCK fixture + ProductCard (presentational)
screens/GarageScreen.jsx     # user's vehicle records
screens/ProductDetailScreen.jsx
screens/ComparisonScreen.jsx
screens/CarPriceEstimatorScreen.jsx
.claude/knowledge/vehicle-schema.md
.claude/knowledge/vin-validation.md
.claude/knowledge/vehicle-specifications.md
```

## Workflow
- 1. Check `.claude/knowledge/vehicle-schema.md` for the inferred column names before writing a new query.
- 2. Query only the columns the screen needs (`select("id,name,price,...")`), not `select("*")`, to keep payloads small on mobile.
- 3. Map snake_case → camelCase at the query boundary, not scattered through JSX.
- 4. If a field doesn't exist yet in the live schema, do not fall back to `MOCK` — surface an empty state instead.

## Performance Rules
- Cache rarely-changing reference data (categories) the way `utils/hooks.js#getCategories` already does (module-level cache) rather than refetching per screen mount.
- Paginate/limit vehicle & product lists (`ShopScreen`, `AuctionsScreen`) instead of fetching entire tables.

## Security Rules
- Never trust a client-supplied `product_id`/`vehicle_id` as authorization — always scope writes by `user_id = auth.uid()` and let RLS enforce it (see `automotive-security`).
- Validate that any `product_id` used as a foreign key is a real UUID before writing (the app already does this for `cart_items`/`favorites` in `App.jsx` — extend the same check to any new vehicle/part write path).

## Review Rules
- Flag any new screen that imports `MOCK` for data that has a corresponding live Supabase table.
- Flag any product/vehicle field name that doesn't match `.claude/knowledge/vehicle-schema.md` without a comment explaining the discrepancy.

## Do
- Keep `.claude/knowledge/vehicle-schema.md` updated whenever a new column is discovered or added.
- Use `maybeSingle()` instead of `single()` when a zero-row result is an expected, non-error case (as `AdCarousel` already does).
- Normalize discount/pricing math in one place (see `ProductCard`'s `isDiscounted`/`discountedPrice` logic) rather than recomputing it per screen.

## Don't
- Don't add new hardcoded arrays that look like `MOCK` data for a feature that will eventually read from Supabase — build the empty/loading state instead.
- Don't `select("*")` when only a handful of columns are displayed.
- Don't silently coerce a missing/invalid VIN or part number into an empty string in a way that lets it pass validation later.

## Common Mistakes
- Leaving a screen wired to `MOCK.products` after the corresponding Supabase table went live, so real inventory changes never show up (flagged in `.github/copilot-instructions.md` Pattern 2).
- Comparing prices as strings instead of numbers (Iraqi dinar values can be large; watch for `toLocaleString("ar-IQ")` being applied to a string instead of a number).
- Assuming `images` is always an array (the codebase already has to guard with `Array.isArray(data.images) ? data.images[0] : data.images`) — repeat this guard anywhere `images` is read.

## Checklist
- Query selects only needed columns.
- No `MOCK` import for data with a live table.
- snake_case → camelCase mapping happens once, at the query boundary.
- VIN/part-number/UUID inputs validated before write.
- Schema doc updated if a new column was introduced.

## Prompt Templates
- "Migrate ScreenX off MOCK.products onto a live Supabase query, following the mapping pattern used in AdCarousel."
- "Add a `vin` column to the vehicle-schema doc and validate it client-side using the vin-validation knowledge doc before insert."

## Real Examples
```js
// Mapping a raw Supabase row to the shape ProductCard expects (pattern from AdCarousel)
const product = {
  ...data,
  image: Array.isArray(data.images) ? (data.images[0] || "📦") : (data.images || "📦"),
  category: data.categories?.name || "",
  oldPrice: data.old_price || null,
  rating: data.rating || 0,
  reviews: 0,
};
```

## Best Practices
- Ground every change in what the codebase actually does today (see `docs/AUDIT.md`) rather than an idealized rewrite.
- Prefer additive, reviewable changes over broad refactors when touching shared files like `App.jsx`.
- Cross-reference `.claude/knowledge/` for domain facts (schema, VIN, pricing, moderation, etc.) instead of re-deriving them per PR.
