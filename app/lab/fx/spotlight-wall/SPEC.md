# spotlight-wall
- Technique: DOM wall of 3 parallax poster rows lit by a CSS radial-gradient dimmer (soft falloff) plus screen-blended tungsten pool and a 2D-canvas dust layer; no WebGL.
- Moves: per-card 3D tilt toward the light with an underdamped spring (overshoot), z-lift and soft-light glare tracking the light; rows drift at different speeds/directions with scroll; light radius breathes with scroll; at the end rows converge into an aligned grid, dimmer fades out and titles/ratings appear.
- Pointer: light follows the mouse (smoothed); idle sway before first move. `window.__labDemoSteps` = 7 `move` steps (~6 s).
- Touch / hover:none: light follows scroll along an S-curve (sine in x, linear in y).
- Libs: gsap (ScrollTrigger + ticker), React, kit hooks (useReducedMotion, useTier).
- Reduced motion: house lights up (grid + titles), static fixed tilt, no scrub, no dust motion.
- Light tier: fewer dust particles (40 vs 90), lower canvas DPR, bigger torch radius on narrow screens.
- Perf: recorded 60 fps avg at 1440 and 390, 0 console errors; wrapper 460vh.
