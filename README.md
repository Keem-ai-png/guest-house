# KEEM Guesthouse — Vercel edition

A bilingual (English/German), responsive guesthouse website with a Supabase-powered room catalogue and owner dashboard, separate page-style navigation, and Paystack full-payment checkout.

## Main files
- `index.html`, `style.css`, `script.js` — public site and page navigation.
- `rooms.js` — reads available room listings from Supabase.
- `booking.js` — booking form, nightly calculation and secure checkout redirect.
- `api/paystack/initialize.js` — Vercel serverless endpoint that calculates the full amount on the server and initializes Paystack.
- `api/paystack/verify.js` — verifies successful Paystack transactions and records reservations.
- `payment-result.html` — payment verification result.
- `admin.html`, `admin.js`, `admin.css` — password-protected owner dashboard.
- `payment-bookings-schema.sql` — paid-reservation database table and owner-only RLS policies.
- `supabase-schema.sql` — room catalogue, owner access and photo storage setup.
- `vercel.json` — Vercel routing, including `/admin`.

## Deploy to Vercel
1. Push the contents of this folder to a GitHub repository.
2. In Vercel choose **Add New → Project**, import the repository.
3. Framework preset: **Other**. Leave Build Command and Output Directory empty/default; the website is static HTML and Vercel automatically deploys the `api/` functions.
4. Add the environment variables listed in `PAYMENT_SETUP_VERCEL.md`.
5. Deploy, then add the Vercel production URL to Supabase Authentication → URL Configuration → Redirect URLs.
6. Open `/admin` to sign in as the owner.

## Important
- Run `payment-bookings-schema.sql` in Supabase before enabling checkout.
- Use Paystack test keys and complete a test transaction before switching to live mode.
- The public Supabase publishable key is safe for browser use when RLS is configured. Never put the Supabase service-role key or Paystack secret key in frontend files or GitHub.
- Real room prices, photos, room capacity and facilities must be confirmed by the owner before live payment is enabled.
- Checkout collects full payment for the complete stay in GHS. Paystack hosted checkout handles card details; the KEEM website does not collect or store card numbers.
- A successful payment is recorded as `pending_owner_confirmation`. The owner must confirm room allocation. A conflicting paid reservation is flagged for manual review. This prototype does not automatically refund payments.
- International cards are subject to Paystack merchant eligibility and activation.
