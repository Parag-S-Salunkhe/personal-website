# illusions (/lab/fx/illusions)
- Technique: (1) anamorphic word "Dinner": 80 box fragments, each placed on a ray from one sweet-spot camera and scaled by its distance, so they only align from that point; scroll flies the camera through it (reads about +-5% of scroll). (2) 2.5D room: 8 painted canvas depth planes (z -26..+2.2) + real poster (labImg) + menu from DB dishes, with a dolly zoom (camera dollies 16 to 4.5, FOV 2*atan(k/d) so the cloche keeps its size) and pointer + scroll sway parallax.
- Moves: camera path through a point, tile settle (drift scaled by 1 - focus), candle-light veil cut between illusions, dolly zoom, parallax, flame flicker, bokeh foreground.
- Libs: three, @react-three/fiber, drei (useTexture), gsap ScrollTrigger (+ kit Lenis), @gsap/react. Fonts Gilda Display + Hanken Grotesk, read by canvas from the CSS variables.
- Reduced motion: word aligned (camera at the sweet spot), then a static room still; no scrub, no pointer, 200dvh wrapper.
- Mobile/light: portrait layout (wider FOV, word fits 90% width, menu above the cloche), dpr 1-1.5, fewer motes.
- Perf (scratch run): 60 fps avg at 1440 and 390, no console errors. All textures pre-uploaded (initTexture) to avoid a hitch at the cut.
- Demo: window.__labDemoSteps moves the pointer for parallax.
