# Marketplace Rules (Knowledge Reference)

See also the `marketplace-rules` **skill** (`.claude/skills/marketplace-rules/`) for coding
standards; this doc is the domain-fact reference it points to.

## Discount rules
- A discount is "active" only if `discount_percent > 0` AND (`discount_ends_at` is null OR in the
  future) — see `ProductCard`'s `isDiscounted` logic, the canonical implementation.
- Discounted price rounds to the nearest 100 IQD (`Math.round(price * (1 - pct/100) / 100) * 100`).

## Auction rules
- Auctions have `currentBid`, `minBid` (minimum increment), `bids` (count), `timeLeft`.
- A new bid must exceed `currentBid + minBid` — must be enforced server-side (see
  `automotive-security`), not just assumed from client UI constraints.

## Promoted listings
`is_promoted` shows a "ممول" (sponsored) badge — should only be settable by the listing's owner or
an admin (RLS-enforced), likely tied to a paid promotion feature not yet implemented.
