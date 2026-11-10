// Procedural geometry for the table scene. Plain three.js, no React.
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { mulberry32 } from './seats'

const v2 = (pts: [number, number][]) => pts.map(([x, y]) => new THREE.Vector2(x, y))
export const lathe = (pts: [number, number][], seg = 48) => new THREE.LatheGeometry(v2(pts), seg)

function box(w: number, h: number, d: number, x: number, y: number, z: number, ry = 0) {
  const g = new THREE.BoxGeometry(w, h, d)
  if (ry) g.rotateY(ry)
  g.translate(x, y, z)
  return g
}
function merge(gs: THREE.BufferGeometry[]) {
  const m = mergeGeometries(gs, false)
  gs.forEach((g) => g.dispose())
  return m
}

/** White plate with a lifted rim. Origin on the base. */
export const plateGeo = () => lathe([[0, 0.003], [0.1, 0.003], [0.14, 0.009], [0.165, 0.022], [0.179, 0.03], [0.182, 0.026], [0.172, 0.014], [0.1, 0], [0, 0]], 56)
/** Brass charger under it. */
export const chargerGeo = () => lathe([[0, 0.011], [0.19, 0.011], [0.222, 0.017], [0.237, 0.015], [0.238, 0.006], [0.2, 0], [0, 0]], 56)
/** Wine glass shell (foot, stem, bowl), height 0.22. */
export const glassGeo = () => lathe([[0.001, 0.001], [0.038, 0.001], [0.04, 0.004], [0.012, 0.01], [0.006, 0.02], [0.005, 0.09], [0.012, 0.1], [0.032, 0.115], [0.046, 0.14], [0.05, 0.16], [0.046, 0.188], [0.038, 0.212], [0.036, 0.22], [0.034, 0.22], [0.036, 0.211], [0.043, 0.188], [0.047, 0.16], [0.043, 0.14], [0.029, 0.118], [0.01, 0.105], [0.001, 0.103]], 32)
/** The claret pour inside it. */
export const wineGeo = () => lathe([[0.001, 0.106], [0.026, 0.12], [0.041, 0.14], [0.045, 0.16], [0.042, 0.176], [0.001, 0.176]], 32)
export const decanterGeo = () => lathe([[0.001, 0.001], [0.07, 0.001], [0.09, 0.03], [0.095, 0.08], [0.07, 0.15], [0.03, 0.2], [0.022, 0.26], [0.03, 0.29], [0.026, 0.292], [0.019, 0.26], [0.026, 0.2], [0.065, 0.15], [0.088, 0.08], [0.084, 0.03], [0.064, 0.006], [0.001, 0.006]], 36)
export const decanterWineGeo = () => lathe([[0.001, 0.007], [0.062, 0.007], [0.082, 0.03], [0.087, 0.08], [0.064, 0.145], [0.001, 0.145]], 36)

/** Cutlery lies along local +z, flat on y = 0. */
export const forkGeo = () => merge([
  box(0.016, 0.003, 0.1, 0, 0.0015, -0.04),
  box(0.006, 0.003, 0.03, 0, 0.0015, 0.025),
  box(0.032, 0.003, 0.018, 0, 0.0015, 0.044),
  ...[-0.012, -0.004, 0.004, 0.012].map((x) => box(0.004, 0.003, 0.036, x, 0.0015, 0.07)),
])
export const knifeGeo = () => merge([box(0.015, 0.008, 0.09, 0, 0.004, -0.05), box(0.014, 0.0025, 0.105, 0, 0.00125, 0.045)])
export const spoonGeo = () => {
  const bowl = new THREE.SphereGeometry(1, 20, 12)
  bowl.scale(0.022, 0.006, 0.034)
  bowl.translate(0, 0.004, 0.065)
  return merge([box(0.012, 0.003, 0.1, 0, 0.0015, -0.03), bowl])
}
export const napkinGeo = () => merge([box(0.15, 0.008, 0.11, 0, 0.004, 0), box(0.14, 0.008, 0.1, 0, 0.012, 0, 0.18), box(0.03, 0.022, 0.12, 0, 0.011, 0)])

/** Pleated cloth drape, hangs from y = 0 (top) down to -h. */
export function drapeGeo(w: number, h: number) {
  const g = new THREE.PlaneGeometry(w, h, Math.round(w * 26), 4)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i)
    const down = (h / 2 - y) / h
    p.setZ(i, Math.sin(x * 21) * (0.004 + 0.02 * down) + Math.sin(x * 7.3 + 1) * 0.008 * down)
  }
  g.translate(0, -h / 2, 0)
  g.computeVertexNormals()
  return g
}

/** One chair, front toward local +z. Returns wood and upholstery geometries. */
export function chairGeos() {
  const wood = merge([
    ...[[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]].map(([x, z]) => box(0.04, 0.44, 0.04, x, 0.22, z)),
    box(0.44, 0.05, 0.44, 0, 0.445, 0),
    box(0.04, 0.55, 0.04, -0.19, 0.725, -0.19), box(0.04, 0.55, 0.04, 0.19, 0.725, -0.19),
    box(0.4, 0.045, 0.035, 0, 0.99, -0.19),
    box(0.4, 0.03, 0.03, 0, 0.3, 0.19), box(0.4, 0.03, 0.03, 0, 0.3, -0.19),
  ])
  const cushion = merge([box(0.4, 0.05, 0.4, 0, 0.495, 0.005), box(0.36, 0.26, 0.04, 0, 0.82, -0.19)])
  return { wood, cushion }
}

