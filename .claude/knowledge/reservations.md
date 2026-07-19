# Reservations

Not yet implemented (no booking/reservation table or screen exists for workshop appointments,
despite `MOCK.workshops` including `available`/`distance` fields that imply a future booking flow).

## Considerations for future implementation
- Model as a `reservations` table: `user_id`, `workshop_id` (or `seller_id`), `scheduled_at`,
  `status` (`requested`/`confirmed`/`completed`/`cancelled`), following the same status-enum
  discipline as `vehicle-status.md`/`moderation.md`.
- Double-booking prevention needs a server-side constraint (e.g. an exclusion constraint on
  `workshop_id` + time range), not just a client-side check — same discipline as auction bids
  (see `automotive-security`).
