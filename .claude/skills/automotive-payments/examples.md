# Automotive Payments — Examples

## Worked Example
```js
// Refresh the badge from the server after any cart mutation, don't do local math
const { count } = await supabase.from("cart_items").select("id", { count: "exact", head: true }).eq("user_id", uid);
setCartBadgeCount(count || 0);
```

## Prompt Templates
- "Wire PaymentsScreen's 'add payment method' UI to a real Supabase table, keeping it clearly scoped to metadata only (no raw card numbers)."

## Applying This Skill
1. Re-read the **Scope** and **Responsibilities** in `SKILL.md` for the files this touches.
2. Check `docs/AUDIT.md` for any known issue already logged in this area.
3. Follow the **Workflow** section step by step.
4. Verify against `checklists.md` before opening a PR.
