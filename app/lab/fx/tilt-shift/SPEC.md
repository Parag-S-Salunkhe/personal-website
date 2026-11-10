# tilt-shift (/lab/fx/tilt-shift)
- Technique: low-poly Dublin terrace diorama (6 houses, lamps, capsule guests, host bay window with laid table and poster screen), scroll-scrubbed. Custom single-pass tilt-shift Effect (flat focus band, golden-spiral blur above/below, saturation lift) whose focus line is the projected world point gliding from pavement to the table.
- Moves: sky shader dusk to night (moon, stars); windows (instanced, warm HDR + bloom) and 7 lamps switch on with stutter; guests walk to the host door, door glow pulses; camera glides and pushes into the window; candles, then projector flicker on the poster screen.
- Libs: three, @react-three/fiber, drei (useTexture), @react-three/postprocessing (Bloom, ToneMapping, Vignette) + postprocessing Effect, gsap ScrollTrigger (sticky 520vh wrapper), Lenis from the lab layout.
- Content: latest movie (poster via labImg) and dish names from getLabData(); real menu and poster lists after the story.
- Reduced motion: frameloop demand, fixed p=0.92 (night, all lights on, projector on, camera at the window), no flicker.
- Light tier (phones): dpr [1,1.5], no shadows, no MSAA, 9 blur samples, smaller blur radius, narrow-aspect camera framing.
- Perf (scratch run): 60 fps avg 1440 and 390, no console errors.
