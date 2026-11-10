# blender-hero
- Technique: a hero object modelled in Blender (own Python script, headless Blender 5.3, 31 named parts, ~4k tris, 370 KB GLB) and lit in R3F.
- Story (620vh sticky stage): turntable hero → exploded view with five numbered part captions → snap back with overshoot → lamp strikes with a stutter → camera swings behind the projector, beam with dust motes, real DB posters cut in on the screen at 24 fps flicker → readable list.
- Moves: orbit, exploded view (follow-through on each part), overshoot and settle, flicker, match cut on the screen, breathing push.
- Libs: three, @react-three/fiber, drei (useGLTF, useTexture, ContactShadows), @react-three/postprocessing (bloom, noise, vignette), gsap ScrollTrigger.
- Reduced motion: a still at the projecting moment (assembled, beam on, second poster on screen, caption visible).
- Light tier: dpr ≤ 1.5, no MSAA, 260 motes (700 full), wider FOV and camera pulled back for portrait.
- Blender MCP was down (add-on unregistered); the model was built headlessly from `.claude/redesign-v3/blender/projector_build.py`. See blender/NOTES.md.
