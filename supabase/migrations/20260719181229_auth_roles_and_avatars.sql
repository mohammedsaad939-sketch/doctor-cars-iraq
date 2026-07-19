-- Authentication & User Management module — schema additions.
--
-- This repository has no prior tracked migrations (schema lives in the live
-- Supabase project — see docs/AUDIT.md). Everything below is written to be
-- additive and idempotent (IF NOT EXISTS / DROP ... IF EXISTS / ON CONFLICT)
-- so it layers safely on top of whatever RLS policies already exist on
-- `profiles`, rather than assuming this is the first migration ever applied.
-- Review against the live project's actual policies before applying.
--
-- Adds:
--   1. profiles.is_super_admin, profiles.avatar_url columns
--   2. A trigger preventing privilege escalation (a user granting themself
--      admin/super-admin via a direct profiles UPDATE)
--   3. RLS + GRANT for the self-service profile update path used by
--      useProfile.js
--   4. The `avatars` Storage bucket + its RLS policies, used by
--      useProfile.js#uploadAvatar

-- ── 1. Columns ──────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists is_super_admin boolean not null default false;

alter table public.profiles
  add column if not exists avatar_url text;

comment on column public.profiles.is_super_admin is
  'Highest privilege tier. Only settable by an existing super admin or the service role — see trg_prevent_profile_privilege_escalation.';
comment on column public.profiles.avatar_url is
  'Public URL of the user''s avatar in the avatars Storage bucket, set by useProfile.js#uploadAvatar.';

-- ── 2. Privilege-escalation guard ────────────────────────────────────────────
-- profiles.role (user/seller/trader/workshop) is intentionally self-service —
-- see RoleSelectionScreen.jsx, unchanged by this migration. is_admin and
-- is_super_admin are not: a plain UPDATE-your-own-row policy (needed for
-- profile-edit/avatar-upload) must not let a user grant themselves admin
-- privileges. RLS alone can't express "these specific columns need a
-- different check than the rest of the row" without inspecting OLD vs NEW,
-- so this is enforced with a BEFORE UPDATE trigger rather than RLS.
create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- The service role (server-side/admin tooling) is always trusted.
  if auth.jwt() ->> 'role' = 'service_role' then
    return new;
  end if;

  if new.is_super_admin is distinct from old.is_super_admin then
    if not exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin
    ) then
      raise exception 'insufficient_privilege: only a super admin may change is_super_admin';
    end if;
  end if;

  if new.is_admin is distinct from old.is_admin then
    if not exists (
      select 1 from public.profiles p where p.id = auth.uid() and (p.is_admin or p.is_super_admin)
    ) then
      raise exception 'insufficient_privilege: only an admin may change is_admin';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_profile_privilege_escalation on public.profiles;
create trigger trg_prevent_profile_privilege_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_escalation();

-- ── 3. profiles RLS + GRANT ─────────────────────────────────────────────────

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin" on public.profiles
  for select
  using (
    auth.uid() = id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and (p.is_admin or p.is_super_admin))
  );

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin" on public.profiles
  for update
  using (
    auth.uid() = id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and (p.is_admin or p.is_super_admin))
  )
  with check (
    auth.uid() = id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and (p.is_admin or p.is_super_admin))
  );

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- ── 4. Avatars storage bucket ────────────────────────────────────────────────
-- Public read (avatars are non-sensitive, shown throughout the UI), writes
-- restricted to the user's own folder: useProfile.js uploads to
-- `${auth.uid()}/avatar.<ext>`, so the first path segment is the owner check.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert" on storage.objects
  for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update" on storage.objects
  for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete" on storage.objects
  for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
