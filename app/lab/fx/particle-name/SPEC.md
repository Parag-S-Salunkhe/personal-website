# particle-name: popcorn name (/lab/fx/particle-name)
- Technique: 2,600 instanced popcorn kernels (noise-displaced icosphere, faceted, vertex-colour husk) in R3F, CPU spring/ballistic sim per kernel. Targets sampled from "PARAG" / "MOVIES" drawn to an offscreen 2D canvas in the next/font Big Shoulders 900 (waits on document.fonts.load + ready).
- Moves: load = pile on floor, kernels pop (scale punch + upward jump) and spring into the name with overshoot; scroll phases at 14% / 28% / 44% of the sticky wrapper: burst + tumble (gravity, floor and wall bounce) -> reform as MOVIES -> ballistic arcs aimed into a striped paper bucket that rises from below; then the latest-movies list from getLabData().
- Pointer repels kernels (window pointermove); window.__labDemoSteps sweeps through the name.
- Libs: three, @react-three/fiber, @react-three/postprocessing (Bloom + Vignette), gsap ScrollTrigger + the lab Lenis, next/font.
- Reduced motion: one still frame of the assembled name (frameloop demand), no bucket, wrapper is 100dvh.
- Mobile / light tier: 900 kernels, dpr [1,1.5], no MSAA, lighter bloom; word stacks (PA/RAG, MOV/IES).
- Perf (scratch recording, M4): 59 fps avg at 1440, 60 at 390, no console errors.
- Recorder scrolls fast, so the phase thresholds sit early in the wrapper so the heap is visible in the video.
