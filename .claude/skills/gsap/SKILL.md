---
name: gsap
description: "GSAP (GreenSock) animation for this Next.js 16 / React 19 site: core tweens, timelines, ScrollTrigger (pin, scrub, snap), plugins (SplitText, Flip, Draggable, Inertia, MorphSVG, DrawSVG, ScrollSmoother, Observer, CustomEase), useGSAP in React, performance and utils. Use whenever writing or reviewing GSAP code, scroll-driven animation, pinned or scrubbed scenes, kinetic type or Flip transitions."
---

# GSAP: the official GreenSock skills, indexed

The official skills from `greensock/gsap-skills` (MIT, commit aed9cfd), copied unchanged into `references/`. Open only the file you need:

| File | Open it for |
|---|---|
| `references/gsap-react.md` | **Always first in this repo.** `useGSAP`, refs and scope, `gsap.context()`, cleanup on unmount, Next.js client components |
| `references/gsap-core.md` | `to`/`from`/`fromTo`, easing, stagger, defaults, `gsap.matchMedia()` (responsive + `prefers-reduced-motion`) |
| `references/gsap-timeline.md` | Sequencing, the position parameter, nesting, labels, playback control |
| `references/gsap-scrolltrigger.md` | Scroll-linked animation: `pin`, `scrub`, `snap`, start/end, `refresh`, horizontal scroll, `containerAnimation` |
| `references/gsap-plugins.md` | Registering plugins; SplitText, Flip, Draggable, Inertia, Observer, ScrollSmoother, ScrambleText, MorphSVG, DrawSVG, MotionPath, physics, CustomEase |
| `references/gsap-performance.md` | Transforms over layout, `will-change`, batching, avoiding jank |
| `references/gsap-utils.md` | `clamp`, `mapRange`, `interpolate`, `snap`, `wrap`, `toArray`, `pipe` |
| `references/gsap-frameworks.md` | Non-React frameworks (rarely needed here) |

**Project rules**
- **Licence:** every GSAP plugin is free, including commercial use. Install from npm (`gsap`, `@gsap/react`), never a private registry or an auth token.
- **Client only:**
  - Files that use GSAP start with `'use client'`.
  - Register plugins once at module level inside a client file (`gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)`).
  - Never touch `window` during server render.
- **Lenis + ScrollTrigger:**
  - Drive Lenis from GSAP's ticker so there is one loop: `lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0)`.
  - Destroy Lenis on unmount.
- **Reduced motion:** use `gsap.matchMedia()` with `(prefers-reduced-motion: reduce)` to show the composed final state.
- **Route changes:** in the App Router, `useGSAP` reverts its context on unmount. Call `ScrollTrigger.refresh()` after images or fonts change layout.
