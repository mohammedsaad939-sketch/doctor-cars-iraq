# Automotive Admin — Examples

## Worked Example
```sql
-- Admin-only update, enforced in Postgres regardless of client UI
create policy "admins can moderate listings"
on public.products for update
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
```

## Prompt Templates
- "Add a 'reject listing' admin action to AdminScreen, including the RLS policy restricting it to is_admin users and a moderation_log insert."

## Applying This Skill
1. Re-read the **Scope** and **Responsibilities** in `SKILL.md` for the files this touches.
2. Check `docs/AUDIT.md` for any known issue already logged in this area.
3. Follow the **Workflow** section step by step.
4. Verify against `checklists.md` before opening a PR.
