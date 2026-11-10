# Pop-up book (`/lab/fx/popup-book`)
- Technique: R3F paper pop-up book on a tablecloth. Five leaves hinged at a spine; the page turn and curl are done in the vertex shader (a patched MeshStandardMaterial plus a matching depth material, so the bent paper casts a bent shadow). Every pop-up panel is a hinged, alpha-cut plane that rides the same bend.
- Art: every page and panel is painted on 2D canvases (paper grain, creases, lit-window emissive maps). Real data: poster on the little screen (`labImg`), dish names on paper tabs, movie and dish lists on the left pages.
- Motion: scroll (window, GSAP ScrollTrigger scrub, damped) turns the cover and three pages; panels rise with an ease-out-back overshoot, staggered back to front, and fold flat before the next turn. Closed book slides to centre as it opens. Camera orbits slowly, lower once open. Candle flames flicker; three real candles and a point light rise with the table spread.
- Interaction: paper pull-tab on the cover slides a place card out of a pocket (pointer drag, springs back). `window.__labDemoSteps` is refreshed with the tab's projected screen position.
- Libs: three, @react-three/fiber, gsap + ScrollTrigger + useGSAP, Lenis (shared kit). No postprocessing (CSS vignette).
- Reduced motion: no scrub; the dining spread is held open as a still (frames run ~2.5 s, then demand); not recorded in this pass.
- Light tier / portrait: dpr 1-1.5, 1024 shadow map, no candle point light, smaller canvases; camera frames the right page only (one page at a time).
- Perf (record.mjs): 1440 and 390 fps avg 60 / p5 60; no console errors; page 5.1-5.5 viewports.
