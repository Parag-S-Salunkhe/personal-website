# Site context: paragsalunkhe.me

Shared context for the `site-design`, `seo-nextjs` and copywriting work. Read this instead of asking Parag.

## Who and what
- **Owner:** Parag Salunkhe, based in Dublin. Cloud / DevOps engineer by day. The site is **not** a work portfolio any more (decided July 2026). Keep career content out, apart from the odd playful wink, e.g. "Kubernetes clusters" in a list of things he hosts.
- **Brand:** home hosting and entertainment. Supper clubs, movie nights, long dinners, game nights, home cooking, good company. The site is his corner of the internet for that life: what he watched, what he cooked, what he wrote, what he's tinkering with.
- **Voice:** a warm, witty host. First person, plain verbs, sentence case, short sentences. Confident, not salesy. No corporate or SaaS language, and no exclamation-mark enthusiasm.
- **Audience:**
  - friends and guests checking out what's next
  - people who found a movie review or dish via search or social
  - future collaborators for hosting and entertainment content

## Sections (all stay)
| Route | Content (Prisma model) | Mode |
|---|---|---|
| `/` | Hero, latest of each section, guestbook note form, socials | Experience / persuade |
| `/movies`, `/movies/[slug]` | `Movie`: title, type (MediaType), rating (decimal), review, watchDate, posterUrl (TMDB) | Browse gallery → detail |
| `/cooking`, `/cooking/[slug]` | `Cooking`: dishName, category, rating, review, imageUrl, ingredients[], cookDate, videoUrl | Browse gallery → detail |
| `/blog`, `/blog/[slug]` | `Blog`: title, content (plain text), imageUrl, blogType (incl. video), publishDate | Read |
| `/notes`, `/notes/[slug]` | `Note`: title, content, category, createdAt | Read |
| `/projects` | `Project`: title, description, techStack[], projectUrl, githubUrl, imageUrl | Browse |
| `/login`, `/admin/*` | Admin CRUD (single shared password, JWT cookie) | Operate, noindex |
| `/lab/*` | Design prototypes (redesign v2 only) | noindex, remove before prod |

Item URLs use slugs of the form `${slugify(title)}-${id}`, resolved by the id suffix (no schema change).

## Main call to action (placeholder)
The final primary action is undecided; it's parked on Parag's to-do list. For now: a simple **guestbook note** form (the `GuestbookMessage` API and rate limit exist) plus social links. Don't invent an invite or RSVP flow.

## Links
- Domain: `https://www.paragsalunkhe.me` (use `NEXT_PUBLIC_SITE_URL`, falling back to this).
- Socials: LinkedIn `https://www.linkedin.com/in/parag-salunkhe`, GitHub `https://github.com/Parag-S-Salunkhe`. Email: the old homepage had a `mailto:` icon link. Keeping it is fine; log the choice in the decisions ledger. No Instagram handle is known yet, so don't invent one.

## Facts rule
Never invent facts: ratings, reviews, dates, guest counts, quotes and testimonials come from the database or from Parag. Missing facts get a clearly marked placeholder, never a made-up value.
