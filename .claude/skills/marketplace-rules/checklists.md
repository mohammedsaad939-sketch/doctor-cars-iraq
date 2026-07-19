# Marketplace Rules — Review Checklist

## Core Checklist
- [ ] Discount/pricing math reused from a single source, not reimplemented.
- [ ] Auction bid validated against increment + expiry server-side.
- [ ] Listing moderation status uses one shared status field.

## Do
- [ ] Centralize discount/pricing math as this rule set grows past what fits in `ProductCard`.
- [ ] Treat every listing's moderation state as one enum-like status field.

## Don't (verify avoided)
- [ ] Avoided: Don't let two screens compute "is this listing discounted" differently.
- [ ] Avoided: Don't allow a bid to be placed without server-side validation of the increment/expiry.

## Common Mistakes to Re-check
- [ ] Not repeating: Computing discounted price with float rounding that doesn't match the `Math.round(... / 100) * 100` convention already used in `ProductCard`, producing off-by-a-few-hundred-dinar mismatches between screens.
- [ ] Not repeating: Letting an auction's `timeLeft` go negative in the UI instead of transitioning the listing to a closed state.
