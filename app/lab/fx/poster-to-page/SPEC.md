# poster-to-page
- Technique: shared-element transition by hand-rolled FLIP on one reversible GSAP timeline, client-state detail view on the same route. View Transitions need experimental.viewTransition in next.config.js (not editable here), so not used.
- Moves: poster lifts (scale, tilt, brass shadow); flies and grows into the hero (expo.inOut); other cards fall away staggered by distance; circular clip-path colour flood from the card; text staggers in. Close = timeline.reverse(). Shelf has pointer tilt (quickTo), scroll-depth parallax and scroll-velocity lean.
- Dominant colour: saturation-weighted canvas sample of the same-origin labImg 256 URL, darkened to a flood tone (fallback curtain #6B1A2B).
- Libs: gsap (ScrollTrigger, matchMedia, quickTo), @gsap/react, Lenis stop/start via kit useLenis.
- Recorder: window.__labDemo opens poster 2, waits 1.5s, closes, opens poster 3, closes. Page stays 2.6-3.3 viewports tall.
- Reduced motion: overlay and text cross-fade, no flight/flood/fall, no parallax. Esc closes.
- Mobile/light: 2-column shelf, stacked hero; tilt disabled on coarse pointers. 59/60 fps, no console errors.
