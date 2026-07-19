# Vehicle / Listing Status

## Vehicle (garage) status
From `MOCK.vehicles.status`: `"جيدة"` (good) / `"تحتاج صيانة"` (needs maintenance). Treat this as a
small closed enum, not free text, if/when it becomes a real column — this keeps status-based UI
(badges, filters, reminders) reliable.

## Listing/moderation status
Recommend a single status enum per listing (e.g. `pending`/`approved`/`rejected`/`hidden`) rather
than multiple overlapping booleans (`is_active`, `is_hidden`, `is_flagged`, ...) which can
contradict each other. See `moderation.md` for the review workflow around this field.
