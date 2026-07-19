# Dealership Management — Examples

## Worked Example
```jsx
// Keep public storefront queries narrow and explicit
const { data: seller } = await supabase
  .from("sellers")
  .select("id, name, logo, city, verified, rating, sales, products, since")
  .eq("id", sellerId)
  .single();
// never: .select("*") on a buyer-facing screen
```

## Prompt Templates
- "Split SellerDashScreen.jsx's inventory section into its own component with colocated data fetching, without changing behavior."
- "Review SellerPublicScreen.jsx's Supabase select() and confirm it only returns fields safe for public/buyer viewing."

## Applying This Skill
1. Re-read the **Scope** and **Responsibilities** in `SKILL.md` for the files this touches.
2. Check `docs/AUDIT.md` for any known issue already logged in this area.
3. Follow the **Workflow** section step by step.
4. Verify against `checklists.md` before opening a PR.
