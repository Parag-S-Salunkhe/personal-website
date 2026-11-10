# webgl-gallery
- Technique: one R3F canvas (perspective camera, 1 unit = 1px) in a sticky stage; ScrollTrigger progress (damped) slides two rows of shader planes in opposite directions. No inner scroller.
- Shader: vertex bend/curl from smoothed scroll velocity + idle wave; fragment RGB split, pointer-centred liquid ripple (uPtr/uHov), brass/candle edge.
- Row 1 = real posters (labImg, Cinema palette); row 2 = canvas-drawn menu cards (Table palette) from dishes.
- Hover: spring scale (stiffness 190) + z lift; window.__labDemoSteps hovers 4 posters and 3 cards.
- Libs: three, @react-three/fiber, gsap + ScrollTrigger + @gsap/react (Lenis comes from the lab layout).
- Mobile (<768px): single vertical column (4 posters + 4 cards) translated by scroll, velocity-driven distortion; dpr [1,1.5] on light tier.
- Reduced motion: no canvas; server-rendered static grid of posters and text cards, no sticky.
- Perf: 60 fps avg at 1440 and 390 (headless), no console errors; canvas pauses off-screen (IntersectionObserver).
