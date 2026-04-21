# Google OAuth setup

One-time dashboard configuration for "Continue with Google" sign-in. No env vars needed — credentials live in Supabase.

## 1. Google Cloud Console

1. Visit <https://console.cloud.google.com/apis/credentials> for the project you want to use.
2. **Create Credentials → OAuth client ID** → Application type: **Web application**.
3. **Authorized JavaScript origins**
   - `http://localhost:3000`
   - `https://<your-production-domain>`
4. **Authorized redirect URIs** — use the URL Supabase shows under Authentication → Providers → Google. It looks like:
   - `https://<project-ref>.supabase.co/auth/v1/callback`
   Do **not** put the app's own `/auth/callback` here. Google redirects to Supabase; Supabase then redirects back to our app.
5. **OAuth consent screen**
   - App name: `PartnerLink`
   - User support email / developer contact: a real inbox you own
   - Authorized domains: your production domain
   - Scopes: default (`openid`, `email`, `profile`) is enough
6. Copy the **Client ID** and **Client Secret** that Google generates.

## 2. Supabase dashboard

1. **Authentication → Providers → Google** → toggle on → paste the Client ID and Client Secret from step 1.6 → Save.
2. **Authentication → URL Configuration**
   - **Site URL**: your production origin
   - **Redirect URLs**: add both
     - `http://localhost:3000/auth/callback`
     - `https://<your-production-domain>/auth/callback`
3. **Authentication → Sign In / Providers** (or Policies tab)
   - Ensure **"Link identities with verified emails"** is **enabled** (sometimes shown as `manual_linking_enabled = false`, which means auto-linking is on). This lets an existing email/password user sign in with Google using the same address and stay on the same `auth.users` row.
   - Google always returns `email_verified: true`, so this is safe — identities only link when the OAuth provider has verified the email.

## 3. Verify

1. `npm run dev`
2. Sign out. Click **使用 Google 登入** on `/login`.
3. After approving Google's consent screen, you land back on the app.
   - Approved user → role home (`/kol/home` or `/merchant/home`).
   - Pending user → `/pending-approval` or `/merchant-pending-approval`.
   - Brand-new OAuth user → `/signup/complete` to pick role + fill application.
4. Collision test: create an email/password account with your Gmail address first, complete the application, get admin approval. Sign out. Sign in with Google using that same Gmail → session resumes as the existing user (verify in SQL: one row in `auth.users` with two identities — `email` and `google`).
