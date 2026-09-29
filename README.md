# CampConnect

A mobile app for organising group hikes and camping trips: create a hike, invite
people, and sort out who drives whom and who brings what, all in one place
instead of a chaotic group chat.

## The idea

Group trips break down on logistics, not on the trail. Somebody has to track who
is coming, which cars have free seats, and whether anyone remembered the stove.
CampConnect gives every hike its own hub:

- **Overview** — date, time, location, distance, elevation gain, difficulty and estimated duration
- **Participants** — who has joined
- **Carpool** — who drives and who needs a seat
- **Provisions** — a shared list of consumables (food, water) and tools (stove,
  tent) so nothing gets forgotten or doubled

## Current state

Prototype (Feb–Jun 2025), built with Expo / React Native and Firebase.

- Email sign-up and login (Firebase Auth), hikes stored in Firestore
- Create a hike with its full trail details and carpool needs
- Explore and join hikes, see your upcoming and completed hikes on the home tab
- Per-hike view with Overview / Participants / Carpool / Provisions tabs
- Map tab, profile screen, Android build

**Known issues:** the app mixes the web `firebase` SDK with `@react-native-firebase`,
and the two conflict at runtime. Login is fragile, and parts of the state still live
in AsyncStorage instead of the database. Development paused here.

## Ideal state

A rebuild (working title **TrailMates**) as a mobile-first **PWA**
(Vite + React + TypeScript + Tailwind, Supabase for auth / Postgres / realtime,
Leaflet + OpenStreetMap for maps):

- **V1:** accounts, create/join hikes, and a live trip hub with carpool car blocks
  and shared provisions/tools pools that update in realtime for everyone
- **Later:** a grid-style inventory for packing car cargo, photo/media sharing after
  the trip, and integrations with Strava / AllTrails, plus Telegram for inviting a
  whole group chat into a hike in one step

## Running it

```bash
npm install
cp .env.example .env        # fill in your own Firebase web-app config
# Android: put your own google-services.json in android/app/ (never committed)
npx expo run:android        # or: npx expo start
```

## Tech

Expo (React Native) · Expo Router · TypeScript · Firebase Auth + Firestore · AsyncStorage
