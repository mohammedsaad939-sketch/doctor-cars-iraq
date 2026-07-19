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
`year`, `plate`, `color`, `last_service`, `next_service`, `km`, `status`. This is a **personal
owned-vehicle / service-history record** (see `GarageScreen.jsx`) — do not confuse with
`vehicle_listings` below, a different table for a different concern.

## `vehicle_listings` (implemented — Vehicle Management module)
Defined in `supabase/migrations/20260719225441_vehicle_listings.sql`; see
`docs/VEHICLE_MANAGEMENT.md` for the full module. Columns: `id`, `owner_id` (fk → `profiles`),
`seller_id` (fk → `sellers`, nullable), `brand`, `model`, `trim`, `year`, `vin` (unique when
non-null), `engine`, `engine_size`, `horsepower`, `transmission`, `fuel_type`, `drive_type`,
`exterior_color`, `interior_color`, `mileage`, `condition`, `price`, `negotiable`, `currency`,
`governorate`, `city`, `gps_lat`, `gps_lng`, `description`, `features` (text[]), `images` (text[],
ordered — index 0 is the cover), `thumbnails` (text[], parallel to `images`), `video_url`,
`documents` (text[]), `status` (enum — see `vehicle-status.md`), `priority` (bool, set for
Verified-Dealer-or-above on publish), `created_at`, `updated_at`.

## Open questions for reconciliation
- Confirm whether `products.part_no` exists as a real column (referenced conceptually in
  `vehicle-data` skill) or needs to be added.
- Confirm the real `sellers`/`profiles` relationship (is a seller a `profiles` row with a role, or
  a separate `sellers` table?).
