'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

// Two palettes: deeper tones so particles show on cream, glowier ones for dark
const LIGHT_COLORS = ['#E85A38', '#D94F70', '#EB9420', '#C22D58', '#EF7B52', '#AB63A6']
const DARK_COLORS = ['#FFB65C', '#F5C55C', '#EF7B52', '#E56F96', '#FFD9A0', '#C487C1']

interface Particle {
  x: number
  y: number
  size: number
  vy: number
  swaySpeed: number
  swayAmp: number
  phase: number
  colorIdx: number
  alpha: number
  kind: 'bokeh' | 'spark' | 'confetti'
  rot: number
  vrot: number
}

function makeSprites(colors: string[]) {
  return colors.map((color) => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, color)
    grad.addColorStop(0.4, color + 'AA')
    grad.addColorStop(1, color + '00')
    g.fillStyle = grad
    g.fillRect(0, 0, 64, 64)
    return c
  })
}

/**
 * The "party in the room" layer: drifting bokeh light, rising sparks and
 * slow confetti on a single canvas, over saturated sunset blobs.
 * Static single frame under reduced motion; fewer particles on mobile.
 */
export default function PartyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    let particles: Particle[] = []
    let raf = 0

    const lightSprites = makeSprites(LIGHT_COLORS)
    const darkSprites = makeSprites(DARK_COLORS)

    const rand = (a: number, b: number) => a + Math.random() * (b - a)

    function init() {
      width = window.innerWidth
      height = window.innerHeight
      canvas!.width = width * dpr
      canvas!.height = height * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      const isMobile = width < 640
      const counts = isMobile
        ? { bokeh: 10, spark: 12, confetti: 6 }
        : { bokeh: 18, spark: 26, confetti: 14 }

      particles = []
      const push = (kind: Particle['kind'], n: number, opts: () => Partial<Particle>) => {
        for (let i = 0; i < n; i++) {
          particles.push({
            x: rand(0, width),
            y: rand(0, height),
            phase: rand(0, Math.PI * 2),
            colorIdx: Math.floor(rand(0, LIGHT_COLORS.length)),
            rot: rand(0, Math.PI * 2),
            vrot: rand(-0.01, 0.01),
            size: 4,
            vy: 0,
            swaySpeed: rand(0.2, 0.7),
            swayAmp: rand(10, 40),
            alpha: 0.5,
            kind,
            ...opts(),
          })
        }
      }
      push('bokeh', counts.bokeh, () => ({ size: rand(30, 90), vy: -rand(2, 6), alpha: rand(0.1, 0.22) }))
      push('spark', counts.spark, () => ({ size: rand(2, 4.5), vy: -rand(8, 22), alpha: rand(0.4, 0.8) }))
      push('confetti', counts.confetti, () => ({ size: rand(4, 7), vy: rand(6, 14), alpha: rand(0.35, 0.6), swayAmp: rand(20, 60) }))
    }

    function draw(t: number) {
      const dark = document.documentElement.classList.contains('dark')
      const sprites = dark ? darkSprites : lightSprites
      const colors = dark ? DARK_COLORS : LIGHT_COLORS
      ctx!.clearRect(0, 0, width, height)

      for (const p of particles) {
        const sway = Math.sin(t * 0.001 * p.swaySpeed + p.phase) * p.swayAmp
        const x = p.x + sway
        ctx!.globalAlpha = p.alpha

        if (p.kind === 'confetti') {
          ctx!.save()
          ctx!.translate(x, p.y)
          ctx!.rotate(p.rot)
          ctx!.fillStyle = colors[p.colorIdx]
          ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
          ctx!.restore()
        } else {
          ctx!.drawImage(sprites[p.colorIdx], x - p.size / 2, p.y - p.size / 2, p.size, p.size)
        }
      }
      ctx!.globalAlpha = 1
    }

    function step(t: number, dt: number) {
      for (const p of particles) {
        p.y += p.vy * dt * 0.001 * 4
        p.rot += p.vrot
        // wrap vertically with a margin so nothing pops
        if (p.y < -100) p.y = height + 100
        if (p.y > height + 100) p.y = -100
      }
    }

    let last = performance.now()
    function loop(t: number) {
      const dt = Math.min(t - last, 50)
      last = t
      step(t, dt)
      draw(t)
      raf = requestAnimationFrame(loop)
    }

    init()
    if (reduceMotion) {
      draw(0) // single static frame
    } else {
      raf = requestAnimationFrame(loop)
    }

    const onResize = () => {
      init()
      if (reduceMotion) draw(0)
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [reduceMotion])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Sunset wash from the top */}
      <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[1100px] h-[560px] rounded-full bg-gradient-to-b from-saffron-300/50 via-ember-300/30 to-transparent dark:from-saffron-500/[0.2] dark:via-ember-600/[0.12] dark:to-transparent blur-3xl" />

      {/* Saturated party blobs */}
      <div className="absolute top-[12%] -left-28 w-[26rem] h-[26rem] rounded-full bg-gradient-to-br from-ember-400/40 to-berry-400/30 dark:from-ember-500/[0.18] dark:to-berry-500/[0.14] blur-3xl animate-drift" />
      <div className="absolute top-[48%] -right-24 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tl from-berry-400/35 to-plum-400/25 dark:from-berry-500/[0.16] dark:to-plum-500/[0.12] blur-3xl animate-drift-slow" />
      <div className="hidden sm:block absolute bottom-[4%] left-[22%] w-96 h-96 rounded-full bg-gradient-to-tr from-saffron-400/35 to-ember-300/30 dark:from-saffron-500/[0.14] dark:to-ember-500/[0.1] blur-3xl animate-drift" style={{ animationDelay: '-8s' }} />

      {/* Particle layer: bokeh, sparks, confetti */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Grain so it all feels like paper and candlelight, not plastic */}
      <div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}
