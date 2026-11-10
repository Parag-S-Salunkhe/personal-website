# Curtain (/lab/fx/curtain)
- Technique: two finely subdivided PlaneGeometry curtain halves, custom GLSL vertex shader (layered-sine folds in cloth space, so folds compress as the cloth gathers; swag with hem lifted toward the tie-back; sway; pointer-driven ripple) + velvet fragment shader (fresnel sheen, crest/trough, moving spotlight pool, brass hem fringe). Scalloped brass-trimmed valance (same program, uKind=1, fragment discard).
- Scroll (300vh sticky wrapper, window scroll only): 0-3% stirs; 3-35% parts via eased target + under-damped spring (overshoot, settle); 35-65% camera pushes to the poster; 62-82% beam swings to the TONIGHT board (bulbs chase faster, board glows); 82-100% curtain swings back to ~36% closed, camera eases out, house lights rise. Then a real movie list.
- Stage: canvas-texture marquee "TONIGHT" with chasing bulbs, latest DB poster (labImg 640) in a brass frame, additive beam cone, instanced footlights + halos, Bloom + Vignette (postprocessing).
- Libs: three, @react-three/fiber, drei (useTexture), @react-three/postprocessing, gsap ScrollTrigger + @gsap/react, shared Lenis from the lab layout. Fonts: Big Shoulders + Instrument Sans (next/font).
- Demo: window.__labDemoSteps (pointer sweeps) so the ripple shows in recordings.
- Reduced motion: no scrub, curtain composed ~94% open, poster lit, no sway/ripple/chase, caption visible, wrapper height auto.
- Light tier (phones/low power): 90x44 + 120x8 segments, dpr [1,1.5], no composer (halos instead of Bloom).
