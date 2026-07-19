# Vehicle Management

A production-grade vehicle-listing module: create/edit/delete a for-sale vehicle listing, manage
its lifecycle status, upload/compress/order its photos, and browse published listings. Built on
top of the Authentication module (`docs/AUTHENTICATION.md`) — reuses `utils/roles.js`, the existing
UI primitives in `utils/components.jsx`, and this repo's established hook/screen conventions
rather than introducing a second set of patterns.

## Why a new table, not the existing `vehicles` table

`GarageScreen.jsx`'s `vehicles` table is a **personal owned-vehicle / service-history record**
("مركبتي" — plate number, chassis number, maintenance log). This module is a **for-sale listing**
(price, VIN, negotiable, status lifecycle, moderation) — a different concern with a different
shape and different access rules. Reusing `vehicles` for both would mean mixing a private
service-tracking record with a public marketplace listing in one table — a modeling error, not a
simplification. So this module introduces `vehicle_listings` as its own table
(`supabase/migrations/20260719225441_vehicle_listings.sql`) and leaves `GarageScreen`/`vehicles`
completely untouched.

## Module layout

```
utils/vehicleStatus.js        # status enum + allowed transitions + publish-completeness rule
utils/vehicleOptions.js       # shared enum lists (governorates, fuel types, features, ...)
utils/validators.js           # extended: VIN format+checksum, price, image validation (generalized, not duplicated)
utils/imageProcessing.js      # client-side compression + thumbnail generation (pure Canvas/Image APIs)
useVehicleListings.js          # CRUD + status transitions + image/video/document upload
utils/components.jsx           # extended: a small Select primitive (shared by the form and filters)
screens/VehicleFormScreen.jsx  # create/edit — all fields + image manager
screens/VehicleManageScreen.jsx # "My Vehicle Listings" — owner inventory + status actions
screens/VehicleListingsScreen.jsx # public browse + filter + detail modal
supabase/migrations/20260719225441_vehicle_listings.sql # table, RLS, storage bucket
```

Reachable today from: the floating shortcut toolbar (🚙 معرض السيارات → `VehicleListingsScreen`,
public browse) and `ProfileScreen`'s menu (🚙 سياراتي المعروضة للبيع → `VehicleManageScreen`, owner
management) — see `automotive-platform`'s screen-registration workflow, followed exactly (screen id
added consistently to `renderScreen`, `SCREEN_ICONS`, `SCREEN_TITLES`, `screensWithBack`).

## Fields

Brand, Model, Trim, Year, VIN, Engine, Engine Size, Horsepower, Transmission, Fuel Type, Drive
Type, Exterior/Interior Color, Mileage, Condition, Price, Negotiable, Currency, Governorate, City,
GPS Location (lat/lng), Description, Features (multi-select tags), Images, Video, Documents. See
`utils/vehicleOptions.js` for the closed enum lists (governorates, fuel types, transmissions, drive
types, conditions, currencies, features) shared between the form and the browse filters.

## Status lifecycle

