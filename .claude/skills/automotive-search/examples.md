# Automotive Search — Examples

## Worked Example
```jsx
// Reusing the existing comparison toggle/cap pattern (App.jsx)
const handleCompare = (product) => {
  const pid = String(product.id);
  setCompareList(prev => {
    if (prev.some(p => String(p.id) === pid)) return prev.filter(p => String(p.id) !== pid);
    if (prev.length >= 3) return prev;
    return [...prev, product];
  });
};
```

## Prompt Templates
- "Add a free-text search box to ShopScreen that debounces input and queries Supabase's product name column with ilike."

## Applying This Skill
1. Re-read the **Scope** and **Responsibilities** in `SKILL.md` for the files this touches.
2. Check `docs/AUDIT.md` for any known issue already logged in this area.
3. Follow the **Workflow** section step by step.
4. Verify against `checklists.md` before opening a PR.
