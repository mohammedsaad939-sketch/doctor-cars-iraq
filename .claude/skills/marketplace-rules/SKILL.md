---
name: marketplace-rules
description: Listing, auction, pricing/discount, and moderation rules that keep the marketplace fair and consistent.
license: Complete terms in LICENSE.txt
---

# Marketplace Rules

## Purpose
Codify the business rules that govern what a listing/auction is allowed to look like and do — discount math, auction bidding, category taxonomy — so every screen that touches them agrees on the same rules.

## Scope
- `screens/AuctionsScreen.jsx` (615 lines — bidding, time-left, minimum bid increments)
- `utils/components.jsx#ProductCard` (discount computation)
- `.claude/knowledge/marketplace-rules.md`, `pricing-rules.md`, `moderation.md`

## Responsibilities
- Own discount/pricing computation rules (percent-off vs old-price math) as one shared rule, not per-screen reimplementations.
- Own auction rules: minimum bid increment, time-left countdown, what happens at zero.
- Own the category taxonomy (`MOCK.categories` today) and moderation rules for listings.

## Architecture
Marketplace rules currently live as inline logic inside individual screens/components (e.g. `ProductCard`'s `isDiscounted`/`discountedPrice`). There is no shared `lib/pricing.js` yet — this skill's job is to make sure that as rules multiply (auctions, bulk/wholesale pricing, promoted listings), they get centralized rather than copy-pasted.

## Coding Standards
- Match the existing codebase: plain JS + JSX (no TypeScript), inline `style={}` objects using `utils/theme.js#T`, no CSS framework.
- Prefer small, focused functions/components over adding more branches to already-large files (see `docs/AUDIT.md` for current file-size hotspots).
- Every Supabase write checks its `error` before reporting success (see `automotive-security`).

## Naming Conventions
- Use `discount_percent`/`discount_ends_at` naming consistently for time-boxed discounts (already established in `ProductCard`).
- Use `minBid`/`currentBid`/`bids` for auction fields (already established in `MOCK.auctions`).

## Folder Structure
```
screens/AuctionsScreen.jsx
utils/components.jsx#ProductCard   # discount math (candidate to extract to lib/pricing.js)
.claude/knowledge/marketplace-rules.md
.claude/knowledge/pricing-rules.md
.claude/knowledge/moderation.md
```

## Workflow
- 1. Before adding a new pricing rule (bulk discount, promoted-listing fee, wholesale tier), check whether `ProductCard`'s existing discount logic already covers it or needs to move to a shared helper.
- 2. For auctions, always compute `timeLeft` from a real end-timestamp server-side/at query time, not by decrementing a client-side string counter.
- 3. Route all moderation decisions (hide/approve/reject a listing) through a single status field (see `.claude/knowledge/vehicle-status.md`/`moderation.md`), not ad-hoc booleans scattered across tables.

## Performance Rules
- Auction time-left displays should use a single shared countdown ticker/interval, not one `setInterval` per rendered auction card.

## Security Rules
- Bid placement must be validated server-side (RLS + a check constraint or trigger ensuring a new bid exceeds `currentBid + minBid` increment) — never trust a client-computed "is this a valid bid" check alone.
- Discount percentages and promoted-listing flags should only be settable by the seller who owns the listing or an admin — enforce via RLS, not just by hiding the input in the UI.

## Review Rules
- Flag any new pricing/discount computation that duplicates `ProductCard`'s existing math instead of reusing it.
- Flag any auction bid submission that doesn't handle the race condition of two simultaneous bids.

## Do
- Centralize discount/pricing math as this rule set grows past what fits in `ProductCard`.
- Treat every listing's moderation state as one enum-like status field.

## Don't
- Don't let two screens compute "is this listing discounted" differently.
- Don't allow a bid to be placed without server-side validation of the increment/expiry.

## Common Mistakes
- Computing discounted price with float rounding that doesn't match the `Math.round(... / 100) * 100` convention already used in `ProductCard`, producing off-by-a-few-hundred-dinar mismatches between screens.
- Letting an auction's `timeLeft` go negative in the UI instead of transitioning the listing to a closed state.

## Checklist
- Discount/pricing math reused from a single source, not reimplemented.
- Auction bid validated against increment + expiry server-side.
- Listing moderation status uses one shared status field.

## Prompt Templates
- "Extract ProductCard's discount computation into utils/pricing.js and reuse it from AuctionsScreen for any auctioned-item discounts."
- "Add server-side validation (RLS + constraint) ensuring a new bid always exceeds currentBid by at least minBid."

## Real Examples
```js
// Shared discount rule (extract from ProductCard, reuse everywhere)
export function computeDiscountedPrice(price, discountPercent, discountEndsAt) {
  const active = discountPercent > 0 && (!discountEndsAt || new Date(discountEndsAt) > new Date());
  if (!active) return null;
  return Math.round((price * (1 - discountPercent / 100)) / 100) * 100;
}
```

## Best Practices
- Ground every change in what the codebase actually does today (see `docs/AUDIT.md`) rather than an idealized rewrite.
- Prefer additive, reviewable changes over broad refactors when touching shared files like `App.jsx`.
- Cross-reference `.claude/knowledge/` for domain facts (schema, VIN, pricing, moderation, etc.) instead of re-deriving them per PR.
