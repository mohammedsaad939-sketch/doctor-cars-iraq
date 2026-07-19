# Vehicle / Listing Status

## Vehicle (garage) status
From `MOCK.vehicles.status`: `"جيدة"` (good) / `"تحتاج صيانة"` (needs maintenance). Treat this as a
small closed enum, not free text, if/when it becomes a real column — this keeps status-based UI
(badges, filters, reminders) reliable.

## Listing/moderation status
Recommend a single status enum per listing (e.g. `pending`/`approved`/`rejected`/`hidden`) rather
than multiple overlapping booleans (`is_active`, `is_hidden`, `is_flagged`, ...) which can
contradict each other. See `moderation.md` for the review workflow around this field.

## Vehicle listing status (implemented)
`vehicle_listings.status` follows exactly this recommendation: one enum column
(`draft`/`published`/`unpublished`/`reserved`/`sold`/`archived`), never overlapping booleans.
`utils/vehicleStatus.js` is the single source of truth for the allowed transition graph and the
publish-completeness rule (a listing can't reach `published` without its required fields and at
least one image) — see `docs/VEHICLE_MANAGEMENT.md` for the full lifecycle diagram. The same
constraint is mirrored as a `CHECK` on the column in `supabase/migrations/`, so an invalid status
can't be written even if the client-side check were ever bypassed.
