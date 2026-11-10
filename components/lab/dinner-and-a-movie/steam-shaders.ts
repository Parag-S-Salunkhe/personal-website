// GLSL for the steam planes and the candle flame. Both billboard in the vertex shader (origin at the base).
const steamNoise = /* glsl */ `
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
export const haloVert = /* glsl */ `
uniform vec2 uSize;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(0., 0., 0., 1.);
  mv.xy += position.xy * uSize;
  gl_Position = projectionMatrix * mv;
}
`

export const steamFrag = /* glsl */ `
uniform float uTime; uniform float uGrow; uniform float uSeed; uniform float uInt; uniform vec3 uColor;
varying vec2 vUv;
${steamNoise}
void main() {
  vec2 uv = vUv;
  float y = uv.y;
  float t = uTime * 0.42 + uSeed * 13.0;
  vec2 p = vec2(uv.x * 2.4 + uSeed * 5.0, y * 1.7 - t);
  // curl-ish domain warp: two offset fbm fields push the sample sideways as it rises
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


export const skyVert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }
`
export const skyFrag = /* glsl */ `
uniform vec3 uTop, uHorizon, uGlow; uniform float uNight, uTime;
varying vec2 vUv;
float hs(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  float y = vUv.y;
  vec3 col = mix(uHorizon, uTop, smoothstep(0.15, 0.95, y));
  col += uGlow * exp(-pow((y - 0.22) * 4.0, 2.0)) * (1.0 - uNight * 0.8);
  vec2 g = vUv * vec2(260.0, 140.0);
  float star = step(0.9965, hs(floor(g))) * smoothstep(0.35, 0.8, y) * uNight * (0.6 + 0.4 * sin(uTime * 2.0 + hs(floor(g)) * 50.0));
  col += star;
  // rooftops
  float x = vUv.x * 14.0;
  float roof = 0.1 + 0.05 * floor(hs(vec2(floor(x), 1.0)) * 4.0) + 0.02 * step(0.7, hs(vec2(floor(x * 2.0), 3.0)));
  float sil = 1.0 - step(roof, y);
  vec3 houseCol = mix(vec3(0.07, 0.06, 0.1), vec3(0.02, 0.03, 0.06), uNight);
  vec2 wc = vec2(vUv.x * 140.0, y * 80.0);
  float win = step(0.86, hs(floor(wc))) * step(y, roof - 0.01) * smoothstep(0.1, 0.6, uNight + 0.15);
  col = mix(col, houseCol + vec3(1.0, 0.72, 0.35) * win * 0.9, sil);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`
