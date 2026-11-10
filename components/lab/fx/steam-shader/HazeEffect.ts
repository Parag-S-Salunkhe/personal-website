// Screen-space heat haze: a postprocessing Effect that bends the image (mainUv) inside up to three rising columns.
import { Effect } from 'postprocessing'
import { Uniform, Vector4 } from 'three'

const frag = /* glsl */ `
uniform float uTime;
uniform float uAspect;
uniform vec4 uSrc[3];
uniform float uAmp[3];
float hh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(hh(i), hh(i+vec2(1.,0.)), f.x), mix(hh(i+vec2(0.,1.)), hh(i+vec2(1.,1.)), f.x), f.y); }
void mainUv(inout vec2 uv) {
  vec2 off = vec2(0.);
  for (int i = 0; i < 3; i++) {
    float a = uAmp[i];
    if (a < 0.0005) continue;
    vec4 s = uSrc[i];
    vec2 d = (uv - s.xy) / s.zw;
    float mask = (1. - smoothstep(0.3, 1., abs(d.x))) * smoothstep(-0.1, 0.25, d.y) * (1. - smoothstep(0.45, 1., d.y));
    vec2 q = vec2(uv.x * uAspect * 11., uv.y * 8. - uTime * 1.9);
    float n1 = vn(q) + 0.5 * vn(q * 2.3 + 7.1) - 0.75;
    float n2 = vn(q * 1.1 + 31.4) - 0.5;
    off += vec2(n1, n2 * 0.7) * a * mask;
  }
  uv += off;
}
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  outputColor = inputColor;
}
`

export class HazeEffect extends Effect {
  constructor() {
    super('HazeEffect', frag, {
      uniforms: new Map<string, Uniform>([
        ['uTime', new Uniform(0)],
        ['uAspect', new Uniform(1)],
        ['uSrc', new Uniform([new Vector4(), new Vector4(), new Vector4()])],
        ['uAmp', new Uniform([0, 0, 0])],
      ]),
    })
  }
  get time() { return this.uniforms.get('uTime')!.value as number }
  set time(v: number) { this.uniforms.get('uTime')!.value = v }
  get aspect() { return this.uniforms.get('uAspect')!.value as number }
  set aspect(v: number) { this.uniforms.get('uAspect')!.value = v }
  get src() { return this.uniforms.get('uSrc')!.value as Vector4[] }
  get amp() { return this.uniforms.get('uAmp')!.value as number[] }
}
