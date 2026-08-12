# Jyotish Vimarsha v11 — GitHub → Vercel

This version is designed so you can upload the repository to GitHub and deploy it directly to Vercel. No Node server needs to be kept running. Vercel hosts the static app and serverless `/api/*` functions.

## 1. Create Supabase database

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Copy the project URL and **service role key** into Vercel environment variables. Never expose the service role key to the browser.

## 2. Push to GitHub

Upload the contents of this folder to a new GitHub repository. Do not upload `.env` or real secrets. `.gitignore` already excludes them.

## 3. Import into Vercel

Vercel → Add New → Project → Import your GitHub repository.

No build command is required for the static frontend/API setup.

## 4. Add Vercel environment variables

Required:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `GEMINI_API_KEY`
- `GEMINI_PRIMARY_MODEL`
- `GEMINI_FALLBACK_MODEL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Use long random values for `ADMIN_SESSION_SECRET` and change the admin password before launch.

## 5. Razorpay

Use Test Mode first. Configure the webhook URL after deployment:

`https://YOUR-DOMAIN.vercel.app/api/razorpay/webhook`

Set the same webhook secret in Vercel as `RAZORPAY_WEBHOOK_SECRET`.

When testing is complete, replace the Razorpay test credentials with Live credentials.

## 6. Verify deployment

Open:

`https://YOUR-DOMAIN.vercel.app/api/health`

It should return JSON with `ok: true`.

Then test:

- Private → Administration
- VIP code creation/disable
- Feedback
- Admin pricing and feature switches
- ₹59 individual checkout
- Free Guna Milan
- ₹99 detailed matching
- ₹29 question checkout
- 5-question limit
- Razorpay cancellation/failure
- Razorpay webhook

## 7. Important security changes in v11

- Gemini API key is server-side; the previous browser-embedded key is removed.
- Razorpay Key Secret is server-side.
- Supabase service-role key is server-side.
- Admin sessions are signed and stateless, so they work across Vercel serverless invocations.
- VIP consumption is transactional through a Supabase database function.
- Payment verification is bound to a server-created payment session.

## 8. Automatic deployments

After the first Vercel deployment, every push to the production Git branch triggers a new deployment automatically.
