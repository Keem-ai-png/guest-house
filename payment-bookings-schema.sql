-- Run once in Supabase SQL Editor before enabling checkout.
create table if not exists public.bookings (
 id uuid primary key default gen_random_uuid(),
 room_id uuid not null references public.rooms(id) on delete restrict,
 room_name text not null,
 customer_name text not null,
 customer_email text not null,
 arrival date not null,
 departure date not null,
 guests integer not null check (guests between 1 and 30),
 nights integer not null check (nights between 1 and 60),
 amount_ghs numeric(12,2) not null check (amount_ghs > 0),
 currency text not null default 'GHS' check (currency='GHS'),
 payment_reference text not null unique,
 status text not null default 'pending_owner_confirmation'
   check (status in ('pending_owner_confirmation','confirmed','cancelled','paid_conflict_review')),
 special_requests text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (departure > arrival)
);
alter table public.bookings enable row level security;
drop policy if exists "Owners can view bookings" on public.bookings;
create policy "Owners can view bookings" on public.bookings for select to authenticated
using (exists(select 1 from public.room_admins a where a.user_id=auth.uid()));
drop policy if exists "Owners can update bookings" on public.bookings;
create policy "Owners can update bookings" on public.bookings for update to authenticated
using (exists(select 1 from public.room_admins a where a.user_id=auth.uid()))
with check (exists(select 1 from public.room_admins a where a.user_id=auth.uid()));
create index if not exists bookings_room_dates_idx on public.bookings(room_id,arrival,departure);
create index if not exists bookings_status_idx on public.bookings(status);
