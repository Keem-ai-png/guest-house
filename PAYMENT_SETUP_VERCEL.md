# KEEM Guesthouse — Vercel + Paystack setup

## 1. Database setup
1. Open Supabase → SQL Editor.
2. Run `payment-bookings-schema.sql` once.
3. Confirm that the `bookings` table exists and the owner is present in `room_admins`.
4. Confirm the owner can sign in at `/admin` after deployment.

## 2. Vercel environment variables
In Vercel → Project → Settings → Environment Variables, add these variables. Select **Preview** while testing; later add them to **Production** when ready.

| Name | Value |
|---|---|
| `PAYSTACK_SECRET_KEY` | Your rotated Paystack **test** secret key (`sk_test_…`) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-side only) |
| `SITE_URL` | Your Vercel deployment URL, e.g. `https://your-project.vercel.app` |

Do not send either secret key in chat. Do not put either secret in `supabase-config.js`, HTML, JavaScript served to browsers, or GitHub. Never use a Supabase service-role key in the browser.

After saving environment variables, redeploy the project so the functions receive them.

## 3. Paystack test mode
1. In Paystack Dashboard open Settings → API Keys & Webhooks and use the test secret key.
2. In Paystack settings, ensure the required payment channels are available for your merchant account.
3. The guest selects a room, arrival/departure dates and guest count.
4. The Vercel function fetches the room price from Supabase, calculates 100% of the stay cost and initializes hosted Paystack checkout in GHS.
5. Paystack returns the guest to `payment-result.html`; the Vercel verification function checks the transaction directly with Paystack and inserts the reservation.
6. The owner signs in at `/admin` and reviews the Paid reservations panel.

Use Paystack's official test cards and test procedures from the Paystack dashboard/documentation. Do not use real customer card details in test mode.

## 4. Going live
Only after successful test transactions:
- Complete Paystack merchant/business verification and confirm that international cards are enabled if guests will pay using cards issued in Germany.
- Confirm official room rates and room inventory with the owner.
- Add the rotated **live** Paystack secret key to Vercel Production environment variables only.
- Redeploy Production and test a small legitimate payment with the owner's approval.

## Booking status and limitations
- A verified payment creates a reservation with status `pending_owner_confirmation`.
- If an overlapping paid reservation appears during verification, the new booking is marked `paid_conflict_review` so the owner can contact the guest and resolve it.
- The owner can confirm or cancel a booking in the dashboard. Cancelling in this dashboard does **not** issue an automatic refund; any refund must be processed separately in Paystack.
- Availability is based on one room listing per room record. If the property has multiple identical rooms, create separate room records or implement inventory/quantity management before accepting concurrent reservations.
- Card acceptance and foreign-issued cards depend on Paystack account eligibility, verification and channel activation.
