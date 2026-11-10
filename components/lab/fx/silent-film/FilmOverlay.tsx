'use client'
import { useEffect, useRef } from 'react'

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uF;uniform float uFl;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
void main(){
  vec2 px=gl_FragCoord.xy;vec2 uv=px/uRes;float asp=uRes.x/uRes.y;
  float g1=h(px+uF*17.13);float g2=h(floor(px/2.)+uF*3.71);
  float n=(g1*.45+g2*.55)-.5;
  float aw=max(n,0.)*.55;float ab=max(-n,0.)*.7;
  // vignette + brown burn at the edges
  vec2 c=(uv-.5)*vec2(asp*.9,1.);float d=length(c);
  float v=smoothstep(.42,1.0,d);
  float wob=.8+.2*h(vec2(floor(uv.y*6.),floor(uF/3.)));
  ab+=v*.62*wob;
  // vertical scratches
  for(int i=0;i<4;i++){
    float id=float(i);float seed=floor(uF/(2.+id));
    float x=h(vec2(seed,id+1.3));float on=step(.5,h(vec2(seed,id+9.1)));
    float line=(1.-smoothstep(0.,1.6/uRes.x,abs(uv.x-x)))*on;
    line*=step(.25,h(vec2(floor(uv.y*9.),seed+id)));
    aw+=line*.55;
  }
  // dust specks and a rare hair
  for(int i=0;i<7;i++){
    float id=float(i);
    vec2 p=vec2(h(vec2(uF,id)),h(vec2(id+7.,uF+3.)))*uRes;
    float on=step(.45,h(vec2(uF+id,2.2)));
    float sz=1.5+h(vec2(id,uF))*4.;
    vec2 q=px-p;q.x*=1.+h(vec2(id,5.))*1.5;
    float r=length(q)+ (h(floor(q/1.5)+id)-.5)*1.6;
    ab+=(1.-smoothstep(sz-1.2,sz,r))*on*.8;
  }
  float hairOn=step(.93,h(vec2(floor(uF/6.),4.4)));
  vec2 hp=vec2(.2+.6*h(vec2(floor(uF/6.),1.)),.5);
  float hair=(1.-smoothstep(0.,1.4/uRes.x,abs(uv.x-hp.x-.04*sin(uv.y*9.))))*step(abs(uv.y-hp.y),.1)*hairOn;
  ab+=hair*.7;
  ab+=uFl;
  aw=clamp(aw,0.,1.);ab=clamp(ab,0.,1.);
  float a=aw+ab*(1.-aw);
  vec3 col=vec3(.96,.9,.78)*aw+vec3(.12,.06,.0)*ab*(1.-aw)*.5;
  gl_FragColor=vec4(col,a);
}`

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s) }

/**
 * Full-viewport film layer: a WebGL grain / scratch / dust / vignette overlay (updates at 18 fps),
 * plus gate weave and exposure flicker applied to the `gate` element. Reduced motion: one static frame.
 */
export default function FilmOverlay({ gate, stage, reduced }: { gate: React.RefObject<HTMLElement | null>; stage: React.RefObject<HTMLElement | null>; reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false })
    if (!gl) return
    const mk = (t: number, s: string) => { const sh = gl.createShader(t)!; gl.shaderSource(sh, s); gl.compileShader(sh); return sh }
    const prog = gl.createProgram()!
    gl.attachShader(prog, mk(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(prog, 'uRes')
    const uF = gl.getUniformLocation(prog, 'uF')
    const uFl = gl.getUniformLocation(prog, 'uFl')

    const resize = () => {
      const s = window.innerWidth < 768 ? 0.75 : 0.55
      cv.width = Math.max(2, Math.round(window.innerWidth * s))
      cv.height = Math.max(2, Math.round(window.innerHeight * s))
      gl.viewport(0, 0, cv.width, cv.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = (frame: number, fl: number) => {
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(uRes, cv.width, cv.height)
      gl.uniform1f(uF, frame)
      gl.uniform1f(uFl, fl)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const FILTER = (b: number) => `sepia(0.82) saturate(0.85) contrast(1.12) brightness(${b.toFixed(3)})`
    const g = gate.current
    if (reduced) {
      draw(7, 0)
      if (g) { g.style.filter = FILTER(1); g.style.transform = '' }
      return () => window.removeEventListener('resize', resize)
    }

    let raf = 0
    let last = -1
    let visible = true
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    if (stage.current) io.observe(stage.current)
    const t0 = performance.now()
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      const frame = Math.floor(((now - t0) / 1000) * 18)
      if (frame === last) return
      last = frame
      // flicker: base wobble plus occasional bright / dim frames
      const spike = hash(frame * 3.3) > 0.9 ? (hash(frame * 1.7) - 0.5) * 0.22 : 0
      const b = 0.97 + (hash(frame) - 0.5) * 0.09 + spike
      draw(frame, Math.max(0, (0.5 - b) * 0 + (1 - b) * 0.0) + (spike < 0 ? -spike * 0.4 : 0))
      if (g) {
        const jump = hash(frame * 0.37) > 0.94 ? 4 : 0
        const dx = (hash(frame + 11) - 0.5) * 3.2
        const dy = (hash(frame + 29) - 0.5) * 2.4 + jump * (hash(frame * 2.1) - 0.5)
        const rot = (hash(frame + 53) - 0.5) * 0.12
        g.style.transform = `translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0) rotate(${rot.toFixed(3)}deg) scale(1.012)`
        g.style.filter = FILTER(b)
      }
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [gate, stage, reduced])

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-40 h-full w-full" />
}
