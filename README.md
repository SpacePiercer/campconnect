# TrailMates 🏕️

Mobile-first PWA for organizing group hikes and camping trips. Every trip gets a shared **Hub** answering: who's coming, who drives whom, and who brings what.

**Stack:** Vite + React + TypeScript · Tailwind CSS · Supabase (auth, Postgres, Realtime) · Leaflet/OpenStreetMap.

## Setup

1. Create a [Supabase](https://supabase.com) project (free tier).
2. In the SQL Editor, run the entire contents of `supabase/migration.sql` once.
3. Recommended: Authentication → Sign In / Providers → Email → turn **off** "Confirm email".
4. Copy `.env.example` to `.env` and fill in your project URL and anon key (Project Settings → API).
5. `npm install`, then `npm run dev`.

## Tests

`bash tests/db-smoke.sh` — 15 spec-driven checks (capacity limits, RLS, cascades) run against the live database via REST. Requires the `.env` to point at a project with the migration applied; creates and cleans up its own test data.

## Deploy (Netlify or Vercel free tier)

Build command `npm run build`, output directory `dist`. SPA rewrites are already configured (`public/_redirects` for Netlify, `vercel.json` for Vercel).

Set the two environment variables in the site settings — `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — then deploy. Open the site on a phone and use "Add to Home Screen" to install it as an app.
