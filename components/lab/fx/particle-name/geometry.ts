import * as THREE from 'three'

/** One popcorn kernel: a noise-displaced icosphere, faceted, with a darker husk side and a pale top. */
export function kernelGeometry(detail = 1): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(1, detail)
  const pos = g.attributes.position as THREE.BufferAttribute
  const col = new Float32Array(pos.count * 3)
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize()
    const b =
      Math.sin(v.x * 3.7 + 1.3) * Math.sin(v.y * 4.1 + 0.4) +
      Math.sin(v.z * 5.3 + 2.2) * Math.cos(v.x * 4.6) * 0.8 +
      0.5 * Math.sin(v.y * 9.0 + v.x * 7.0 + v.z * 5.0)
    const k = 1 + 0.2 * b
    const x = v.x * k * 1.05
    const y = v.y * k * 0.88
    const z = v.z * k
    pos.setXYZ(i, x, y, z)
    // vertex colour: pale on top, toasty husk on the back-bottom
    const top = THREE.MathUtils.clamp(v.y * 0.5 + 0.5, 0, 1)
    const husk = THREE.MathUtils.clamp((-v.z - 0.35) * 1.6 + (0.5 - top) * 0.6, 0, 1)
    const l = 0.8 + 0.2 * top
    col[i * 3] = l * (1 - 0.1 * husk)
    col[i * 3 + 1] = l * (1 - 0.38 * husk)
    col[i * 3 + 2] = l * (1 - 0.62 * husk)
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  g.computeVertexNormals() // non-indexed: flat facets
  return g
}
