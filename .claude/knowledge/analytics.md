# Analytics

No analytics/telemetry pipeline exists in this codebase today (no Segment/GA/PostHog integration
found in `package.json` or source).

## Existing "stats" today
`MOCK.marketStats` in `utils/components.jsx` is hardcoded display data, not derived from real
events — flagged in `docs/AUDIT.md` as a dead-code/mock-data risk (Pattern 2 in
`.github/copilot-instructions.md`) if it's ever presented next to real numbers elsewhere in the UI.

## Recommendation for a real implementation
- Track marketplace-relevant events (listing view, cart add, purchase, search query, category
  browse) server-side or via a privacy-respecting analytics provider — avoid embedding a
  client-side analytics SDK with a secret/writable key with broad scope.
- Aggregate stats (like `marketStats`) should be computed from real event/order data (a scheduled
  Postgres view or function), never hand-maintained as a UI constant.
