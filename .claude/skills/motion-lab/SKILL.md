---
name: motion-lab
description: "Motion, 3D and illusion playbook for Parag's site (Next.js 16 + React 19): three.js / react-three-fiber / drei scenes, GLSL shaders and postprocessing, rapier physics, GSAP ScrollTrigger + Lenis scroll stories, kinetic type, particles, p5.brush painted animation, page and shared-element transitions, illusions (infinite zoom, anamorphic, parallax depth), Blender MCP models, and how to record and review motion (videos + contact sheets + FPS). Use whenever building, prototyping, recording or reviewing anything that moves on this site, and in the /lab motion lab."
---

# Motion lab: paragsalunkhe.me

Parag (2026-11-10): "go all out". He wants 3D, motion graphics, scroll-based scenes and illusions, and he wants every attempt recorded so he can compare them. `site-design` §5 is the summary; this is the playbook. His taste: **Table for Eight** (the supper club as a set table) > **Late Show** (home cinema) > the rest. House Zine is rejected.

## 1. Stack (run the npm safety check before adding any of it)

| Need | Package | Notes |
|---|---|---|
| 3D | `three`, `@react-three/fiber` (v9 for React 19), `@react-three/drei` (v10) | One `<Canvas>` per page; use drei `<View>` for several viewports on one canvas |
| Post effects | `@react-three/postprocessing` + `postprocessing` | Bloom, depth of field, noise/grain, vignette, chromatic aberration, god rays |
| Physics | `@react-three/rapier` | WASM. If CSP is ever enforced it needs `'wasm-unsafe-eval'`, so note it in MORNING.md |
| Scroll + timelines | `gsap`, `@gsap/react`, `lenis` | See the `gsap` skill; drive Lenis from the GSAP ticker |
| Painted 2D | `p5` + `p5.brush` | Instance mode inside `useEffect`; see `references/painted-animation-guide.md` |
| Springs and UI | `framer-motion` (already installed) | Layout, shared layout and gestures |
| GPU tier | `detect-gpu` (optional) | Picks the light or full scene |
| Pixel effects | `references/pixelfx.md` (MIT) | Copy single effect files with provenance; don't add the whole lib |

**Next 16 mechanics:**
- Every scene file is `'use client'`, loaded from the server page with `dynamic(() => import(...), { ssr: false })` and mounted near the viewport.
- The server page renders real text plus a still poster image of the scene, so SEO and first paint never wait on WebGL.
- For page transitions, check `node_modules/next/dist/docs` for View Transitions support before hand-rolling (React `<ViewTransition>` / `experimental.viewTransition`). GSAP Flip is the fallback.
- **Assets:**
  - Models: GLB in `public/lab-models/`, loaded with drei `useGLTF`. Draco or meshopt if over about 1 MB.
  - HDRIs and textures: Poly Haven (CC0) or Kenney (CC0), downloaded to `public/`.
  - Record every asset's source and licence in `.claude/redesign-v3/provenance.tsv`.

## 2. Ideas that fit Parag's two worlds
- **The table:**
  - camera orbit or dolly seat to seat
  - candles: flicker shader with bloom
  - plates and cutlery that drop and settle (physics)
  - steam and heat haze over dishes
  - wine pour (fluid-ish shader)
  - place cards that flip to reveal a section
  - guests painted in p5.brush
  - napkin cloth
  - a menu card that unfolds (pop-up paper)
- **The cinema:**
  - a velvet curtain parting on scroll
  - a projector beam with volumetric dust
  - film grain and gate weave
  - an Art Deco marquee with chasing bulbs
  - a split-flap "NOW SHOWING" board
  - iris and wipe transitions
  - a poster wall lit by a cursor flashlight
  - a poster that grows into its movie page (shared element)
  - a popcorn particle burst
- **Both, as an evening:** scrolling is time passing from 7pm to 1am. Dinner light warms, then dims, then the projector comes on. A clock, a candle burning down or the sky outside the window tracks progress.
- **Illusions:**
  - an infinite zoom (street → window → table → plate → film frame → street)
  - anamorphic type readable from one scroll position
  - 2.5D parallax depth layers
  - tilt-shift miniature of the flat
  - lenticular hover cards
  - an impossible-perspective room

## 3. Motion vocabulary (name the move in specs; vary them)
- **Timing:** anticipation, overshoot and settle, follow-through, spring (stiffness/damping/mass), stagger, arcs, moving hold (2–4% drift while paused), animating on twos (hand-made cadence).
- **Type:** per-letter rise, line-mask reveal, scramble decode, split-flap, variable-weight swell, text on a path, outline-to-fill, scale punch.
- **Transitions:** match cut, shared-element morph, iris, wipe, zoom-through, colour flood, light leak, push.
- **Camera:** dolly in, orbit, pull-back reveal, parallax layers, breathing push, crash zoom, rack focus (depth of field).
- **Generative:** particle assemble and scatter, flow field, noise displacement, instanced grid, metaballs, ordered dither.
- **Vector:** path draw-on, shape morph, mask reveal, gooey split and merge.

