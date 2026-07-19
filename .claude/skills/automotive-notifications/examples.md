# Automotive Notifications — Examples

## Worked Example
```js
const fetchUnread = () =>
  supabase.from("notifications").select("id", { count: "exact", head: true })
    .eq("user_id", uid).eq("is_read", false)
    .then(({ count }) => setUnreadNotifCount(count || 0));
```

## Prompt Templates
- "Add a new notification type `price_drop` end-to-end: schema note, icon/label map entry, and a trigger point when a followed product's price drops."

## Applying This Skill
1. Re-read the **Scope** and **Responsibilities** in `SKILL.md` for the files this touches.
2. Check `docs/AUDIT.md` for any known issue already logged in this area.
3. Follow the **Workflow** section step by step.
4. Verify against `checklists.md` before opening a PR.
