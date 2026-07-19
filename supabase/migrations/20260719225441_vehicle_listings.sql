-- Vehicle Management module — schema.
--
-- Deliberately a NEW table (`vehicle_listings`), not a reuse of the existing
-- `vehicles` table (see GarageScreen.jsx / .claude/knowledge/vehicle-schema.md):
-- `vehicles` is a user's personal owned-vehicle/service-history record
-- (brand/model/plate_number/chassis_number/maintenance history), a different
-- concern from a dealer/user for-sale *listing* with price, VIN, status
-- lifecycle, and moderation. Mixing the two under one table would corrupt an
-- already-working feature. See docs/VEHICLE_MANAGEMENT.md.
--
-- Written to be additive and idempotent (IF NOT EXISTS / DROP ... IF EXISTS),
-- consistent with the Authentication module's migration in this same folder.

-- ── Table ────────────────────────────────────────────────────────────────

create table if not exists public.vehicle_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid references public.sellers(id) on delete set null,

  brand text not null,
  model text not null,
  trim text,
  year int not null,
  vin text,

  engine text,
  engine_size text,
  horsepower int,
  transmission text,
  fuel_type text,
  drive_type text,
  exterior_color text,
  interior_color text,
  mileage int,
  condition text,

  price numeric not null,
  negotiable boolean not null default false,
  currency text not null default 'IQD',

  governorate text not null,
  city text not null,
  gps_lat double precision,
  gps_lng double precision,

  description text,
  features text[] not null default '{}',
  images text[] not null default '{}',
  thumbnails text[] not null default '{}',
  video_url text,
  documents text[] not null default '{}',

  -- Single status enum, not overlapping booleans -- see
  -- .claude/knowledge/vehicle-status.md and utils/vehicleStatus.js, which is
  -- the client-side mirror of this constraint (requestStatusTransition()
  -- rejects anything this check wouldn't accept).
  status text not null default 'draft'
    check (status in ('draft', 'published', 'unpublished', 'reserved', 'sold', 'archived')),

  -- Set by useVehicleListings.js#changeStatus when a Verified-Dealer-or-above
  -- account publishes -- the concrete effect of the "Verified Dealer:
  -- priority publishing" permission tier (sorts first in the public feed).
  priority boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint vehicle_listings_price_positive check (price > 0),
  constraint vehicle_listings_year_reasonable check (year between 1950 and 2100)
);

comment on table public.vehicle_listings is
  'Dealer/user for-sale vehicle listings. Distinct from public.vehicles (personal owned-vehicle/service-history records).';

-- One VIN per listing across the marketplace (nulls allowed and not counted
-- as duplicates of each other) -- the authoritative version of the duplicate-
-- VIN check useVehicleListings.js#checkDuplicateVin does client-side first.
create unique index if not exists vehicle_listings_vin_unique_idx
  on public.vehicle_listings (vin) where vin is not null;

create index if not exists vehicle_listings_owner_idx on public.vehicle_listings (owner_id);
create index if not exists vehicle_listings_public_feed_idx
  on public.vehicle_listings (status, priority desc, created_at desc);
create index if not exists vehicle_listings_governorate_idx on public.vehicle_listings (governorate);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_vehicle_listings_updated_at on public.vehicle_listings;
create trigger trg_vehicle_listings_updated_at
  before update on public.vehicle_listings
  for each row execute function public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────
-- Permission matrix (see docs/VEHICLE_MANAGEMENT.md):
--   Guest            -> read published/reserved listings only
--   User             -> read/write own listings only
--   Dealer           -> same as User (role label, not a wider DB permission)
--   Verified Dealer  -> same row-level access as Dealer; priority is a
--                       listing attribute, not a wider permission
--   Admin            -> full read/write on all listings
--   Super Admin      -> same as Admin at the row level (the distinction
--                       versus Admin lives in utils/roles.js for
--                       account-privilege actions, not vehicle listings)

alter table public.vehicle_listings enable row level security;

drop policy if exists "vehicle_listings_select_public_or_own_or_admin" on public.vehicle_listings;
create policy "vehicle_listings_select_public_or_own_or_admin" on public.vehicle_listings
  for select
  using (
    status in ('published', 'reserved')
    or owner_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and (p.is_admin or p.is_super_admin))
  );

drop policy if exists "vehicle_listings_insert_own" on public.vehicle_listings;
create policy "vehicle_listings_insert_own" on public.vehicle_listings
  for insert
  with check (owner_id = auth.uid());

drop policy if exists "vehicle_listings_update_own_or_admin" on public.vehicle_listings;
create policy "vehicle_listings_update_own_or_admin" on public.vehicle_listings
  for update
  using (
    owner_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and (p.is_admin or p.is_super_admin))
  )
  with check (
    owner_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and (p.is_admin or p.is_super_admin))
  );

drop policy if exists "vehicle_listings_delete_own_or_admin" on public.vehicle_listings;
create policy "vehicle_listings_delete_own_or_admin" on public.vehicle_listings
  for delete
  using (
    owner_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and (p.is_admin or p.is_super_admin))
  );

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.vehicle_listings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vehicle_listings TO authenticated;

-- ── Storage bucket for listing photos/video/documents ───────────────────────
-- Public read (listing media is meant to be publicly viewable once
-- published); writes restricted to the uploader's own folder, matching the
-- avatars bucket's convention in the Authentication module's migration.

insert into storage.buckets (id, name, public)
values ('vehicle-listings', 'vehicle-listings', true)
on conflict (id) do nothing;

drop policy if exists "vehicle_listings_media_public_read" on storage.objects;
create policy "vehicle_listings_media_public_read" on storage.objects
  for select using (bucket_id = 'vehicle-listings');

drop policy if exists "vehicle_listings_media_owner_insert" on storage.objects;
create policy "vehicle_listings_media_owner_insert" on storage.objects
  for insert
  with check (bucket_id = 'vehicle-listings' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "vehicle_listings_media_owner_update" on storage.objects;
create policy "vehicle_listings_media_owner_update" on storage.objects
  for update
  using (bucket_id = 'vehicle-listings' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'vehicle-listings' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "vehicle_listings_media_owner_delete" on storage.objects;
create policy "vehicle_listings_media_owner_delete" on storage.objects
  for delete
  using (bucket_id = 'vehicle-listings' and (storage.foldername(name))[1] = auth.uid()::text);

GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
