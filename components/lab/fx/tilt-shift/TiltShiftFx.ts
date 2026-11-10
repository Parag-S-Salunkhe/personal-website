import { BlendFunction, Effect } from 'postprocessing'
import { Uniform } from 'three'

const frag = /* glsl */ `
uniform float focus;
uniform float band;
uniform float reach;
uniform float maxR;
uniform float tilt;
uniform float sat;

float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float d = abs((uv.y - focus) + (uv.x - 0.5) * tilt);
  float t = smoothstep(band, band + reach, d);
  float r = t * maxR * resolution.y / 900.0;
  vec3 col = inputColor.rgb;
  if (r > 0.4) {
    vec3 acc = vec3(0.0);
    float tot = 0.0;
    float rot = ign(gl_FragCoord.xy) * 6.2831853;
    for (int i = 0; i < SAMPLES; i++) {
      float fi = float(i) + 0.5;
      float rr = sqrt(fi / float(SAMPLES));
      float a = fi * 2.39996323 + rot;
      vec2 off = vec2(cos(a), sin(a)) * rr * r / resolution.xy;
      vec3 c = texture2D(inputBuffer, uv + off).rgb;
      float w = 1.0 + 1.2 * max(0.0, dot(c, vec3(0.299, 0.587, 0.114)) - 0.7);
      acc += c * w;
      tot += w;
    }
    col = acc / tot;
  }
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l), col, sat);
  outputColor = vec4(col, inputColor.a);
}
`

/** Tilt-shift: flat focus band at screen height `focus`, golden-spiral blur growing above and below it. */
export class TiltShiftFx extends Effect {
  constructor(samples = 18) {
    super('TiltShiftFx', frag, {
      blendFunction: BlendFunction.NORMAL,
      defines: new Map([['SAMPLES', String(samples)]]),
      uniforms: new Map<string, Uniform>([
        ['focus', new Uniform(0.4)],
        ['band', new Uniform(0.08)],
        ['reach', new Uniform(0.34)],
        ['maxR', new Uniform(15)],
        ['tilt', new Uniform(0.05)],
        ['sat', new Uniform(1.18)],
      ]),
    })
  }
  set(k: 'focus' | 'band' | 'reach' | 'maxR' | 'tilt' | 'sat', v: number) {
    ;(this.uniforms.get(k) as Uniform).value = v
  }
}
