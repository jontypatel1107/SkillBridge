# SkillBridge Backend — Complete API

A working Node.js/Express/MongoDB backend for the SkillBridge marketplace:
auth, skills, bookings, users, reviews, notifications, real-time chat
(Socket.io), AI features (Gemini), and admin tools. Type-checks clean with
`tsc --noEmit`, no stubbed-out routes — everything listed below actually runs.

## Setup

```bash
npm install
cp .env.example .env   # fill in MONGO_URI, JWT secrets, optionally GEMINI_API_KEY
npm run dev
```

Requires a running MongoDB instance (local or Atlas — see `.env.example`).

Generate JWT secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
(run it twice, once for each secret)

## What's included

### Auth (`/api/auth`)
Register, login, refresh, logout, `/me`. JWT access + refresh tokens,
refresh tokens hashed at rest, per-route rate limiting, Zod-validated input.

### Skills (`/api/skills`)
Search/filter/paginate marketplace listings (text search, category, price
range, sort), get one, mentor-only create/update/delete, "my listings."

### Bookings (`/api/bookings`)
Learner books a session against a skill. Full status lifecycle
(`pending → confirmed → completed`, or `→ cancelled` from either state)
enforced server-side — illegal transitions return a clear 400. Fires
notifications on request/confirm/cancel/complete.

### Users (`/api/users`)
Update your own profile, view a public profile by username, follow/unfollow,
geospatial "nearby mentors" search (uses MongoDB `2dsphere` index on `User.location`).

### Reviews (`/api/reviews`)
One review per booking, only the learner from a **completed** booking can
leave one. Automatically recalculates the mentor's aggregate `rating` and
`ratingCount` on `User`.

### Notifications (`/api/notifications`)
In-app notification feed: list mine (with unread count), mark one/all read.
Written to automatically by bookings, reviews, follows, and chat.

### Real-time Chat
- **Socket.io** (JWT-authenticated handshake — pass `{ auth: { token: accessToken } }`
  when connecting) handles live `message:send`, `message:new`, typing
  indicators, read receipts, and online/offline presence.
- **REST** (`/api/chat`) handles history: `GET /conversations` (chat list,
  sorted by most recent, with unread counts) and
  `GET /conversations/:userId` (paginated message history with a specific person).

### AI (`/api/ai`) — Gemini-backed
- `POST /roadmap` — generates a week-by-week learning roadmap for a stated
  goal, persists it, `GET /roadmap/mine` lists yours.
- `POST /chat-summary` — summarizes a completed booking's chat transcript
  into key concepts / notes / homework / next-session goals.
- `GET /recommend-mentors` — DB-scored recommendation (skill/interest overlap
  + rating), no LLM call needed for this one.
- `GET /suggest-skills` — suggests new categories based on your interests and
  what you haven't already completed a session in.

All AI routes need `GEMINI_API_KEY` in `.env` (free key at
https://aistudio.google.com/apikey) — routes that call Gemini return a clear
502 with the underlying error if the key is missing or the call fails, rather
than crashing the process.

### Admin (`/api/admin`) — admin role only
List/filter users, verify a mentor, suspend/unsuspend a user, basic
analytics (user/mentor/student counts, active skills, bookings by status,
total reviews).

### Security & infra
helmet, CORS, mongo-sanitize, rate limiting on auth, Zod validation on every
mutating route, centralized error handling with a consistent JSON shape,
role-gating via `requireAuth`/`requireRole` middleware.

## Not included (intentionally, and why)

- **Payments** — the spec asks for this to stay abstracted until
  Razorpay/Stripe is actually wired in; no payment fields exist yet to avoid
  half-built, untested money-handling code.
- **Image uploads (Cloudinary), email/OTP delivery** — these need real
  third-party credentials from you (Cloudinary account, SMTP/SendGrid) to
  test meaningfully. The `avatarUrl`/`imageUrl` fields already exist on the
  relevant models, so wiring in an upload endpoint once you have credentials
  is a small, contained addition — happy to do that next if you want.
- **Gamification (XP/badges/leaderboard), Reports/moderation queue** — these
  are genuinely separate feature sets layered on top of what exists (they'd
  read from Bookings/Reviews, not replace anything here). Left out to keep
  every included module fully real rather than spreading thinner across more
  half-done ones.
- **Automated tests** — none of the above should be treated as "production
  ready" without a test suite; that's the honest next step before any real
  launch, not something to skip.

## Full route list

```
GET    /api/health

POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout              (auth)
GET    /api/auth/me                  (auth)

GET    /api/skills
GET    /api/skills/:id
GET    /api/skills/mentor/mine       (auth, mentor/admin)
POST   /api/skills                   (auth, mentor/admin)
PATCH  /api/skills/:id               (auth, owner/admin)
DELETE /api/skills/:id               (auth, owner/admin)

POST   /api/bookings                 (auth)
GET    /api/bookings                 (auth)
GET    /api/bookings/:id             (auth, participant/admin)
PATCH  /api/bookings/:id/status      (auth, participant/admin)

GET    /api/users/nearby             (auth)
GET    /api/users/:username
PATCH  /api/users/me                 (auth)
POST   /api/users/:id/follow         (auth)
DELETE /api/users/:id/follow         (auth)

GET    /api/reviews/mentor/:mentorId
POST   /api/reviews                  (auth)

GET    /api/notifications            (auth)
PATCH  /api/notifications/read-all   (auth)
PATCH  /api/notifications/:id/read   (auth)

GET    /api/chat/conversations       (auth)
GET    /api/chat/conversations/:userId (auth)
[Socket.io: message:send, message:new, typing:start/stop, message:read, presence:online/offline]

POST   /api/ai/roadmap               (auth, needs GEMINI_API_KEY)
GET    /api/ai/roadmap/mine          (auth)
POST   /api/ai/chat-summary          (auth, needs GEMINI_API_KEY)
GET    /api/ai/recommend-mentors     (auth)
GET    /api/ai/suggest-skills        (auth)

GET    /api/admin/users              (auth, admin)
PATCH  /api/admin/users/:id/verify-mentor (auth, admin)
PATCH  /api/admin/users/:id/suspend  (auth, admin)
GET    /api/admin/analytics          (auth, admin)
```

## Testing quickly

1. `POST /api/auth/register` with `role: "mentor"` for one account, `role: "student"`
   for another (or just register two separate accounts).
2. As the mentor, `POST /api/skills` to create a listing.
3. As the student, `POST /api/bookings` against that skill's `_id`.
4. As the mentor, `PATCH /api/bookings/:id/status` with `{"status":"confirmed"}`,
   then later `{"status":"completed"}`.
5. As the student, `POST /api/reviews` with the booking's `_id` — check the
   mentor's `rating` updated via `GET /api/users/:username`.
6. Connect two Socket.io clients with each account's access token to test chat.

## Next logical step

The mobile app (Expo/React Native) — this backend is ready for it. Or, if
you'd rather stay backend-side first: image uploads (Cloudinary) so
`avatarUrl` and skill/chat images have somewhere real to go.
