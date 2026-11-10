// GLSL for the projector beam: raymarched volumetric cone, dust motes, poster screen.
export const NOISE = /* glsl */ `
float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y);
}
`

export const beamVert = /* glsl */ `
varying vec3 vWorld;
void main(){
  vec4 w = modelMatrix * vec4(position,1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`

export const beamFrag = /* glsl */ `
uniform mat4 uInv;
uniform float uL, uR0, uK, uSy, uTime, uFlick, uGain, uFrame;
uniform vec3 uBeam, uWarm;
varying vec3 vWorld;
${NOISE}
float dens(vec3 q){
  float z = q.z;
  float R = uR0 + uK*z;
  vec2 c = vec2(q.x, q.y/uSy)/R;
  float r = length(c);
  float edge = smoothstep(1.0, 0.3, r);
  float n = vnoise(c*3.0 + vec2(z*0.03, -uTime*0.05))*0.55 + vnoise(c*4.5 + vec2(3.0 - z*0.05, uTime*0.09))*0.45;
  float streak = 0.2 + 1.6*n*n + 0.3*n;
  float axial = 1.7/(1.0 + z*0.32);
  return edge*streak*axial;
}
void main(){
  vec3 o = (uInv*vec4(cameraPosition,1.0)).xyz;
  vec3 p = (uInv*vec4(vWorld,1.0)).xyz;
  float tF = length(p-o);
  vec3 d = (p-o)/tF;
  float t0 = 0.0, t1 = tF;
  if (abs(d.z) > 1e-4){
    float ta = (0.0-o.z)/d.z, tb = (uL-o.z)/d.z;
    t0 = max(t0, min(ta,tb)); t1 = min(t1, max(ta,tb));
  } else if (o.z < 0.0 || o.z > uL) { t1 = t0; }
  if (t1 <= t0) { gl_FragColor = vec4(0.0); return; }
  float jit = fract(52.9829189*fract(dot(gl_FragCoord.xy + uFrame*7.0, vec2(0.06711056, 0.00583715))));
  float dt = (t1-t0)/float(STEPS);
  float acc = 0.0;
  for (int i=0;i<STEPS;i++){
    float t = t0 + (float(i)+jit)*dt;
    acc += dens(o + d*t)*dt;
  }
  float amt = 1.0 - exp(-acc*0.2*uGain);
  vec3 col = mix(uWarm, uBeam, smoothstep(0.0,0.7,amt)) * amt * uFlick * 1.5;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`

export const dustVert = /* glsl */ `
attribute vec3 aSeed;
uniform float uTime, uScale, uFlick, uPtrR, uL, uR0, uK, uSy;
uniform vec3 uPtr, uAxis;
uniform mat4 uInv;
varying float vA;
void main(){
  vec3 p = position;
  float t = uTime;
  p.x += sin(t*0.13 + aSeed.y*6.283 + p.y*0.7)*0.45 + sin(t*0.07 + p.z*0.4 + aSeed.z*6.0)*0.3;
  p.z += sin(t*0.10 + aSeed.x*6.283 + p.x*0.5)*0.5;
  p.y = 0.3 + mod(p.y - 0.3 - t*(0.02 + 0.05*aSeed.x) + sin(t*0.2 + aSeed.z*6.283)*0.15, 4.6);
  vec3 dv = p - uPtr;
  float dl = length(dv);
  float push = smoothstep(uPtrR, 0.0, dl);
  vec3 nd = dv/(dl+1e-4);
  p += nd*push*push*1.6 + cross(uAxis, nd)*push*0.9;
  vec3 q = (uInv*vec4(p,1.0)).xyz;
  float R = uR0 + uK*q.z;
  float r = length(vec2(q.x, q.y/uSy))/R;
  float inside = smoothstep(1.0, 0.55, r)*step(0.0,q.z)*step(q.z,uL);
  float tw = 0.6 + 0.4*sin(t*(1.0+aSeed.y*3.0) + aSeed.x*30.0);
  vA = (0.025 + inside*(0.5 + 0.9*tw))*uFlick;
  vec4 mv = viewMatrix*vec4(p,1.0);
  float size = (0.014 + 0.026*aSeed.y)*(1.0 + inside*0.5);
  gl_PointSize = clamp(size*uScale/max(0.2,-mv.z), 1.5, 16.0);
  gl_Position = projectionMatrix*mv;
}
`

export const dustFrag = /* glsl */ `
varying float vA;
uniform vec3 uBeam;
void main(){
  float d = length(gl_PointCoord-0.5);
  float a = smoothstep(0.5, 0.05, d)*vA;
  gl_FragColor = vec4(uBeam*a*1.6, 1.0);
  #include <colorspace_fragment>
}
`

export const screenVert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }
`

export const screenFrag = /* glsl */ `
uniform sampler2D uTex, uLeader;
uniform float uTexAspect, uFlick, uFrame, uMode, uLeaderT, uBurst;
uniform vec2 uWeave;
varying vec2 vUv;
${NOISE}
void main(){
  const float SA = 1.846;
  vec2 uv = vUv + uWeave;
  vec3 col;
  if (uMode > 0.5){
    col = texture2D(uLeader, uv).rgb*0.7;
    vec2 c = uv-0.5; c.x *= SA;
    float a = atan(c.y, c.x)/6.2832 + 0.5;
    float sweep = step(fract(uLeaderT*1.7), a);
    col *= mix(1.0, 0.55, sweep*smoothstep(0.7,0.0,length(c)));
  } else {
    float pw = uTexAspect/SA;
    float px = (uv.x - 0.5)/pw + 0.5;
    vec3 fg = texture2D(uTex, vec2(px, uv.y)).rgb;
    float inside = step(0.0,px)*step(px,1.0)*step(0.0,uv.y)*step(uv.y,1.0);
    float cv = (1.0/uTexAspect)/ (1.0/1.0);
    float frac = (1.0/SA)/(1.0/uTexAspect);
    vec3 bg = textureLod(uTex, vec2(uv.x, 0.5 + (uv.y-0.5)*frac), 5.0).rgb*0.55;
    col = mix(bg, fg, inside);
  }
  vec2 hc = (vUv-0.5)*vec2(1.5,2.4);
  float hot = mix(0.5, 1.15, 1.0 - smoothstep(0.0, 1.1, length(hc)));
  col *= hot*uFlick;
  // film scratches and specks, re-rolled per frame
  float line = step(0.9965, h21(vec2(floor(vUv.x*220.0), uFrame)));
  col += line*0.25*smoothstep(0.0,0.15,fract(vUv.y*3.0+uFrame));
  col += step(0.9993, h21(floor(vUv*vec2(320.0,180.0)) + uFrame))*0.45;
  col += uBurst*vec3(1.0,0.93,0.8)*0.9;
  gl_FragColor = vec4(col*1.05, 1.0);
  #include <colorspace_fragment>
}
`
