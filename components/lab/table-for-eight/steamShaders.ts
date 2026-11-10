// Steam shader adapted for the table (billboards, origin at the base). Copied from the steam-shader experiment.
const noise = /* glsl */ `
float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(hash21(i), hash21(i+vec2(1.,0.)), f.x), mix(hash21(i+vec2(0.,1.)), hash21(i+vec2(1.,1.)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.; float a = .5; for (int i = 0; i < 4; i++) { v += a * vnoise(p); p = p * 2.03 + 11.7; a *= .5; } return v; }
`

export const billboardVert = /* glsl */ `
uniform vec2 uSize;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(0., 0., 0., 1.);
  mv.xy += vec2(position.x, position.y + 0.5) * uSize;
  gl_Position = projectionMatrix * mv;
}
`

export const steamFrag = /* glsl */ `
uniform float uTime; uniform float uGrow; uniform float uSeed; uniform float uInt; uniform vec3 uColor;
varying vec2 vUv;
${noise}
void main() {
  vec2 uv = vUv;
  float y = uv.y;
  float t = uTime * 0.42 + uSeed * 13.0;
  vec2 p = vec2(uv.x * 2.4 + uSeed * 5.0, y * 1.7 - t);
  vec2 w = vec2(fbm(p * 1.25 + vec2(0., t * 0.25)), fbm(p * 1.25 + vec2(5.2, 1.3) - t * 0.12)) - 0.5;
  float sway = sin(y * 5.5 + t * 2.6 + uSeed * 9.0) * 0.12 * y + w.x * 0.65 * y;
  float cx = (uv.x - 0.5) - sway;
  float reach = mix(0.35, 1.0, uGrow);
  float width = mix(0.05, 0.22, smoothstep(0., 1., y / reach)) * (0.55 + 0.7 * uGrow);
  float column = 1. - smoothstep(width * 0.25, width, abs(cx));
  float n = fbm(p + w * 1.9);
  float dens = smoothstep(0.5, 0.78, n + 0.12) * column;
  float vert = smoothstep(0., 0.10, y) * (1. - smoothstep(reach * 0.12, reach * 0.75, y));
  float a = dens * vert * uInt * uGrow;
  gl_FragColor = vec4(uColor, a * 0.32);
}
`
