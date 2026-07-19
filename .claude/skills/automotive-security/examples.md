# Automotive Security — Examples

## Worked Example
```js
// Reference pattern already in App.jsx#handleCartAdd — reuse this shape everywhere
const { error: insertError } = await supabase.from("cart_items").insert({ user_id: uid, product_id: pid, quantity: 1 });
if (insertError) {
  const isUniqueViolation = insertError.code === "23505" || (insertError.message || "").includes("duplicate");
  if (!isUniqueViolation) { /* surface error, return */ }
  // fall through to the update-quantity path
}
```

## Prompt Templates
- "Review this diff against the six patterns in .github/copilot-instructions.md and flag any violation."
- "Write the RLS policy and matching GRANT for a new `bids` table scoped to authenticated users inserting their own bids only."

## Applying This Skill
1. Re-read the **Scope** and **Responsibilities** in `SKILL.md` for the files this touches.
2. Check `docs/AUDIT.md` for any known issue already logged in this area.
3. Follow the **Workflow** section step by step.
4. Verify against `checklists.md` before opening a PR.
