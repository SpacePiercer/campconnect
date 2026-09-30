# CampConnect 🏕️

Mobile-first PWA for organizing group hikes and camping trips. Every trip gets a shared **Hub** answering: who's coming, who drives whom, and who brings what.

**Stack:** Vite + React + TypeScript · Tailwind CSS · Supabase (auth, Postgres, Realtime) · Leaflet/OpenStreetMap.

## The idea

Group trips break down on logistics, not on the trail. Somebody has to track who is
coming, which cars have free seats, and whether anyone remembered the stove, usually
across a messy group chat. CampConnect gives every trip one live hub instead.

## Current state

V1 is feature-complete (July 2026):

- Email auth and profiles
- Create a hike with a map pin, explore and join/leave hikes, "my hikes"
- **Hub** per hike: overview, people tab with carpool (drivers offer seats, riders claim them), realtime updates
- **Gear** tab: shared provisions (consumables) and tools pools, plus loading gear into cars
- Installable PWA with manifest and icons, deploy configs for Netlify and Vercel
- Row-level security on every table, covered by a 15-check database smoke test

History: the first attempt (2025, Expo / React Native + Firebase) is kept in this
repo's git history. It stalled on a conflict between the web and native Firebase SDKs,
which led to this rebuild as a PWA on Supabase.

## Ideal state

- **Grid inventory for car cargo:** every item has a footprint and every trunk a
  size-limited grid; you pack items Tetris/Tarkov-style, and the grid itself is the capacity check
- **Integrations:** Telegram (invite a whole group chat into a hike and pre-assign
  roles such as driver), AllTrails (pull route, length and difficulty), Strava (link or
  auto-complete a hike from a recorded activity)
- Photo and media sharing after the trip, plus a distinctive sticker/reaction mechanic


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
