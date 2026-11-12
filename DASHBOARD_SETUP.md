# KEEM Guesthouse owner dashboard — Vercel + Supabase

## Architecture
- Vercel hosts the static website, `/admin` dashboard and serverless Paystack API functions.
- Supabase Auth handles owner sign-in.
- Supabase PostgreSQL stores room details, prices, features, availability and verified reservations.
- Supabase Storage stores room photographs.
- Row Level Security (RLS) restricts owner operations to approved owner accounts.

## Supabase setup
1. In Supabase Project Settings → API, use the project URL and publishable key in `supabase-config.js`.
2. Run `supabase-schema.sql` for room management and owner access.
3. Create the owner in Authentication → Users and add the owner's UUID to `public.room_admins` using the SQL instructions in `supabase-schema.sql`.
4. Run `payment-bookings-schema.sql` to enable the paid-reservations table.
5. In Authentication → URL Configuration, add your Vercel domain and local development URL to allowed redirect URLs.

## Vercel deployment
1. Push the contents of this folder to GitHub.
2. Import the repository in Vercel. Choose Framework Preset **Other**.
3. Leave the build command empty and deploy the project root.
4. Configure environment variables using `PAYMENT_SETUP_VERCEL.md`.
5. Open `https://YOUR-VERCEL-DOMAIN/admin` and sign in with the owner account.

## Security and operations
- The Supabase publishable key is designed for browser use, but RLS policies must remain enabled.
- Never expose the Supabase service-role key or Paystack secret key in frontend files or GitHub.
- The Vercel API calculates the stay amount from the Supabase room price and verifies payment server-side.
- Paid bookings are initially `pending_owner_confirmation`; the owner must confirm room allocation.
- Dashboard cancellation does not automatically refund a payment.
- Confirm all room prices, descriptions, capacities, facilities and actual photographs with the owner before accepting live payments.
