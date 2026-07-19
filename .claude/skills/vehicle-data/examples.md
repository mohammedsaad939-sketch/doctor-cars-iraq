# Vehicle Data — Examples

## Worked Example
```js
// Mapping a raw Supabase row to the shape ProductCard expects (pattern from AdCarousel)
const product = {
  ...data,
  image: Array.isArray(data.images) ? (data.images[0] || "📦") : (data.images || "📦"),
  category: data.categories?.name || "",
  oldPrice: data.old_price || null,
  rating: data.rating || 0,
  reviews: 0,
};
```

## Prompt Templates
- "Migrate ScreenX off MOCK.products onto a live Supabase query, following the mapping pattern used in AdCarousel."
- "Add a `vin` column to the vehicle-schema doc and validate it client-side using the vin-validation knowledge doc before insert."

## Applying This Skill
1. Re-read the **Scope** and **Responsibilities** in `SKILL.md` for the files this touches.
2. Check `docs/AUDIT.md` for any known issue already logged in this area.
3. Follow the **Workflow** section step by step.
4. Verify against `checklists.md` before opening a PR.
