# Al Hayat Jewellery

Retail and wholesale jewellery store. Next.js (App Router), Tailwind CSS, Supabase, Cloudinary.

## What is in it

**Shop**
- Retail and wholesale prices. Wholesale is visible only to dealers the owner has approved.
- Categories, search, price filter, sort. Side menu on phones, fixed sidebar on desktop.
- Product page with photo gallery, stock, reviews and ratings, and quantity discount tiers for dealers.
- Cart and checkout. Prices, stock, minimum quantities and coupons are calculated in the database, never in the browser.
- Order is saved, then can be sent on WhatsApp with the full summary (items, prices, quantities, Retail or Wholesale).
- Guest checkout for retail. Sign in for order history and invoices.
- Invoice page with print and save as PDF.

**Dealers**
- A customer applies at `/dealer`. The owner approves in the admin panel.
- Per dealer: an extra discount percentage, and special prices on chosen products.
- Per product: wholesale price, minimum quantity (empty uses the store default), and quantity discount tiers.

**Admin (`/admin`)**
- Dashboard: sales today, 7 days, 30 days, best sellers, low stock, things waiting for approval.
- Products with photo upload (Cloudinary), stock, wholesale pricing, tiers.
- Orders with status and payment status. Cancelling returns stock.
- Categories, dealers, coupons, review approval, store settings (name, WhatsApp number, default minimum, delivery fee).

**Payments**
- Cash on delivery, bank transfer, and JazzCash / Easypaisa sent to your own wallet number. The customer pays you, types the transaction ID at checkout, and you mark the order as paid in Admin, Orders after checking your app.
- Set the numbers in Admin, Settings. An empty number hides that option.
- Automatic card or wallet checkout (customer pays on the site) needs a JazzCash or Easypaisa *merchant* account. A personal wallet cannot do that. It can be added later without changing the rest of the shop.

## Setup

1. Install and run

   ```bash
   npm install
   cp .env.example .env.local   # then fill the values
   npm run dev
   ```

2. `.env.local`

   | Variable | Where to find it |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase, Project settings, API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page. Use the publishable key (`sb_publishable_...`) |
   | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard |
   | `CLOUDINARY_API_KEY` | Cloudinary, Settings, API keys |
   | `CLOUDINARY_API_SECRET` | Same page. Never share it or prefix it with `NEXT_PUBLIC_` |

3. Make yourself the admin

   Open the site, create an account at `/signup`, confirm the email, then run this once in the Supabase SQL editor (use your own email):

   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

   An "Admin" link then appears in the top bar.

4. Supabase, Authentication, URL configuration: set **Site URL** to your live address and add `https://your-site/auth/callback` to the redirect list, so confirmation emails open the right page.

## Database

The schema is already applied to the Supabase project `Al Hayat Store`. Main tables: `profiles`, `store_settings`, `categories`, `products`, `product_wholesale`, `price_slabs`, `dealer_prices`, `reviews`, `coupons`, `orders`, `order_items`.

Functions the app calls: `quote_cart` (price a cart), `place_order_v2` (create an order safely; the older `place_order` is switched off), `preview_coupon`, `apply_for_dealer`, `set_order_status`.

Row level security is on for every table. Wholesale prices, dealer prices and coupons cannot be read by the public.

## Deploy

Push to GitHub and import the repository in Vercel, then add the five environment variables above. No other setting is needed.

## Notes

- Orders are numbered `AH-01001` upward.
- Stock is reduced when an order is placed.
- Delivery fee and free-delivery threshold are in Admin, Settings.
