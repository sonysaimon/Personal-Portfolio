# Dayline

Multi-user day planner with Google Calendar and Outlook sync. Next.js (App Router) + Auth.js + Prisma/Postgres, deployed on Vercel at `app.soichirosaimon.com`.

The planner (`lib/planner.ts`) places classes and calendar events first, protects lunch, puts focus tasks in your preferred focus window, and fills leftover gaps with quick tasks.

## Local development

```bash
cd dayline
npm install
cp .env.example .env.local && ln -s .env.local .env   # Prisma CLI reads .env, Next reads .env.local
# fill in .env.local (see below)
npx prisma migrate dev      # creates the tables
npm run dev                 # http://localhost:3000
```

### Environment variables

| Variable | Where it comes from |
| --- | --- |
| `DATABASE_URL` | Neon / Vercel Postgres / local Postgres connection string |
| `AUTH_SECRET` | `openssl rand -base64 33` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials → OAuth client (Web) |
| `AUTH_MICROSOFT_ENTRA_ID_ID`, `AUTH_MICROSOFT_ENTRA_ID_SECRET` | Entra admin center → App registrations |
| `AUTH_MICROSOFT_ENTRA_ID_ISSUER` | `https://login.microsoftonline.com/common/v2.0` (multi-tenant + personal) |
| `TOKEN_ENCRYPTION_KEY` | `openssl rand -base64 32` — AES-256-GCM key for OAuth tokens at rest |

OAuth redirect URIs to register on both providers:

- `http://localhost:3000/api/auth/callback/google` and `https://app.soichirosaimon.com/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/microsoft-entra-id` and `https://app.soichirosaimon.com/api/auth/callback/microsoft-entra-id`

Google scopes requested: `openid email profile`, `calendar.events`, `calendar.calendarlist.readonly` (the last one lists your calendars; without it only the primary calendar is read).
Microsoft scopes: `openid email profile offline_access User.Read Calendars.ReadWrite`.

## Layout

```
auth.ts                 Auth.js config: Google + Microsoft providers, encrypting Prisma adapter
app/page.tsx            landing (signed out) or the planner (signed in)
app/api/*               session-gated JSON routes, every query scoped by userId
app/privacy, app/terms  policy pages required for Google verification
lib/planner.ts          buildPlan() — shared by the UI and GET /api/plan
lib/events.ts           merges Google + Microsoft + local events, per-provider error reporting
lib/providers/*         Calendar API / Graph fetchers, token refresh, revocation
lib/crypto.ts           AES-256-GCM for tokens at rest
components/*            the UI (ported from the original single-user planner)
prisma/schema.prisma    User/Account/Session + Preferences/ClassBlock/Task/LocalEvent
```

## API

| Route | Methods |
| --- | --- |
| `/api/events?from=&to=&tz=` | GET — merged calendar events, normalised `{id, source, title, start, end, allDay, busy}` |
| `/api/plan?date=&tz=` | GET — the day plan, built server-side |
| `/api/preferences` | GET, PUT |
| `/api/tasks`, `/api/tasks/:id` | GET, POST / PATCH, DELETE |
| `/api/classes`, `/api/classes/:id` | GET, POST / DELETE |
| `/api/local-events`, `/api/local-events/:id` | GET, POST / DELETE |
| `/api/connections?provider=` | GET, DELETE (unlink a provider; not the last one) |
| `/api/account` | DELETE — revoke tokens and remove every row for the user |

## Deploying on Vercel

Import the repo, set **Root Directory** to `dayline`, add every variable above (with the production `DATABASE_URL`), and add the domain `app.soichirosaimon.com` (CNAME `app` → `cname.vercel-dns.com` at GoDaddy). The build script runs `prisma migrate deploy` before `next build`, so migrations apply on each deploy.
