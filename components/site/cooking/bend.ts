// Ported from components/lab/fx/popup-book/bend.ts
import * as THREE from 'three'

/** Shared uniforms for one page: it turns by `uTheta` about the spine and curls by `uK` (1/radius). */
export type BendU = { uTheta: { value: number }; uK: { value: number }; uBase: { value: THREE.Vector3 } }
export const makeBend = (): BendU => ({ uTheta: { value: 0 }, uK: { value: 0 }, uBase: { value: new THREE.Vector3() } })

const FN = /* glsl */ `
uniform float uTheta; uniform float uK; uniform vec3 uBase;
vec3 bendPt(vec3 wp) {
  vec3 l = wp - uBase;
  float ph = uTheta + uK * l.x;
  vec2 b = abs(uK) < 1e-4 ? vec2(l.x * cos(uTheta), l.x * sin(uTheta)) : vec2(sin(ph) - sin(uTheta), cos(uTheta) - cos(ph)) / uK;
  return uBase + vec3(b + l.y * vec2(-sin(ph), cos(ph)), l.z);
}
`
const PROJ = /* glsl */ `
vec4 mvPosition = vec4( transformed, 1.0 );
vec3 bendWP = bendPt( ( modelMatrix * mvPosition ).xyz );
mvPosition = viewMatrix * vec4( bendWP, 1.0 );
gl_Position = projectionMatrix * mvPosition;
`
const NORM = /* glsl */ `
vec3 transformedNormal = objectNormal;
{
  vec3 wpN = ( modelMatrix * vec4( position, 1.0 ) ).xyz - uBase;
  float phN = uTheta + uK * wpN.x;
  vec3 nw = normalize( mat3( modelMatrix ) * objectNormal );
  nw = vec3( nw.x * cos( phN ) - nw.y * sin( phN ), nw.x * sin( phN ) + nw.y * cos( phN ), nw.z );
  transformedNormal = normalize( mat3( viewMatrix ) * nw );
}
#ifdef FLIP_SIDED
  transformedNormal = - transformedNormal;
#endif
`
const WP = 'vec4 worldPosition = vec4( bendWP, 1.0 );'

/** Patch a three material so its vertices follow the page: turn + curl are done in the vertex shader. */
export function bendify<T extends THREE.Material>(m: T, u: BendU): T {
  const isDepth = m instanceof THREE.MeshDepthMaterial
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTheta = u.uTheta; sh.uniforms.uK = u.uK; sh.uniforms.uBase = u.uBase
    let v = FN + sh.vertexShader.replace('#include <project_vertex>', PROJ)
    if (!isDepth) v = v.replace('#include <defaultnormal_vertex>', NORM).replace('#include <worldpos_vertex>', WP)
    sh.vertexShader = v
  }
  m.customProgramCacheKey = () => 'pagebend1'
  return m
}

/** Standard paper material + the matching depth material (so the bent paper casts a bent shadow). */
export function paperMat(u: BendU, o: { map?: THREE.Texture | null; glow?: THREE.Texture | null; side?: THREE.Side; cut?: boolean; color?: string | number; rough?: number }) {
  const mat = bendify(new THREE.MeshStandardMaterial({
    map: o.map ?? null, color: o.color ?? 0xffffff, roughness: o.rough ?? 0.92, metalness: 0, side: o.side ?? THREE.FrontSide,
    emissive: o.glow ? 0xffffff : 0x000000, emissiveMap: o.glow ?? null, emissiveIntensity: 1.1,
    alphaTest: o.cut ? 0.5 : 0, alphaToCoverage: !!o.cut,
  }), u)
  const depth = bendify(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: o.cut ? o.map ?? null : null, alphaTest: o.cut ? 0.5 : 0, side: THREE.DoubleSide }), u)
  return { mat, depth }
}
