# paragsalunkhe.me

Parag Salunkhe's corner of the internet: the movies from movie night, the dishes from the supper club table, and the things he wrote down. Visitors can leave a note in the guestbook.

The look is **House Zine**: a two-ink risograph zine (blue and fluorescent pink on cool paper) with tape, staples, halftone dots and handwriting in the margins. The design rules live in `.claude/skills/site-design/SKILL.md` (section 10, "Chosen system").

## Stack
- Next.js 16 (App Router) + React 19, TypeScript
- Tailwind CSS 3, framer-motion, lucide-react
- Prisma 5 + PostgreSQL
- Hosted on Vercel (daily cron for the Google Fit sync in `vercel.json`)

## Pages
| Route | What it is |
|---|---|
| `/` | Front page: guestbook note form and the latest of each section |
| `/movies`, `/movies/[slug]` | Films and series with a score out of 5 |
| `/cooking`, `/cooking/[slug]` | Dishes, ingredients, how it went |
| `/blog`, `/blog/[slug]` | Longer posts (old `/blog/<id>` links redirect) |
| `/notes`, `/notes/[slug]` | Short notes |
| `/projects` | Build sheets for side projects |
| `/login`, `/admin/*` | Admin (single password, JWT cookie), not indexed |
| `/lab/*` | Design-lab prototypes from the redesign, not indexed; remove before going live |

Item URLs are `<slugified-title>-<id>`; the id at the end is what's looked up, so renaming an item never breaks a link.

## Run it locally
Needs Node 22 and Docker.

```bash
docker compose up -d postgres        # local Postgres on :5432
cp .env.example .env                 # then fill in the values
npm install
npx prisma migrate deploy            # local database only
npm run dev                          # http://localhost:3000
```

Environment variables (names only): `DATABASE_URL`, `JWT_SECRET`, `ADMIN_PASSWORD`, `CRON_SECRET`, `TMDB_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `NEXT_PUBLIC_SITE_URL` (optional, defaults to `https://www.paragsalunkhe.me`). The app fails closed without `JWT_SECRET`, `ADMIN_PASSWORD` and `CRON_SECRET`: admin login and the cron stay locked.

## Checks
```bash
npx tsc --noEmit
npm run lint
npx prisma generate && npx next build   # `npm run build` also runs migrations; use it only in deploys
```

## Security notes
- Every write API needs the admin cookie (`lib/auth.ts` `requireAdmin`); the guestbook, mood and page-view POSTs are public and rate-limited.
- Links and images from the database are only rendered when they're `http(s)` (`lib/url.ts`).
- Security headers and a report-only Content Security Policy are set in `next.config.js`.
