'use client'
import gsap from 'gsap'

const KEY = 'ls-iris'
const mk = (x: number, y: number) => {
  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  Object.assign(el.style, {
    position: 'fixed', left: x + 'px', top: y + 'px', transform: 'translate(-50%,-50%)', borderRadius: '50%',
    boxShadow: '0 0 0 200vmax #0b0206, inset 0 0 40px 6px rgba(255,200,130,.5)', zIndex: '300', pointerEvents: 'none',
  })
  document.body.append(el)
  return el
}
const full = () => Math.hypot(window.innerWidth, window.innerHeight) * 2

/** Iris closes to a point (silent-film transition). Resolves when fully dark. */
export function irisClose(x: number, y: number): Promise<void> {
  const el = mk(x, y)
  const D = full()
  try { sessionStorage.setItem(KEY, JSON.stringify({ x: x / window.innerWidth, y: y / window.innerHeight })) } catch {}
  return new Promise((res) => {
    gsap.fromTo(el, { width: D, height: D }, { width: 0, height: 0, duration: 0.85, ease: 'power3.in', onComplete: () => res() })
  })
}

/** If we arrived through irisClose, open the iris back out from the same point. */
export function irisOpenIfNeeded() {
  let v: { x: number; y: number } | null = null
  try { const s = sessionStorage.getItem(KEY); if (s) v = JSON.parse(s); sessionStorage.removeItem(KEY) } catch {}
  if (!v) return
  const el = mk(v.x * window.innerWidth, v.y * window.innerHeight)
  const D = full()
  gsap.fromTo(el, { width: 0, height: 0 }, { width: D, height: D, duration: 1.0, ease: 'power2.out', delay: 0.15, onComplete: () => el.remove() })
}
