# Supabase Setup Guide

Follow these steps to provision Supabase for AI Flip Cards.

## 1. Create a Supabase Project

1. Sign in at [app.supabase.com](https://app.supabase.com) and create a new project.
2. Choose a strong database password and keep it safe.
3. Once the project is ready, note the following values from Settings ? API:
   - Project URL ? use as `VITE_SUPABASE_URL`
   - Public anon key ? use as `VITE_SUPABASE_ANON_KEY`

## 2. Create Tables & Policies

1. Open the Supabase SQL editor.
2. Copy the contents of [`supabase/schema.sql`](../supabase/schema.sql) into the editor.
3. Run the script to create the `decks`, `cards`, and optional `profiles` tables with row-level security policies.
4. Verify that RLS is enabled on each table and the policies appear under the Table editor.

## 3. Enable Authentication Providers

1. Navigate to Authentication ? Providers.
2. Enable Email/Password (default).
3. Enable **Google** OAuth and supply the client ID/secret from the Google Cloud console.
4. Under Settings ? Auth, add your local and production URLs to **Redirect URLs** (e.g., `http://localhost:5173`, `https://your-vercel-app.vercel.app`) and customise email templates if required.

## 4. Configure Environment Variables

1. Update `.env.local` in the project root:

   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   VITE_SUPABASE_GOOGLE_ENABLED=true
   ```

   Keep `GEMINI_API_KEY` if you still rely on the Gemini API; otherwise remove it.

2. Restart `npm run dev` so Vite picks up the new env vars.
3. In Supabase, create your first account via the app UI (register form) to confirm auth works.

## 5. Deploy Credentials

1. In Vercel, open your project ? Settings ? Environment Variables.
2. Add the same entries (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, plus `GEMINI_API_KEY` if needed) for the preview/production environments.
3. Redeploy so the frontend uses the Supabase credentials.

## 6. Test OAuth Redirects

1. From your deployed app, start a Google sign-in flow.
2. After authentication, verify you land back on your app and can create decks/cards.
3. Check Supabase Auth logs to ensure the provider connection is succeeding.

## 7. Optional Profile Sync

If you plan to use the `profiles` table:

1. After sign-up, insert a row for the new user via Edge Function/API or client-side call.
2. Extend the Zustand store to load/save profile data.
3. Display profile information (display name, avatar) in the app header.

Once these steps are complete, your Supabase backend is ready for Stage 2 development and deployment.
