# Vehicle & Product Schema (as inferred from client code)

This repo has no migrations — this is the schema **as inferred from the queries the client actually
makes** (`App.jsx`, `utils/components.jsx`, screens). Reconcile against the real Supabase project
when its migrations become available; do not treat this as authoritative over the live database.

## `products`
Inferred columns (from `AdCarousel`'s query and `ProductCard`'s usage):
`id` (uuid), `name`, `price` (number, IQD), `old_price` (number, nullable), `discount_percent`
(number, nullable), `discount_ends_at` (timestamp, nullable), `is_promoted` (bool), `images`
(array or single string — code guards both shapes), `category_id` (fk → `categories`), `seller`-
related fields, `rating`, `city`.

## `categories`
`id`, `name`, `sort_order` (see `utils/hooks.js#getCategories`).

## `cart_items`
`id`, `user_id` (fk → auth user), `product_id` (fk → `products`, must be a real UUID — the client
rejects non-UUID ids before writing, see `automotive-payments`), `quantity`.
Unique constraint on `(user_id, product_id)` — see the insert-then-catch-23505 pattern in
`App.jsx#handleCartAdd`.

## `favorites`
`user_id`, `product_id` (same UUID constraint as `cart_items`).

## `notifications`
`id`, `user_id`, `type` (`order`/`auction`/`message`/`service`/...), `title`, `body`, `is_read`
(bool), `created_at`.

## Vehicles (garage)
Inferred from `MOCK.vehicles` shape (not yet confirmed against a live table): `make`, `model`,
`year`, `plate`, `color`, `last_service`, `next_service`, `km`, `status`.

## Open questions for reconciliation
- Confirm whether `products.part_no` exists as a real column (referenced conceptually in
  `vehicle-data` skill) or needs to be added.
- Confirm the real `sellers`/`profiles` relationship (is a seller a `profiles` row with a role, or
  a separate `sellers` table?).
