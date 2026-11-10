---
name: site-design
description: "Design system and design process for Parag's personal site (paragsalunkhe.me, Next.js 16 + React 19 + Tailwind; motion with GSAP, three.js/react-three-fiber, shaders, physics). Use whenever building, restyling, prototyping, reviewing or writing copy for ANY page, component or section of this site (home, movies, cooking, blog, notes, projects, login, admin, /lab prototypes), and before choosing colours, fonts, type sizes, spacing, radii, icons, illustrations, motion or animation. Covers the anti-AI-slop rules, the lab scoring rubric, and (once chosen) the site's committed visual system."
---

# Site design: paragsalunkhe.me

The goal is a site people remember. Parag's brief: "the design must be amazing". Completely new visuals; real animation and graphics. The old purple UI and the July 2026 cream/Fraunces/terracotta homepage are retired; both read as AI-generated.

**Parag's verdict on 2026-11-10, after House Zine went live:**
- He **rejected House Zine** (§10).
- He found every page short on dynamic motion, scroll-driven animation and motion graphics.
- He **overruled the old "no heavy tools" rule**: "I disagree… go all out". 3D, shaders, physics, scroll-driven scenes, motion graphics and illusions are wanted.
- His taste ranking from the first lab: **Table for Eight** (liked most) > **Late Show** (a little) > the rest.

For anything that moves, the `motion-lab` skill is the playbook, and §5 below is its summary.

**Authority.** This file decides. Parag's own words beat this file. The files in `references/` are inspiration and checklists. They were written for other briefs (landing-page-design is for single-offer SaaS pages), so their hard bans (font lists, "no italics", "one CTA", "mandatory tagline section", "gradient hero text") apply **only where this file adopts them**.

Brand, audience, voice, routes and data: `.claude/skills/seo-nextjs/references/site-context.md`. Read it first.

## 1. Process for every new surface

1. **Ground it in the subject's world.** Supper clubs, movie nights, home cooking, a host's table, a cinema programme, menus, recipe cards, tickets, guest notes. Distinctive choices come from that world's materials and vernacular, not from web-design defaults. (`references/frontend-design.md`)
2. **Write a plan before code.** Put it in the decisions ledger or `.claude/redesign/design/`:
   - palette: 4–6 named hex values
   - type: families and roles
   - layout: ASCII wireframe for desktop and mobile
   - the **one signature moment** (the memorable thing)
   - principles: 2–3 lines
3. **Slop check the plan** against §3. Anything you would have produced for any similar site gets revised; write down what changed and why.
4. **Build mobile-first**, section by section. Real content from the local DB, never lorem ipsum.
5. **Look at it.**
   - Run `node .claude/redesign/tools/shoot.mjs --out <dir> --widths 1440,390 --themes <dark|light> <routes>`.
   - Read the PNGs (first viewport plus mobile is enough).
   - Critique against §5–§8, then "take one accessory off". Fix and re-shoot. A picture is worth 1000 tokens.

## 2. Page modes

| Mode | Pages | What wins |
|---|---|---|
| Experience / persuade | `/` | The world at full volume: signature moment, big type, graphics. One clear next step (guestbook note) plus the way into each section. |
| Browse | `/movies`, `/cooking`, `/projects` | Scanability. Each item is an artifact of the world (ticket, poster, menu card, recipe card), but title, rating and date read in under a second. Filters and search are fast and obvious. |
| Read | `/blog/[slug]`, `/notes/[slug]`, item detail pages | The world owns the frame (masthead, title opener, margins); the reading column stays calm. About 65–75ch, 16–18px body, real contrast, nothing animating behind the text. (`references/impeccable-mode-read.md`) |
| Operate | `/login`, `/admin/*` | Clarity and states over flair. Same tokens, quieter. |

## 3. AI defaults to refuse (when the axis is free)

