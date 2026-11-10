export const vert = /* glsl */ `
uniform float uVel;
uniform float uTime;
uniform float uHov;
varying vec2 vUv;
varying float vZ;
void main() {
  vUv = uv;
  vec3 p = position;
  float arc = sin(uv.x * 3.14159) * 0.6 + sin(uv.y * 3.14159) * 0.6;
  float z = uVel * 190.0 * arc;
  // curl: the leading edge peels as the gallery accelerates
  z += uVel * 120.0 * (uv.x - 0.5) * (uv.y - 0.5) * 2.0;
  p.y += uVel * 0.05 * (uv.x - 0.5);
  // idle wave
  z += sin(uv.x * 4.0 + uTime * 1.3) * 5.0 + sin(uv.y * 3.0 + uTime * 0.9) * 4.0;
  z += uHov * 18.0;
  p.z = z;
  vZ = z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`

export const frag = /* glsl */ `
uniform sampler2D uTex;
uniform vec2 uPtr;
uniform float uHov;
uniform float uVel;
uniform float uTime;
uniform float uAspect;
uniform vec3 uEdge;
uniform vec3 uTint;
varying vec2 vUv;
varying float vZ;
void main() {
  vec2 uv = vUv;
  vec2 asp = vec2(uAspect, 1.0);
  vec2 dv = (uv - uPtr) * asp;
  float d = length(dv);
  float rip = sin(d * 38.0 - uTime * 5.5) * exp(-d * 5.0) * uHov;
  vec2 dir = dv / (d + 1e-4) / asp;
  vec2 off = dir * rip * 0.035;
  off.x += sin(uv.y * 7.0 + uTime * 1.2) * 0.004;
  off.y += uVel * 0.012 * sin(uv.x * 6.0);
  float split = 0.003 + abs(uVel) * 0.022 + abs(rip) * 0.03 + uHov * 0.004;
  vec2 suv = clamp(uv + off, 0.001, 0.999);
  float r = texture2D(uTex, clamp(suv + vec2(split, 0.0), 0.0, 1.0)).r;
  vec4 g = texture2D(uTex, suv);
  float b = texture2D(uTex, clamp(suv - vec2(split, 0.0), 0.0, 1.0)).b;
  vec3 col = vec3(r, g.g, b);
  col = mix(col, col * uTint, 0.22);
  col += uEdge * max(rip, 0.0) * 0.25;
  float e = min(min(vUv.x, 1.0 - vUv.x) * uAspect, min(vUv.y, 1.0 - vUv.y));
  col = mix(uEdge, col, smoothstep(0.012, 0.016, e));
  col *= 1.0 - clamp(-vZ, 0.0, 60.0) * 0.004;
  col *= 0.9 + 0.1 * smoothstep(0.0, 0.5, vUv.y);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`
