# Marketplace Rules — Examples

## Worked Example
```js
// Shared discount rule (extract from ProductCard, reuse everywhere)
export function computeDiscountedPrice(price, discountPercent, discountEndsAt) {
  const active = discountPercent > 0 && (!discountEndsAt || new Date(discountEndsAt) > new Date());
  if (!active) return null;
  return Math.round((price * (1 - discountPercent / 100)) / 100) * 100;
}
```

## Prompt Templates
- "Extract ProductCard's discount computation into utils/pricing.js and reuse it from AuctionsScreen for any auctioned-item discounts."
- "Add server-side validation (RLS + constraint) ensuring a new bid always exceeds currentBid by at least minBid."

## Applying This Skill
1. Re-read the **Scope** and **Responsibilities** in `SKILL.md` for the files this touches.
2. Check `docs/AUDIT.md` for any known issue already logged in this area.
3. Follow the **Workflow** section step by step.
4. Verify against `checklists.md` before opening a PR.
