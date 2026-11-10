# projector-beam
- Technique: a dark home-cinema room in R3F with a volumetric projector cone (additive shader), dust motes, flicker, film grain and vignette post.
- Story: the room from the back row → the camera walks down the beam → real DB posters land on the screen one by one with a countdown leader between → readable programme list.
- Moves: dolly along the beam, flicker at 24 fps, cut on the screen, grain.
- Libs: three, @react-three/fiber, drei, @react-three/postprocessing, gsap ScrollTrigger.
- Reduced motion: a composed still with the beam on and the caption shown.
- Light tier: lower dpr and fewer motes.
- Fix this session: the film caption no longer cross-fades over the title (it waits until the title has gone).
