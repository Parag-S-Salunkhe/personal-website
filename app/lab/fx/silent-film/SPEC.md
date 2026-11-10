# silent-film
- Technique: scroll-scrubbed silent-era reel. One GSAP ScrollTrigger timeline (440vh wrapper, sticky stage) drives clip-path iris (circle) and horizontal wipe (inset) transitions between layers: title card, up to 4 DB movie reels (intertitle card cuts to poster, slow push-in), The End.
- Film layer: full-viewport WebGL canvas (raw GL, no lib) with animated grain, scratches, dust, hair, edge burn, vignette at 18 fps; gate weave (2D jitter + tiny rotation, occasional jump) and exposure flicker applied to the content wrapper with sepia CSS filter. Pauses off-screen.
- Cards: ornate deco SVG border (portrait and landscape variants), text sized in cqw so cards fit 390 px.
- Libs: gsap + ScrollTrigger + @gsap/react, next/font (Playfair Display SC, Old Standard TT). Data from getLabData(), posters via labImg.
- Reduced motion: no flicker or weave, one static grain frame, transitions are plain cuts (0.001 duration).
- Mobile: portrait 3:4 frame, canvas at 0.75 scale. Metrics (scratch): FPS avg 53 at 1440, 60 at 390, no console errors.
- Gotcha: do not call loseContext in cleanup; React strict mode re-runs the effect on the same canvas and gets a dead context (white screen).