export const potBodyGeo = () => lathe([[0.001, 0], [0.095, 0], [0.125, 0.02], [0.14, 0.08], [0.14, 0.15], [0.148, 0.156], [0.148, 0.16], [0.136, 0.158], [0.128, 0.148], [0.128, 0.08], [0.1, 0.014], [0.001, 0.012]], 40)
export const potLidGeo = () => lathe([[0.152, 0.158], [0.14, 0.17], [0.1, 0.19], [0.04, 0.2], [0.001, 0.2], [0.001, 0.196], [0.04, 0.196], [0.1, 0.186], [0.136, 0.166]], 40)
export const bowlGeo = () => lathe([[0.001, 0], [0.06, 0], [0.1, 0.03], [0.13, 0.075], [0.142, 0.095], [0.138, 0.097], [0.125, 0.078], [0.09, 0.042], [0.055, 0.014], [0.001, 0.013]], 40)
export const holderGeo = () => lathe([[0.001, 0], [0.05, 0], [0.052, 0.012], [0.02, 0.03], [0.012, 0.06], [0.02, 0.085], [0.032, 0.1], [0.034, 0.108], [0.02, 0.108], [0.001, 0.1]], 28)
/** Flame teardrop, height 0.1 (scaled in shader). */
export const flameGeo = () => lathe([[0.001, 0], [0.01, 0.008], [0.017, 0.022], [0.017, 0.04], [0.012, 0.06], [0.006, 0.08], [0.001, 0.1]], 16)

/** Salad: instanced leaves + tomatoes, deterministic. */
export function saladData() {
  const r = mulberry32(7)
  const leaves: { m: THREE.Matrix4; c: THREE.Color }[] = []
  const greens = ['#5f8a3f', '#7fa352', '#3f6b34', '#9bb86a', '#4f7d3b']
  const q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), pos = new THREE.Vector3()
  for (let i = 0; i < 46; i++) {
    const a = r() * Math.PI * 2, rad = Math.sqrt(r()) * 0.105
    pos.set(Math.cos(a) * rad, 0.04 + (1 - rad / 0.105) * 0.045 + r() * 0.02, Math.sin(a) * rad)
    e.set((r() - 0.5) * 1.4, r() * 6.28, (r() - 0.5) * 1.4)
    q.setFromEuler(e)
    const sc = 0.03 + r() * 0.025
    s.set(sc * 1.6, sc * 0.3, sc)
    leaves.push({ m: new THREE.Matrix4().compose(pos.clone(), q.clone(), s.clone()), c: new THREE.Color(greens[Math.floor(r() * greens.length)]) })
  }
  const toms: THREE.Matrix4[] = []
  for (let i = 0; i < 7; i++) {
    const a = r() * 6.28, rad = r() * 0.09
    toms.push(new THREE.Matrix4().makeTranslation(Math.cos(a) * rad, 0.1 + r() * 0.015, Math.sin(a) * rad))
  }
  return { leaves, toms }
}

export function weaveCanvas(size = 128) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const x = c.getContext('2d')!
  x.fillStyle = '#808080'
  x.fillRect(0, 0, size, size)
  const r = mulberry32(3)
  for (let i = 0; i < size; i += 2) {
    x.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${0.1 + r() * 0.18})`
    x.fillRect(i, 0, 1, size)
    x.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${0.1 + r() * 0.18})`
    x.fillRect(0, i, size, 1)
  }
  return c
}

export function plankCanvas() {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const x = c.getContext('2d')!
  const r = mulberry32(11)
  const w = 512 / 8
  for (let i = 0; i < 8; i++) {
    const l = 16 + r() * 8
    x.fillStyle = `hsl(24, 38%, ${l}%)`
    x.fillRect(i * w, 0, w, 512)
    for (let k = 0; k < 26; k++) {
      x.fillStyle = `rgba(0,0,0,${r() * 0.12})`
      x.fillRect(i * w + r() * w, r() * 512, 1 + r() * 2, 20 + r() * 120)
    }
    x.fillStyle = 'rgba(0,0,0,0.55)'
    x.fillRect(i * w, 0, 2, 512)
  }
  return c
}

export function duskCanvas() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 384
  const x = c.getContext('2d')!
  const g = x.createLinearGradient(0, 0, 0, 384)
  g.addColorStop(0, '#0d1b44')
  g.addColorStop(0.45, '#2c4f94')
  g.addColorStop(0.78, '#8a7fa6')
  g.addColorStop(1, '#e0996e')
  x.fillStyle = g
  x.fillRect(0, 0, 512, 384)
  const r = mulberry32(5)
  x.fillStyle = '#0a0f1f'
  let hgt = 300
  for (let i = 0; i < 512; i += 16 + Math.floor(r() * 26)) {
    const w = 18 + r() * 40
    hgt = 290 + r() * 70
    x.fillRect(i, hgt, w, 384 - hgt)
    for (let k = 0; k < 3; k++) {
      if (r() > 0.45) { x.fillStyle = '#ffc56b'; x.fillRect(i + 4 + r() * (w - 10), hgt + 8 + r() * 40, 3, 4); x.fillStyle = '#0a0f1f' }
    }
  }
  return c
}
