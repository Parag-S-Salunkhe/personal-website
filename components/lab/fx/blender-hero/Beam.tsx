'use client'
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { bh, hash } from './types'
import type { Ctl } from './Projector'
import type { Film } from './types'

export const LENS = new THREE.Vector3(0, 0.25, 0.45)
export const SCREEN = new THREE.Vector3(0, 1.05, 4.2)
export const SCREEN_H = 2.25
const BEAM_LEN = LENS.distanceTo(SCREEN)

const beamVert = /* glsl */ `
varying float vT; varying vec3 vN; varying vec3 vV; varying float vAng;
void main(){
  vT = position.z;
  vAng = atan(position.y, position.x);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`
const beamFrag = /* glsl */ `
uniform float uTime; uniform float uOn; uniform float uFlick;
varying float vT; varying vec3 vN; varying vec3 vV; varying float vAng;
void main(){
  float f = abs(dot(normalize(vN), normalize(vV)));
  float edge = pow(f, 1.4);
  float body = smoothstep(0.0, 0.07, vT) * (1.0 - 0.45 * vT);
  float streak = 0.72 + 0.28 * sin(vAng * 11.0 + uTime * 0.5) * sin(vT * 8.0 - uTime * 0.9);
  float a = edge * body * streak * uOn * uFlick * 0.5;
  vec3 col = mix(vec3(1.0, 0.62, 0.26), vec3(1.0, 0.95, 0.82), smoothstep(0.0, 0.7, vT));
  gl_FragColor = vec4(col * a, a);
}`
const moteVert = /* glsl */ `
attribute vec4 aSeed; uniform float uTime; uniform float uSize; uniform float uPR;
varying float vTw;
void main(){
  vec3 p = position;
  p += vec3(sin(uTime*0.35*aSeed.x + aSeed.w*6.28), cos(uTime*0.28*aSeed.y + aSeed.w*9.0), sin(uTime*0.2*aSeed.z + aSeed.w*3.0)) * 0.06;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vTw = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.8 + aSeed.z) + aSeed.w * 40.0));
  gl_PointSize = uSize * uPR * (0.6 + aSeed.x) / max(0.5, -mv.z) ;
  gl_Position = projectionMatrix * mv;
}`
const moteFrag = /* glsl */ `
uniform float uOn; varying float vTw;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vTw * uOn;
  a *= 0.55;
  gl_FragColor = vec4(vec3(1.0, 0.92, 0.75) * a, a);
}`

export function Beam({ ctl, count }: { ctl: MutableRefObject<Ctl>; count: number }) {
  const grp = useRef<THREE.Group>(null)
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(1, 0.02, 1, 48, 1, true)
    g.rotateX(Math.PI / 2); g.translate(0, 0, 0.5)
    return g
  }, [])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: beamVert, fragmentShader: beamFrag, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uOn: { value: 0 }, uFlick: { value: 1 } },
  }), [])
  const motes = useMemo(() => {
    const pos = new Float32Array(count * 3), seed = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      const t = 0.05 + 0.95 * hash(i * 1.7), ang = hash(i * 3.1) * Math.PI * 2, r = Math.sqrt(hash(i * 5.3)) * 0.92 * t
      pos.set([Math.cos(ang) * r * 0.95, Math.sin(ang) * r * 1.4, t * BEAM_LEN], i * 3)
      seed.set([hash(i * 7.1), hash(i * 11.3), hash(i * 13.7), hash(i * 17.9)], i * 4)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4))
    return g
  }, [count])
  const moteMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: moteVert, fragmentShader: moteFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uOn: { value: 0 }, uSize: { value: 2.2 }, uPR: { value: 1 } },
  }), [])

  useEffect(() => { grp.current?.lookAt(SCREEN) }, [])
  useEffect(() => () => { geo.dispose(); mat.dispose(); motes.dispose(); moteMat.dispose() }, [geo, mat, motes, moteMat])

  useFrame((state) => {
    const c = ctl.current, t = state.clock.elapsedTime
    mat.uniforms.uTime.value = t; mat.uniforms.uOn.value = c.beam; mat.uniforms.uFlick.value = c.flick
    moteMat.uniforms.uTime.value = t; moteMat.uniforms.uOn.value = c.beam * c.flick; moteMat.uniforms.uPR.value = state.gl.getPixelRatio() * 7
    if (grp.current) grp.current.visible = c.beam > 0.003
  })

  return (
    <group ref={grp} position={LENS}>
      <mesh geometry={geo} material={mat} scale={[0.95, 1.4, BEAM_LEN]} renderOrder={5} />
      <points geometry={motes} material={moteMat} frustumCulled={false} renderOrder={6} />
    </group>
  )
}

export function Screen({ films, ctl }: { films: Film[]; ctl: MutableRefObject<Ctl> }) {
  const tex = useTexture(films.map((f) => f.posterUrl)) as THREE.Texture[]
  const list = Array.isArray(tex) ? tex : [tex]
  const mesh = useRef<THREE.Mesh>(null)
  const state = useRef({ shown: 0, cutUntil: 0, last: -1 })
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false }), [])
  useEffect(() => { list.forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true }); mat.map = list[0] ?? null; mat.needsUpdate = true }, [list, mat])
  useEffect(() => () => mat.dispose(), [mat])

  useFrame((s) => {
    const c = ctl.current, st = state.current, t = s.clock.elapsedTime
    if (st.last !== bh.idx) {
      if (st.last >= 0 && !c.reduced) st.cutUntil = t + 0.38
      st.last = bh.idx; st.shown = bh.idx
      mat.map = list[bh.idx] ?? list[0] ?? null; mat.needsUpdate = true
    }
    let k = c.beam * 0.92 * c.flick
    if (t < st.cutUntil) { const n = Math.floor(t * 24); k *= hash(n * 1.3) > 0.45 ? 1.15 : 0.05 }
    mat.color.setScalar(Math.max(0, k))
  })

  const w = SCREEN_H / 1.5
  return (
    <group position={SCREEN} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0, -0.03]}><boxGeometry args={[w + 0.14, SCREEN_H + 0.14, 0.04]} /><meshStandardMaterial color="#D8A84E" metalness={0.9} roughness={0.35} /></mesh>
      <mesh ref={mesh} material={mat}><planeGeometry args={[w, SCREEN_H]} /></mesh>
    </group>
  )
}
