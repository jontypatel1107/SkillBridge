# SkillBridge Mobile — Complete Frontend

Expo SDK 54 + TypeScript app, 48 source files, type-checks clean
(`npx tsc --noEmit`) and bundles successfully with Metro (verified with
`npx expo export`). Runs in the current Expo Go app — no SDK mismatch.
Every screen below is wired to the real backend — no placeholder UI, no mock data.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` — **use your machine's LAN IP, not `localhost`**, if testing on a
physical device via Expo Go (see "how can I find my LAN IP" from earlier —
`ipconfig` / `ifconfig` / `ip a` depending on your OS). Phone and computer
must be on the same Wi-Fi network.

```
EXPO_PUBLIC_API_URL=http://192.168.1.42:5000/api
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.42:5000
```

Make sure the backend is running (`npm run dev` in the backend folder) first.

```bash
npx expo start
```

Scan the QR with Expo Go (Android) or Camera app (iOS), or press `a`/`i` for
an emulator/simulator.

## What's included

### Auth
Login, Signup (with student/mentor role toggle), Zod-validated forms, JWT
tokens in `expo-secure-store`, auto-refresh on 401, session persistence on
relaunch (checked against `/api/auth/me`).

### Home tab
Live skill feed (`GET /api/skills`), pull-to-refresh, tap through to detail.

### Explore tab
Text search + category filter chips, live-queried against the backend as you
type/select.

### Skill detail
Full listing info, mentor card with real rating, real reviews pulled from
`/api/reviews/mentor/:id`, "Book a session" CTA.

### Booking flow
Mode selector (online/offline), native date + time pickers
(`@react-native-community/datetimepicker`), creates a real booking via
`POST /api/bookings`, success screen, then shows up immediately in Bookings.

### Bookings tab
Status-filterable list (all/pending/confirmed/completed), detail screen with
role-aware actions — mentors see Confirm/Complete, either side can Cancel,
learners see "Leave a review" once a session is completed. All actions call
the real `PATCH /api/bookings/:id/status` and respect the backend's status
machine (illegal transitions surface the server's error message).

### Reviews
Star rating + comment, submitted via `POST /api/reviews`, only reachable from
a completed booking (matching the backend's own rule).

### Chat tab
**Real Socket.io client**, not polling — JWT-authenticated connection,
live send/receive, typing indicators, read receipts. Conversation list is
seeded from `GET /api/chat/conversations` and updates live as messages
arrive. History for a thread loads from `GET /api/chat/conversations/:userId`.

### Profile tab
Current user info, real logout (calls backend, clears tokens, disconnects
socket), and links to:
- **My Listings** (mentors only) + **Create Listing** — full form, posts to
  `POST /api/skills`
- **AI Learning Roadmap** — generates via `POST /api/ai/roadmap` (needs
  `GEMINI_API_KEY` set on the backend; shows the server's error clearly if
  it's missing), lists past roadmaps
- **Notifications** — real feed from `/api/notifications`, unread badges,
  mark-one/mark-all read

### Design system
Light/dark mode following the system setting, indigo/purple/cyan palette,
rounded cards, reusable `Button`/`TextField`/`Card`/`StatusBadge`/`EmptyState`
components used consistently across every screen above — not restyled per screen.

## Not built yet (honest gaps)

- **Edit listing** — the type/route exists (`EditSkill`) but the screen
  itself isn't wired up yet; create + view work, edit doesn't
- **Image upload** — avatar/listing photos, waiting on Cloudinary being
  wired into the backend first (the fields exist, there's just no picker UI
  yet since there's nowhere real to upload to)
- **Push notifications** — the in-app notification feed is real and live;
  `expo-notifications` device registration for background push isn't wired in
- **Onboarding screens, OTP verification, forgot password** — auth covers
  register/login/logout solidly; the extra auth screens from the original
  spec aren't built
- **Gamification (XP/badges/leaderboard)** — matches the backend, which also
  doesn't have this; would need both sides built together
- **Admin screens** — the backend admin API exists; there's no mobile UI for
  it (reasonable, since admin tools are more often a web dashboard anyway)

## Testing the full loop end to end

1. Register two accounts — one `mentor`, one `student`.
2. As the mentor: Profile → My Listings → New Listing → publish one.
3. As the student: Home or Explore → tap the listing → Book a session → pick
   a time → confirm.
4. As the mentor: Bookings tab → open the booking → Confirm → later, Mark
   completed.
5. As the student: Bookings tab → same booking → Leave a review.
6. Either account: Chat tab → message the other — should arrive live if both
   apps are open.
7. Either account: Profile → AI Learning Roadmap → generate one (needs
   `GEMINI_API_KEY` on the backend).

## Next logical step

Wiring Cloudinary on the backend, then the image picker/upload UI here for
avatars and listing photos — the one clearly-scoped gap that touches both
sides of the stack.
