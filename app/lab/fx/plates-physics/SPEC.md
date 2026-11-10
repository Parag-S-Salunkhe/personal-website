# Plates physics (`/lab/fx/plates-physics`)
- Technique: R3F table top with real rigid-body physics (`@react-three/rapier` 2.2.0). Lathe plates/bowls/glasses, silver cutlery, cylinder/cuboid colliders, tilted spawn so plates bounce, slide and wobble to rest. Candle point lights flicker; one soft-shadow directional light; procedural Lightformer env for silver.
- Scroll: window only, sticky 100dvh stage in a 450vh wrapper, one ScrollTrigger (onUpdate). Beats at 10/25/40/55%: next real dish (from `getLabData().dishes`) drops on a plate with an HTML place card (drei `Html`); at 72% an invisible kinematic bar sweeps the cloth and everything falls off the front edge; fallen bodies are disabled below y=-14. Scrolling back under 62% resets the world (Canvas key) and re-rains. Then a readable dish list.
- Drag: pointerdown on a body makes it kinematic (follows the pointer on a plane at y=0.7), release sets dynamic with the smoothed pointer velocity. `window.__labDemoSteps` tosses the first plate (screen position projected from the camera).
- Pause: `frameloop='never'` and `Physics paused` when the stage is off-screen (`useInView`). Canvas touch-action is pan-y so page scroll still works on phones.
- Reduced motion: all bodies `fixed` at settled positions, physics paused, frameloop demand, 4 dishes shown, no ScrollTrigger.
- Light tier / portrait: fewer bodies (no bowls, spoons, extra glasses), 2 candles, narrow table with a 2x2 dish grid, dpr 1-1.5, 1024 shadow map.
- Rapier/WASM: loads fine under Turbopack via `Physics` + `Suspense` (no config needed, no console errors). CSP: needs `'wasm-unsafe-eval'` in script-src if CSP is ever enforced.
- Perf (scratch record, M4): 60 fps avg and p5 at 1440 and 390, no console errors.