The test: a page uses several *different* moves, chosen for meaning. One fade-up repeated is the failure.

## 4. Writing a scroll story
1. **List the beats** (5–8). Each beat has one focal thing and one move, and maps to a scroll range (e.g. 0–15% curtain parts, 15–30% marquee lights …).
2. **Pin the stage** with ScrollTrigger, `scrub: true` or a number for lag. Snap only if beats are discrete.
3. **Real content arrives inside the story.** Posters are real TMDB images; dishes and posts come from the DB, not placeholders.
4. **Exit the story** into a normal, scannable section (lists, links) so the page stays usable.
5. **Mobile:** a shorter story, vertical framing and touch-friendly scrub. Never horizontal-scroll traps.

## 5. Film-style references (`references/film-styles/`, MIT, lemo-opuscar 9eb7739)
These were written for code-rendered *films*, so adapt the look to real-time and interaction. Read the one you're using:
- **Late Show:** `art-deco.md` (marquee, bulbs, deco type), `silent-film.md` (title cards, grain, iris), `spy-titles.md` (kinetic title sequence).
- **Table for Eight:** `paper-popup.md`, `isometric-picture-book.md`, `crayon-book.md`, `watercolor.md`, `impasto.md`.
- **Evening and warmth:** `paper-lantern.md`, `shadow-puppet.md`.
- **Miniature and 3D:** `tilt-shift.md`, `lowpoly-island.md`, `glass-product.md` (studio lighting for a hero object).
- **Other references:**
  - Camera language and stills: `references/cinematic-shot.md` (MIT, motionvideo.xyz).
  - Painted characters: `references/painted-animation-guide.md` (MIT, ClaudeAnimationBase). It is written around *Clawd*, Anthropic's mascot. **Never draw Clawd**: use its painting, timing and acting rules for original guests.

## 6. Blender (MCP tools `mcp__blender__*`)
- Use it for hero objects that procedural three.js can't make convincing: a vintage projector, a set table, chairs, a cinema seat, a cloche.
- **Steps:**
  1. `get_scene_info` to check the connection.
  2. Build with your own `execute_blender_code` Python. Never paste code from downloads.
  3. Keep poly counts web-sized and use simple PBR materials.
  4. Save the `.blend` to `.claude/redesign-v3/blender/`.
  5. Export GLB (`bpy.ops.export_scene.gltf`, `export_format='GLB'`) to `public/lab-models/`.
- Poly Haven (CC0) assets via the add-on are fine. Sketchfab, Hyper3D and the paid generators stay off.
- If the server isn't reachable, log it and build procedurally.

## 7. Recording and review
- **Record:** `node .claude/redesign-v3/tools/record.mjs --id <id> --route <route> [--widths 1440,390] [--seconds 14]`
  - It uses real GPU Chrome and a scripted wheel scroll top to bottom with holds.
  - It writes `videos/<id>__<w>.mp4`, `stills/<id>__poster.png`, `sheets/<id>__<w>.png` (3×3 contact sheet) and `metrics/<id>.json` (FPS avg/p5, long tasks, JS KB, LCP).
  - `--reduced` records the reduced-motion version.
- **Review:** you can't watch video, so read the **contact sheet**. Ask:
  - Does every frame show something new?
  - Is anything blank, broken, unlit or off-screen?
  - Is the motion legible?
  
  Fix, re-record and compare.
- Videos are for Parag: H.264 MP4, muted, under about 6 MB each.

## 8. Performance tactics (optimise, don't strip)
- `dpr={[1, 2]}`, drei `<AdaptiveDpr>` / `<PerformanceMonitor>`; `frameloop="demand"` when idle.
- Instancing for repeats (plates, bulbs, particles); baked lighting where possible; KTX2 or WebP textures.
- Pause offscreen scenes (IntersectionObserver), dispose geometries and textures on unmount, and keep one WebGL context per page.
- GSAP: transforms only; `will-change` sparingly.

## 9. Pitfalls
- `window` and `document` on the server: client components only, with `ssr: false` for canvases.
- iOS Safari: use `100dvh`; WebGL memory limits, so keep textures ≤ 2048 on mobile; no `position: fixed` jank inside pinned sections. Test 390 px.
- Hydration: no random values during render; seed them in effects.
- Fonts in WebGL text (drei `<Text>`): load a local font file. Don't fetch from Google at runtime, because CSP connect-src won't allow it.
