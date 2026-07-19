# Fraud Detection

No automated fraud detection exists in this codebase today. This doc defines heuristics worth
building once the marketplace has enough transaction volume to warrant them.

## Signals worth tracking (not yet implemented)
- Multiple accounts with the same phone/WhatsApp number (`utils/theme.js#toWhatsAppNumber`
  normalizes numbers — reuse this normalization for duplicate-account detection).
- Listings priced far below the category/model average (see `pricing-rules.md`).
- New sellers with `verified: false` posting a high volume of listings quickly.
- Rapid, repeated bid retraction/re-entry patterns on auctions.

## Principle
Fraud signals should inform a **moderation queue** (human review, see `moderation.md`), not
auto-reject listings outright — false positives are costly for a marketplace's seller trust.
