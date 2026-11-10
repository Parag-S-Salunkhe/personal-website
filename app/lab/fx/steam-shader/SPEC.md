# steam-shader (/lab/fx/steam-shader)
- Technique: R3F table scene (painted-canvas food on lathe plates/bowls, seeded per dish from DB name+category), GLSL steam (6 billboarded planes, fbm + domain-warp curl), candle flame (teardrop SDF, flicker, blue core, additive halo, flickering point light), custom postprocessing HazeEffect (mainUv distortion in up to 3 rising columns: two plates + flame), Bloom, Vignette, ACES.
- Moves: sticky 500vh stage; one ScrollTrigger writes progress, damped in useFrame. Plate-change = slide + turn + lift (pure function of progress, scrubbable both ways), steam regrows per dish. Last dish cools from p 0.55 (steam shrinks, haze fades, caption Hot/Warm/Cooling), candle level drops (wax shortens, flame shrinks, light dims). Ends on a server-rendered menu list of all dishes.
- Libs: three, @react-three/fiber, @react-three/postprocessing + postprocessing, gsap ScrollTrigger + @gsap/react.
- Reduced motion: frameloop demand, time frozen at 4.2s (steam mid-curl), first dish, no scrub, story height auto.
- Light tier: 3 steam planes, dpr [1,1.5], composer resolutionScale 0.6, no MSAA, lower bloom.
- Perf (recorder, M4): 60 fps avg 1440 and 390, no console errors. frameloop pauses off-screen.
