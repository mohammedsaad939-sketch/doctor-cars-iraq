# Inspection

Not yet implemented in this codebase (no inspection screen/table exists today). This doc defines
the intended shape for when a vehicle-inspection feature is built (e.g. pre-purchase inspection for
auction/marketplace vehicle listings).

## Suggested fields
`vehicle_id` (or listing id), `inspector_id`, `inspected_at`, `overall_condition` (enum: excellent/
good/fair/poor), per-system findings (engine, transmission, brakes, electrical, body/paint,
tires), `photos` (array), `notes`.

## Integration points
- Should surface as a trust signal on the corresponding listing (`ProductDetailScreen`/
  `AuctionsScreen`), similar to `sellerVerified`.
- Inspection reports should be immutable once published (append a new inspection record rather than
  editing an old one) for trust/audit reasons — see `fraud-detection.md`.
