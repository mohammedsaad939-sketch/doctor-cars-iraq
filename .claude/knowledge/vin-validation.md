# VIN Validation

A VIN (Vehicle Identification Number) is a 17-character code. Implemented in
`utils/validators.js` and used by the Vehicle Management module's
`VehicleFormScreen`/`useVehicleListings.js` — see `docs/VEHICLE_MANAGEMENT.md` for the full
module. `GarageScreen`'s personal-vehicle `chassis_number` field is a free-text field and does not
(yet) use this validation — it's a different table/concern (see `vehicle-schema.md`).

## Format rules — `isValidVinFormat` (hard, blocking)
- Exactly 17 characters.
- Uppercase letters and digits only.
- Excludes the letters **I**, **O**, **Q** (to avoid confusion with 1/0).

This is the only hard requirement — a VIN failing this check is rejected everywhere.

## Checksum — `vinChecksumMatches` (soft hint only, never blocking)
Implements the real North American (NHTSA/SAE J853 / ISO 3779) position-9 check-digit algorithm:
weight each character (letters transliterated per the standard table, digits map to themselves),
sum the weighted values, and confirm position 9 equals the sum mod 11 (`"X"` represents 10).

**This is intentionally never a hard rejection.** Iraq's used-car market is dominated by vehicles
imported from the Gulf, Korea, Japan, and Europe — their VINs are valid 17-character ISO 3779
identifiers but were not necessarily assigned under the NHTSA check-digit standard, so a checksum
mismatch is common and legitimate. Hard-rejecting on it would incorrectly block a large share of
genuine listings. `vinChecksumMatches` is surfaced only as a UI hint ("this doesn't match the North
American check-digit standard — verify manually"), per the comment above it in
`utils/validators.js`.

## Duplicate detection
A VIN should be unique across the marketplace. `useVehicleListings.js#checkDuplicateVin` does a
client-side pre-check for fast feedback; the authoritative protection is a partial unique index on
`vehicle_listings.vin` (nulls excluded) in `supabase/migrations/`, with the resulting `23505` error
mapped to a friendly message — the same insert-then-catch discipline as `automotive-security`
mandates elsewhere, not a select-then-decide race.

## Where it's enforced
- Client-side: format (hard) + checksum (soft hint) validation before submit, for fast user
  feedback (`VehicleFormScreen`).
- Server-side: the partial unique index enforces no-duplicate-VIN; there is no server-side format/
  checksum constraint (format is cheap enough that client-side is sufficient, and the checksum is
  deliberately non-blocking — see above).
