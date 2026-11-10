# kinetic-type
Technique: three scroll beats of kinetic type in the Late Show palette, then a plain readable list.
Moves: (1) GSAP SplitText chars with mask, back.out(2.6) rise, then ScrambleText decodes line 2; hero drifts up on scroll. (2) Sticky 320vh stage: a bold wave travels through "Matinee"/"Midnight" letters, writing font-variation-settings wght 100-900 + opsz 10-72 per letter (Big Shoulders has no wdth axis; letter-spacing narrows with the swell). (3) Split-flap board: 8 DB movies, every character a 4-part CSS 3D flap (rotateX halves, shading); one tween drives all flaps; ScrollTrigger restarts on enter and enter-back, resets on leave. Digits cycle 0-9 for ratings and dates.
Libs: gsap (SplitText, ScrambleText, ScrollTrigger), @gsap/react, next/font (Big Shoulders variable, Instrument Sans), Lenis via lab layout.
Reduced motion: hero static, swell shown at mid-wave, board fully settled, no flipping.
Mobile 390: board drops to 10-char titles (truncated with an ellipsis) and MM.YY dates; hero is 30vw and fits.
Perf: DOM only, 60 fps avg at 1440 and 390, no console errors.