These are the clusters generated design falls into (from frontend-design and impeccable). Every prototype and page is checked against them.
1. Cream background (~#F4F1EA) + high-contrast serif + terracotta/clay accent (~#D97757). That's the retired July look.
2. Near-black background + a single acid-green or vermilion accent. **Late Show must not land here**: find a cinema palette with more than one note (velvet, brass, projector-beam light, tungsten, marquee colours).
3. Broadsheet: hairline rules, zero radius, dense newspaper columns. **Bold Kitchen must not land here**: Swiss means grid, scale and colour fields, not newspaper.
4. The SaaS card kit: identical rounded cards, one radius everywhere, the same rgba(0,0,0,.1) shadow, gradient washes.
5. Template chrome:
   - ALL-CAPS tracked eyebrow labels above headings (banned outright)
   - "A · B · C" meta strings and "WORD — fragment" labels
   - #0B0B0B / #111 standing in for black
   - monospace as a "technical" costume
   - "→" appended to every link
6. Also refuse:
   - accenting a single word in a headline
   - 01/02/03 numbering unless it's a real sequence
   - the hero-metric template (big number, small label)
   - gradient text
   - decorative glass/blur
   - coloured side borders on cards
   - hard offset shadows outside a world that chose neo-brutalism
   - emoji or unicode standing in for icons
   - the same fade-up on every section
   - purple/violet as a default accent

The brief can earn any of these except the eyebrow ban. If you use one, write the reason in the ledger.

## 4. Visual system rules (adapted from landing-page-design)

- **Type scale:** sizes land on Tailwind steps (`text-xs` … `text-9xl`) or a `clamp()` built from them for display. No stray `text-[19px]`. Display type max about 6rem on desktop (more only for a deliberate poster moment); tracking floor -0.04em.
- **Named text styles:** define once and reuse instead of loose utilities. Use Tailwind `@layer components` classes or `tailwind.config` plugin utilities: `display-1/2`, `heading-1…6`, `title-1…4`, `body-1…4`, `caption-1…3`, `button-lg/md/sm`. Headings get `text-wrap: balance`, body `text-wrap: pretty`.
- **Fonts:** one or two families, clearly distinct, loaded with `next/font/google` or `next/font/local` (self-hosted, `display: swap`). Choose them for the world, not by habit. Avoid as the display voice, because they're overused: Inter, Roboto, Arial, Open Sans, Helvetica, Poppins, DM Sans, Fraunces, Playfair. Italics are allowed when the world wants them.
- **Spacing:** use only 0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96 px (Tailwind 0, 0.5, 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24), plus 128/160 for section rhythm. More space above a heading than below it.
- **Radius:** pick per hierarchy, not one radius for everything. Nested radius: inner = outer − gap when the gap < 32px and the result > 2.
- **Colour:**
  - tokens as CSS variables plus Tailwind colours
  - body text ≥ 4.5:1 contrast, large text ≥ 3:1
  - secondary text on a coloured surface is tinted from that hue, never grey
  - backgrounds may use texture, grain, illustration or colour fields; avoid generic gradient washes
- **Icons:** one consistent set: lucide-react (already installed) or Phosphor (`@phosphor-icons/react`, run the npm safety check first), or authored SVG in the world's stroke.
- **Browser surfaces:** theme `::selection`, `caret-color`, the scrollbar, `:focus-visible` rings, link `text-underline-offset`, and `font-variant-numeric: tabular-nums` for ratings and dates.

## 5. Motion and graphics

**Go all out (Parag, 2026-11-10).** Motion is the main event on experience and browse pages, not decoration. The full playbook is in the `motion-lab` skill.
- **Allowed and wanted:**
  - three.js / react-three-fiber / drei scenes
  - GLSL shaders and postprocessing (grain, bloom, depth of field, light beams)
  - rapier physics
  - GSAP timelines and ScrollTrigger pinned and scrubbed scenes, with Lenis smooth scroll
  - SplitText kinetic type, particles, p5.brush painted animation
  - page and shared-element transitions, illusions (infinite zoom, anamorphic text, parallax depth)
  - Blender-made models (GLB)
- **The failure mode** is the same soft fade-up on every section, which is what House Zine shipped. Every page needs at least one scene the visitor *plays with by scrolling or moving*.
- **Motion that answers the visitor** (hover, open, filter, submit, tilt, drag) should feel physical: springs, overshoot and settle, follow-through.
- **Floors** (they never limit the look, only how it degrades):
  - First paint is server HTML with real text plus a static poster frame of the scene. Heavy scenes load with `next/dynamic(..., { ssr: false })` and mount when near the viewport.
  - `prefers-reduced-motion` gets a composed still or a cross-fade version, never a blank.
  - Low-power or phone gets a lighter scene: lower DPR, fewer particles, baked lighting.
  - No autoplay sound; sound is opt-in.
  - Text over moving backgrounds keeps ≥ 4.5:1 contrast.
  - Read mode (§2) stays calm behind the text column.
- **Performance is measured, not a veto:** record FPS (avg and p5), JS KB, LCP, CLS and INP per page in the lab report. A slow page gets optimised (instancing, texture compression, frameloop="demand", pausing offscreen), not stripped.
- **Easing:** springs or expo/quart-out for arrivals (`cubic-bezier(0.22,1,0.36,1)` stays a good UI default). Scrubbed scroll scenes map progress directly. Never the browser `ease`/`linear` defaults for UI motion.
- **Mechanics:** animate transforms, opacity, shader uniforms and camera, never layout properties. Use one rAF/ticker per page: GSAP's ticker drives Lenis, and R3F uses its own loop. Clean up every ScrollTrigger and WebGL context on unmount (`useGSAP`, R3F disposal).

## 6. Content-type treatments

Each type is an artifact of the world, but the data stays legible:
- **Movie:** ticket stub, poster or programme entry. Poster from TMDB (`next/image`, `image.tmdb.org`), rating, type, watch date, a review excerpt.
- **Dish:** menu line or recipe card. Photo, category, rating, cook date, ingredients as a real list.
- **Post:** article opener. Title, date, type (video posts show the player affordance), excerpt.
- **Note:** scrap, card or margin note. Title, category, date.
- **Project:** a "build sheet" in the world's language. Tech stack, project and GitHub links (validated `http(s)` only).
- **Guestbook note:** the visitor's handwriting moment. Name, message, emoji; calm success and error messages.

## 7. States and ship checklist (adapted from landing-page-design B9/B10)

- Every interactive element has hover, active (`scale(.98)` or `translateY(1px)`), `:focus-visible` ring, disabled, loading (a skeleton shaped like the layout, not a spinner), empty (a composed invitation, never a blank panel), and error (inline and specific, never `alert()`).
- No dead links; the current page is marked in the nav; there's a way back from every page.
- Skip-to-content link; semantic `header/nav/main/article/section/footer`; alt text on meaningful images; a custom branded 404; a favicon.
- Checked at 390px wide: no horizontal overflow, buttons keep their text, and the primary action is visible in the first screen. Use `100dvh`, not `100vh`.
- Metadata, OG and JSON-LD: follow the `seo-nextjs` skill.

## 8. Copy

Plain verbs, sentence case, the host's voice (see site context). Controls name their action ("Leave a note", not "Submit"). Errors name the problem and the fix ("Note not sent. Keep it under 280 characters."). No filler: revolutionize, supercharge, cutting-edge, effortless, elevate, seamless, unleash, world-class, "take it to the next level". Avoid the AI tells in `references/ai-tells.md` ("it's not X, it's Y", "no X, no Y, no Z", triplets). Never invent facts (see site context).

## 9. Design lab (`/lab`) rules and scoring

- Each prototype lives in `app/lab/<slug>/` and `components/lab/<slug>/` only, with its own `layout.tsx` (fonts via `next/font`, tokens as CSS variables on a wrapper or a CSS module).
- **Never edit shared files from a prototype:** `tailwind.config.ts`, `app/layout.tsx`, `app/globals.css`, `components/shared/*`. They collide, and Tailwind config changes need a dev-server restart.
- Content: hero, a movies row, a cooking row and a blog row from the local DB (server component with Prisma, dates serialised to ISO strings), at 1440 and 390.
- Each prototype ships with a short `SPEC.md` beside it: palette, type, signature moment, motif, light/dark stance, and which §3 traps it avoided.
- **Record, don't just screenshot.** Motion can't be judged from stills.
  - `node .claude/redesign-v3/tools/record.mjs` writes an MP4 per width for Parag and a contact sheet for you. Judge motion from the contact sheet.
- **Score (v2, 2026-11-10), out of 50:**
  - motion "wow", judged from recordings and contact sheets: 15
  - fit to Parag's taste ranking (Table for Eight > Late Show > rest; never House Zine): 10
  - distinctiveness (cover the name; could this be anyone's site?): 10
  - brand fit (host, warmth, wit; dinner table + home cinema): 5
  - usability, readability and mobile: 5
  - measured performance: 5
- **Scores are advisory.** Parag picks the direction. Claude's own pick (House Zine) was rejected once. Keep every prototype live under `/lab` with its recordings in the report until he decides.

## 10. Live system: House Zine (REJECTED by Parag, 2026-11-10)

> **Rejected.** This is what production runs until a new direction replaces it. It is kept here only so you can maintain the live pages and compare against them. Don't reuse its look: riso inks, zine, tape, staples, halftone dossier, handwriting margins. The next system comes from the motion lab (`.claude/redesign-v3/`) after Parag picks a direction.

The site is the risograph zine Parag hands guests at the door: two fluorescent inks on cool paper, cut, taped and scribbled on. Winner of the design lab (scores and reasons in `.claude/redesign/PROGRESS.md` ledger; the prototype stays at `/lab/house-zine`). Light only: paper is the point, so there is no dark mode.

**Palette** (CSS variables in `app/globals.css`, Tailwind names in `tailwind.config.ts`)
| Token | Hex | Tailwind | Use |
|---|---|---|---|
| `--paper` | #F1F1EC | `paper` | page (cool newsprint, with a faint blue noise grain) |
| `--slip` | #FAFAF7 | `slip` | cards, clippings, form slips |
| `--riso-blue` | #2F4FA2 | `riso-blue` | the main text ink, rules, buttons (6.6:1 on paper) |
| `--riso-pink` | #FF4FA3 | `riso-pink` | second ink: misregistration, halftone, rating circles, underlines. **Never carries text.** |
| `--riso-yellow` | #FFE14A | `riso-yellow` | tape, sticky notes, highlights, `::selection` |
| `--ink` | #1B2350 | `ink` | text on pink or yellow, focus ring |

**Type** (`next/font/google` in `app/layout.tsx`)
- Anybody (variable `wdth` + `wght`): `.t-display` (900, wdth 150, the zine headline), `.t-title` (800, wdth 100, card and article titles), `.t-label` (700, wdth 60, nav, buttons, meta lines).
- Literata: body and reading (17px base, 1.6 line height; article column 65–70ch).
- Reenie Beanie: `.t-hand`, the host's margin scribbles under section titles, and guestbook quotes. One per section, never for information.
- `.nums` for dates and ratings (tabular-nums).

**Motifs** (`app/globals.css` component classes + `components/zine/Marks.tsx`)
- `.mis`: the pink 3px/2px misregistration shadow on display headings (an earned exception: it is riso misregistration, not a neo-brutalist shadow).
- `.halftone` / `.halftone-blue`: radial-gradient dot fields, masked to fade.
- `.duo`: pink/blue duotone for posters and photos (grayscale + multiply + lighten). Item pages show the image in full colour.
- `Tape`, `Staple`, `CutLine` (scissors + dashed rule between sections), `.torn` (torn slip edge), `.cut` (dashed clipping border).
- `Rated`: the score in a hand-drawn pink circle. `NoPoster` (clapperboard on halftone), `Plate` (3 hand-drawn plate variants) are the designed no-image states.

**Motion** (`components/zine/`)
- Signature: `PrintTitle.tsx`, the print run. The pink layer wipes in, then the blue layer slides into near-registration and a 4px offset stays. Full size on the home hero; every page's h1 uses a smaller version of it.
- `Settle.tsx`: taped things settle with a small rotation as they enter view (`whileInView`, once). Opacity stays 1, so nothing is ever blank.
- `app/template.tsx`: a short paper-slide page transition.
- Curve `cubic-bezier(0.22,1,0.36,1)`; `useReducedMotion()` gives the final state.

**Components** (`components/zine/`)
- `Masthead.tsx` (current page underlined in pink, skip link) and `Footer.tsx` (blue band, "That's the zine.").
- `SectionHead.tsx` (display title + scribble + "All the …" link) and `Empty.tsx` (a composed invitation in a dashed clipping).
- Cards: `MovieCard.tsx` (taped duotone poster + Rated), `DishCard.tsx` (dashed recipe clipping, plate or photo, ingredients), `PostSpread.tsx` (two-page spread with staples), `NoteScrap.tsx` (yellow sticky with tape), `ProjectSheet.tsx` (build sheet).
- `GuestForm.tsx` (the one next step) and `Filters.tsx` (search + filter chips as cut-out tabs).

**Rules of thumb**
- Radius: none on paper things (clippings, slips, buttons); rounding only on the rating stamp and plates.
- Buttons: blue fill with paper text, hover pink fill with ink text, `:active` translateY(1px) scale(.98).
- Links: pink 3px underline that floods on hover (`.ink-link`).
- Rotation is for paper objects only (cards, tape, slips), within ±2.5°, and never on text blocks you read.
- Admin and login are the "office copy": the same paper, ink and Anybody labels, with no tape, tilt or halftone.

## References (open only when needed)
| File | Use it for |
|---|---|
| `references/frontend-design.md` | Direction from the subject's world; the plan → critique loop; AI-default clusters; restraint (Anthropic, Apache-2.0) |
| `references/impeccable-craft-floor.md` | The final craft checks (contrast, measure, browser surfaces) and the refuse list (impeccable, Apache-2.0) |
| `references/impeccable-mode-read.md` | Designing reading pages: blog posts, notes, item detail |
| `references/landing-page-design.md` | The source of §4/§7: type scale, named styles, spacing, radius, motion curve, states, ship list, content realism (elayadesign, MIT) |
| `references/redesign-existing-projects.md` | Audit order for upgrading existing pages: fonts → colour → states → layout → motion → components → states → copy |
| `references/web-interface-guidelines.md` | Accessibility, focus, forms, animation and performance review checklist (`file:line` findings) (Vercel, MIT) |
| `references/ui-ux-pro-max-quick-reference.md` | Broad UX rule list (touch targets, forms, navigation) to widen options (MIT) |
| `references/copywriting.md`, `references/ai-tells.md` | Writing page copy without AI tells (marketingskills, MIT) |

Licences and sources: `.claude/skills/THIRD_PARTY_NOTICES.md`.
