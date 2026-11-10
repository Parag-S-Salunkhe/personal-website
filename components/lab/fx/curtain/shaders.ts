// GLSL for the velvet curtain halves and the scalloped valance (one program, uKind switches).
export const curtainVert = /* glsl */ `
uniform float uTime, uOpen, uHW, uTop, uH, uSide, uKind, uPE, uZ, uFoldN, uSway, uVH;
uniform vec2 uPointer;
varying vec3 vP; varying vec3 vN; varying vec2 vUv; varying float vFold;
const float TAU = 6.2831853;

float foldF(float u, float v) {
  float ph = u * uFoldN * TAU + sin(v * 2.6 + u * 4.0) * 0.5;
  return sin(ph) * 0.6 + sin(ph * 2.31 + 1.7) * 0.28 + sin(ph * 4.7 + 0.6) * 0.12;
}

vec3 cloth(float u, float v) {
  float oo = uOpen;
  float g = uHW * mix(0.14, 0.31, v);           // gathered width: tighter at the tie-back (bottom)
  float x = mix(uHW * u, uHW - g * (1.0 - u), oo);
  float y = uTop - (1.0 - v) * uH;
  y += oo * 0.40 * uH * pow(1.0 - v, 1.7) * pow(1.0 - u, 1.3); // swag: leading hem sweeps up
  float amp = (0.085 + 0.05 * oo) * (0.75 + 0.25 * (1.0 - v));
  float z = amp * foldF(u, v);
  float t = uTime;
  z += uSway * (sin(t * 0.7 + v * 2.2 + u * 3.0) * 0.035 + sin(t * 1.3 + u * 7.0) * 0.012) * (1.0 - v) * (1.0 + (1.0 - oo));
  vec2 wp = vec2(uSide * x, y);
  float d = length(wp - uPointer);
  float rip = sin(d * 9.0 - t * 7.0) * exp(-d * 1.5) * uPE;
  z += rip * 0.20;
  return vec3(uSide * x + rip * 0.02, y, z);
}

vec3 valance(float u, float v) {
  float x = (u - 0.5) * 2.0 * uHW * 1.04;
  float y = uTop + 0.1 - (1.0 - v) * uVH;
  float z = 0.045 * sin(u * uHW * 11.0) + 0.02 * sin(u * uHW * 27.0 + 1.0) + uSway * 0.012 * sin(uTime * 0.9 + u * 5.0) * (1.0 - v);
  vec2 wp = vec2(x, y);
  float d = length(wp - uPointer);
  z += sin(d * 9.0 - uTime * 7.0) * exp(-d * 1.5) * uPE * 0.10;
  return vec3(x, y, z);
}

vec3 surf(float u, float v) { return uKind > 0.5 ? valance(u, v) : cloth(u, v); }

void main() {
  float u = uv.x, v = uv.y, e = 0.0025;
  vec3 P = surf(u, v), Pu = surf(u + e, v), Pv = surf(u, v + e);
  vec3 N = normalize(cross(Pu - P, Pv - P)) * (uKind > 0.5 ? 1.0 : uSide);
  P.z += uZ;
  vP = P; vN = N; vUv = uv;
  vFold = uKind > 0.5 ? sin(u * uHW * 11.0) : foldF(u, v);
  gl_Position = projectionMatrix * viewMatrix * vec4(P, 1.0);
}
`

export const curtainFrag = /* glsl */ `
uniform vec3 cVelvet, cCurtain, cBrass, cTung, cBeam;
uniform float uTime, uHW, uTop, uH, uKind, uHouse, uScal, uOpen;
uniform vec2 uSpot;
varying vec3 vP; varying vec3 vN; varying vec2 vUv; varying float vFold;

void main() {
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vP);
  float v = vUv.y;
  float crest = smoothstep(-0.35, 0.95, vFold);

  vec2 sp = vec2(uSpot.x, uTop - uH * 0.3);
  float r = clamp(uHW * 0.5, 1.3, 2.4);
  float dd = length((vP.xy - sp) * vec2(0.7, 0.55)) / r * 1.4;
  float pool = exp(-dd * dd);
  vec3 L = normalize(vec3(sp.x, uTop + 1.5, 3.2) - vP);
  float diff = max(dot(N, L), 0.0);
  float key = diff * pool;

  float amb = 0.30 + 0.45 * uHouse;
  vec3 base = mix(cVelvet, cCurtain, crest * 0.85);
  vec3 col = base * (amb + 1.7 * key + 0.35 * diff * uHouse);
  col += cTung * pool * diff * crest * 0.22;
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);
  vec3 sheenC = mix(vec3(0.62, 0.14, 0.22), cTung * 0.75, pool);
  col += fres * sheenC * (0.30 + crest * 0.7) * (0.35 + 0.9 * pool + 0.7 * uHouse);
  col *= 0.95 + 0.05 * sin(vUv.x * uHW * 420.0);

  if (uKind > 0.5) {
    // valance: scalloped lower edge, brass trim
    float f = abs(fract(vUv.x * uScal) * 2.0 - 1.0);
    float bound = 0.26 * pow(f, 2.0);
    if (v < bound) discard;
    float trim = 1.0 - smoothstep(0.0, 0.035, v - bound);
    float topband = smoothstep(0.90, 0.93, v);
    float topline = (1.0 - smoothstep(0.0, 0.012, abs(v - 0.88)));
    vec3 brass = cBrass * (0.65 + 1.1 * pool + 0.4 * uHouse) * (0.8 + 0.4 * sin(vUv.x * uHW * 60.0 + v * 9.0));
    brass += cBeam * pow(max(dot(reflect(-L, N), V), 0.0), 12.0) * 0.8;
    col = mix(col, brass, max(max(trim, topband), topline * 0.8));
    col *= 0.9;
  } else {
    // shadow under the valance
    col *= 1.0 - 0.5 * smoothstep(0.60, 0.80, v);
    // brass fringe at the hem
    float strand = sin(vUv.x * uHW * 190.0);
    if (v < 0.032 && strand < -0.55) discard;
    float fr = 1.0 - smoothstep(0.022, 0.05, v);
    vec3 fc = cBrass * (0.45 + 0.9 * pool + 0.3 * uHouse) * (0.7 + 0.3 * strand);
    col = mix(col, fc, fr * 0.8);
  }
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`

export const beamVert = /* glsl */ `
varying float vT; varying vec3 vN; varying vec3 vV;
void main() {
  vT = clamp(-position.y / 6.0, 0.0, 1.0);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - w.xyz);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`
export const beamFrag = /* glsl */ `
uniform vec3 uColor; uniform float uI;
varying float vT; varying vec3 vN; varying vec3 vV;
void main() {
  float edge = pow(abs(dot(normalize(vN), normalize(vV))), 1.6);
  float a = (1.0 - vT) * 0.55 * edge * uI;
  gl_FragColor = vec4(uColor * a, a);
}
`
