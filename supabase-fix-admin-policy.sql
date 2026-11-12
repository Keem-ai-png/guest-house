-- Run this once in Supabase SQL Editor if you already ran the original schema.
-- It allows a signed-in owner to read only their own admin-membership row,
-- which is needed by the room table's admin-only RLS policies.
alter table public.room_admins enable row level security;
drop policy if exists "Admins can view their own membership" on public.room_admins;
create policy "Admins can view their own membership" on public.room_admins
for select to authenticated
using (user_id = auth.uid());
