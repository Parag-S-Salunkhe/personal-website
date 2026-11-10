# infinite-zoom (/lab/fx/infinite-zoom)
- Technique: Droste-style endless zoom in canvas 2D. Five nested illustrated levels (street, lit room behind the window, table top, plate with a drawn dish, home-cinema wall with a screen showing the street). Each level holds the next in a centre portal at 1/K (K=3.6); camera scale is K^frac(z), so speed is constant and level N+1 wraps to level 0 with no seam.
- Moves: sticky 500vh stage, one ScrollTrigger writes progress, z damped on the GSAP ticker (z 0.3 to 8, about 1.6 loops, ends on the plate). Clip portal expands (circle/rect) near each level's end so it fills the screen. Parallax: foreground layer per level scales by S^0.3 (lamp post, curtains, bokeh, seats). Radial streaks + vignette scale with zoom velocity; a ghost frame at z - v*0.05 gives motion blur (full tier only).
- Real content: two DB posters in the cinema level (portrait: one), dish name + category/rating on the plate caption (dish colours seeded from its id, item count from its ingredients), movie title caption; menu and poster list after the story.
- Libs: gsap ScrollTrigger + @gsap/react, canvas 2D, next/font (Gilda Display, Hanken Grotesk).
- Reduced motion: no scrub, static Droste still at z=0.55 (street, room, table, plate, film frame all visible nested), 100dvh.
- Mobile/light: portrait layout (posters above screen, curtains narrower, lamp inside frame), DPR cap 1.5, no ghost pass.
- Perf (scratch record): 1440 avg 57 fps, 390 avg 60 fps, no long tasks, no console errors.
