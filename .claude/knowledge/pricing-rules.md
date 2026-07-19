# Pricing Rules

## Currency
All prices are Iraqi Dinar (IQD), formatted with `toLocaleString("ar-IQ")` (see `ProductCard`).
Prices in `MOCK` data are large integers (no decimal/fils granularity shown) — keep this
convention for consistency.

## Discount computation
Canonical implementation lives in `ProductCard` (`utils/components.jsx`) — see
`marketplace-rules.md` for the exact formula. Any new pricing surface (auctions, bulk/wholesale)
should reuse this formula rather than reimplementing it (see the `marketplace-rules` skill's
extraction recommendation).

## Wholesale / bulk pricing
Not yet implemented (`MOCK.sellers` includes a `جملة` (wholesale) seller type, implying tiered
pricing is an intended future feature) — model it as a `price_tiers` structure keyed by minimum
quantity when built, rather than a flat per-unit override.
