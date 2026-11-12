-- Run this in Supabase Dashboard > SQL Editor.
-- 1) Create the rooms table.
create table if not exists public.rooms (
  id uuid primary key,
  name text not null check (char_length(name) between 1 and 90),
  category text not null check (char_length(category) between 1 and 60),
  description text not null check (char_length(description) between 1 and 1200),
  price_eur numeric(10,2) not null check (price_eur >= 0),
  price_ghs numeric(12,2) not null check (price_ghs >= 0),
  max_guests integer not null default 2 check (max_guests between 1 and 30),
  bed_type text not null default 'To be confirmed',
  bed_count integer not null default 1 check (bed_count between 1 and 20),
  bathroom_type text not null default 'To be confirmed',
  bathroom_features text[] not null default '{}',
  amenities text[] not null default '{}',
  features text[] not null default '{}',
  photos text[] not null default '{}',
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.rooms add column if not exists max_guests integer not null default 2;
alter table public.rooms add column if not exists bed_type text not null default 'To be confirmed';
alter table public.rooms add column if not exists bed_count integer not null default 1;
alter table public.rooms add column if not exists bathroom_type text not null default 'To be confirmed';
alter table public.rooms add column if not exists bathroom_features text[] not null default '{}';
alter table public.rooms add column if not exists amenities text[] not null default '{}';
alter table public.rooms enable row level security;

-- Only authenticated users listed in this table are administrators.
create table if not exists public.room_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.room_admins enable row level security;

-- Authenticated owners can read only their own admin-membership row.
-- This is required because room-management policies check room_admins under RLS.
drop policy if exists "Admins can view their own membership" on public.room_admins;
create policy "Admins can view their own membership" on public.room_admins
for select to authenticated
using (user_id = auth.uid());

-- Public visitors may read available rooms only.
drop policy if exists "Public can view available rooms" on public.rooms;
create policy "Public can view available rooms" on public.rooms
for select using (available = true);

-- Admins may read all rooms and manage room records.
drop policy if exists "Admins can read all rooms" on public.rooms;
create policy "Admins can read all rooms" on public.rooms
for select to authenticated
using (exists (select 1 from public.room_admins a where a.user_id = auth.uid()));

drop policy if exists "Admins can insert rooms" on public.rooms;
create policy "Admins can insert rooms" on public.rooms
for insert to authenticated
with check (exists (select 1 from public.room_admins a where a.user_id = auth.uid()));

drop policy if exists "Admins can update rooms" on public.rooms;
create policy "Admins can update rooms" on public.rooms
for update to authenticated
using (exists (select 1 from public.room_admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.room_admins a where a.user_id = auth.uid()));

drop policy if exists "Admins can delete rooms" on public.rooms;
create policy "Admins can delete rooms" on public.rooms
for delete to authenticated
using (exists (select 1 from public.room_admins a where a.user_id = auth.uid()));

-- Create a Storage bucket named room-photos (public read, admin upload/update/delete).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('room-photos','room-photos',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "Public can view room photos" on storage.objects;
create policy "Public can view room photos" on storage.objects
for select using (bucket_id = 'room-photos');

drop policy if exists "Admins can upload room photos" on storage.objects;
create policy "Admins can upload room photos" on storage.objects
for insert to authenticated with check (
  bucket_id = 'room-photos' and exists (select 1 from public.room_admins a where a.user_id = auth.uid())
);
drop policy if exists "Admins can update room photos" on storage.objects;
create policy "Admins can update room photos" on storage.objects
for update to authenticated using (
  bucket_id = 'room-photos' and exists (select 1 from public.room_admins a where a.user_id = auth.uid())
);
drop policy if exists "Admins can delete room photos" on storage.objects;
create policy "Admins can delete room photos" on storage.objects
for delete to authenticated using (
  bucket_id = 'room-photos' and exists (select 1 from public.room_admins a where a.user_id = auth.uid())
);

-- After creating the owner's account in Supabase Authentication, run this:
-- Replace the UUID with that owner's actual Authentication user ID.
-- insert into public.room_admins (user_id) values ('OWNER-AUTH-USER-UUID');
