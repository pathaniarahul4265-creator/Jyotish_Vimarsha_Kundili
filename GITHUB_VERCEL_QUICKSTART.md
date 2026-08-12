# 5-minute GitHub → Vercel deployment

1. Create a new GitHub repository.
2. Upload every file in this folder, preserving `api/` and `supabase/` directories.
3. In Supabase, create a project and run `supabase/schema.sql` in SQL Editor.
4. In Vercel, import the GitHub repository.
5. Add these Environment Variables in Vercel for **Production, Preview, and Development** as appropriate:

```
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
GEMINI_API_KEY
GEMINI_PRIMARY_MODEL
GEMINI_FALLBACK_MODEL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Use the exact variable name `GEMINI_FALLBACK_MODEL` (the lowercase `g` above is only a visual typo; do not copy it).

6. Deploy.
7. Open `https://YOUR-DOMAIN/api/health` and confirm `{"ok":true,...}`.
8. Configure Razorpay webhook to `https://YOUR-DOMAIN/api/razorpay/webhook` and set the same webhook secret in Vercel.
9. Test the complete payment/admin/VIP flows in Razorpay Test Mode.
10. Replace Test credentials with Live credentials only after all tests pass.

After that, normal GitHub pushes automatically trigger Vercel deployments.
