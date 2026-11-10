# deco-marquee (/lab/fx/deco-marquee)
- Technique: R3F Art Deco cinema at night. Stepped brass-edged facade, instanced sunburst + chevrons, ~200 instanced emissive bulbs (per-instance colour: ignition overshoot then a chase), canvas-texture letter board (36 cells flip out/in), vertical blade sign, bloom + vignette.
- Scroll: one ScrollTrigger on a 500vh wrapper writes progress; Rig damps it and moves the camera (low dark street, canopy chase, board close-up, push up to blade, pull back wide), then a real-text programme list from getLabData().movies.
- Titles on the board come from the DB (first 3 movies), then "NOW SHOWING".
- Libs: three, @react-three/fiber, drei (Environment/Lightformer), @react-three/postprocessing, gsap + ScrollTrigger.
- Reduced motion: frameloop demand, fixed lit still (all bulbs, first title, wide framing), no ScrollTrigger.
- Light tier (<768px / low power): half the bulbs, 6-seg spheres, dpr [1,1.5], no MSAA, softer bloom; camera distance fits portrait width.
- Perf (scratch run): 60 fps avg at 1440 and 390, no console errors.