`utils/vehicleStatus.js` is the single source of truth (mirroring how `utils/roles.js` centralizes
the Authentication module's role logic) — a listing has exactly one `status`, never overlapping
booleans:

```
draft ──publish──> published ──unpublish──> unpublished ──publish──> published
  │                    │  │                                              │
  │                    │  └──reserve──> reserved ──publish──> (back to published)
  │                    │                    │
  │                    └──sold──> sold <────┘
  │
  └──archive──> archived ◄──archive from any state
                    │
                    └──restore──> draft
```

`requestStatusTransition(listing, toStatus)` enforces both the transition graph **and** a
publish-completeness rule (brand/model/year/price/governorate/city + at least one image required
before a listing may reach `published`) — this is exactly why saving the form always writes
`draft`/preserves the current status, and publishing is a separate, explicit action in
`VehicleManageScreen`.

`useVehicleListings.js#changeStatus` also sets `priority = true` automatically when a
Verified-Dealer-or-above account publishes — the concrete effect of "Verified Dealer: priority
publishing" (`VehicleListingsScreen` orders the public feed by `priority desc, created_at desc`).

## Image system

- **Multi-image upload**: a plain `<input type="file" multiple>`, following the same pattern as
  `GarageScreen`/`SellerDashScreen`.
- **Drag & drop ordering**: native HTML5 drag events (`draggable`/`onDragStart`/`onDragOver`/
  `onDrop`) on the thumbnail strip in `VehicleFormScreen` — no new dependency.
- **Cover image**: index 0 of the ordered `images`/`thumbnails` arrays; a "⭐ غلاف" button on any
  non-cover thumbnail moves it to index 0 (same array, no separate `cover_image_url` column).
- **Compression**: `utils/imageProcessing.js#resizeAndCompressImage` — Canvas-based resize to a
  1600px-longest-side JPEG at 0.82 quality, pure browser APIs (no new dependency, consistent with
  `automotive-performance`'s bundle-size discipline).
- **Thumbnail generation**: the same function at a 320px target, uploaded alongside the full image
  as `<path>_thumb.jpg`. `VehicleListingsScreen`/`VehicleManageScreen` render thumbnails; the detail
  modal's main image uses the full-size version.

The pure sizing math (`computeScaledDimensions`) is split out from the DOM-dependent I/O
specifically so it's unit-testable without a real image decoder (jsdom doesn't decode image
bytes) — see `utils/imageProcessing.test.js`.

## Validation

- **VIN**: `isValidVinFormat` (17 chars, excludes I/O/Q) is the **hard**, blocking requirement.
  `vinChecksumMatches` implements the real NHTSA/ISO-3779 position-9 check-digit algorithm, but is
  exposed only as a **soft UI hint** — Iraq's used-car market is dominated by Gulf/Korea/Japan/
  Europe imports whose VINs are valid 17-character identifiers but weren't necessarily assigned
  under the North American check-digit standard. Hard-rejecting on checksum mismatch would
  incorrectly block a large share of genuine listings, so this is deliberately non-blocking — see
  the comment above `vinChecksumMatches` in `utils/validators.js`.
- **Required fields**: brand, model, year, price, governorate, city — enforced both at
  submit-time (`VehicleFormScreen#validate`) and again as the publish-completeness rule in
  `requestStatusTransition` (an edit could otherwise leave a *published* listing incomplete).
- **Duplicate VIN detection**: a client-side pre-check (`checkDuplicateVin`, fast UX feedback) plus
  the authoritative unique index (`vehicle_listings_vin_unique_idx`, partial on `vin is not null`)
  in the migration, with the insert/update error mapped to a friendly message on a `23505` — the
  same insert-then-catch discipline as `App.jsx#handleCartAdd`, not a select-then-decide race.
- **Price**: `isValidPrice` rejects zero/negative/non-numeric/implausibly-large (fat-finger) values.
- **Image validation**: `validateVehicleImageFile` (10MB pre-compression cap, JPG/PNG/WEBP) is the
  same generic `validateImageFile` the Authentication module's avatar upload uses, just with a
  larger size allowance — not a second, duplicated check.

## Permissions

| Role | Capability |
|---|---|
| **Guest** | Read published/reserved listings — enforced by the `vehicle_listings_select_public_or_own_or_admin` RLS policy allowing the `anon` role. Not yet wired into a pre-login UI entry point (see below). |
| **User** | Create/read/update/delete their **own** listings only (`owner_id = auth.uid()`). |
| **Dealer** | Same row-level access as User — "Dealer" is a role label for a marketplace-operator account (per the Authentication module's role hierarchy), not a wider database permission; there's nothing to separately enforce here. |
| **Verified Dealer** | Same row-level access, plus **priority publishing** — a real, visible effect (see Status lifecycle above), not a permission boundary change. |
| **Admin** | Full read/write on **all** listings (the same `is_admin`-based RLS pattern as the Authentication module's `profiles` policies). |
| **Super Admin** | Same row-level access as Admin for vehicle listings — the Admin/Super-Admin distinction lives in account-privilege actions (`utils/roles.js`), which this module doesn't add to. |

### On Guest UI access
This app's shell (`App.jsx`) currently gates every screen behind `if (!session) return <AuthScreen/>`
— there is no pre-login browsing anywhere in the app today, for any feature. The backend genuinely
supports it (the RLS policy above allows `anon` reads), but wiring a pre-auth entry point into
`App.jsx`'s top-level gate is a cross-cutting change to the app's core navigation shell, touching
every existing screen's assumptions — a bigger, separate architectural decision than "add a Vehicle
Management module," and arguably a product decision (does the business want anonymous browsing
before signup?) as much as an engineering one. Documented here as a deliberate, known scope
boundary rather than silently expanded into, per this task's "do not modify completed modules
unless required" instruction — flag for a follow-up task if pre-login browsing is wanted.

## Security

- RLS (not the client-side screen wiring) is the real permission boundary, per this repo's
  non-negotiable rules.
- Every write checks its `error` before reporting success (`useVehicleListings.js`).
- Duplicate-VIN and publish-completeness are both re-validated in the RLS/constraint layer
  (unique index) and the transition-graph module respectively — not client-trust-only.
- Storage: public read, uploads restricted to the authenticated uploader's own folder — identical
  pattern to the `avatars` bucket in the Authentication module's migration.

## Migration status

`supabase/migrations/20260719225441_vehicle_listings.sql` is a reviewable SQL file, **not yet
applied** to any live Supabase project from this change (no DB connection available in this
environment — same caveat as the Authentication module's migration). Idempotent
(`IF NOT EXISTS`/`DROP POLICY IF EXISTS`/`ON CONFLICT`), safe to run against the existing project.

## Testing

`utils/vehicleStatus.test.js`, `utils/imageProcessing.test.js`, and the VIN/price/image-validation
additions to `utils/validators.test.js` cover all the pure, dependency-free logic — the full status
transition graph (including the publish-completeness rule), image-scaling math, and VIN
format/checksum validation using fixtures verified by actually computing the checksum algorithm
rather than memorized examples. Screen-level/integration tests (mocked-Supabase upload flows,
drag-and-drop reordering) are a deliberately deferred follow-up, consistent with this repo's
existing testing maturity (see `docs/AUTHENTICATION.md`'s identical scope note).

## Known follow-ups (not done in this change)

- Guest pre-login UI access (see above).
- A dedicated admin moderation UI for vehicle listings (the "Admin: Full access" permission is real
  and enforced at the RLS layer today; a purpose-built review queue in `AdminScreen` — analogous to
  its existing seller-verification tab — is a reasonable next step but wasn't in this module's
  explicit requirements list).
- Screen-level/integration test coverage (see Testing above).
