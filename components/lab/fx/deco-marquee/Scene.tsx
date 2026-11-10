'use client'
import { Canvas, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion, useTier } from '@/components/lab/kit/hooks'
import Rig from './Rig'
import World from './World'
import type { Story } from './timeline'

gsap.registerPlugin(ScrollTrigger, useGSAP)

function Kick() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => { const ids = [60, 300, 900, 2000].map((ms) => window.setTimeout(invalidate, ms)); return () => ids.forEach(clearTimeout) }, [invalidate])
  return null
}

export default function Scene({ texts, posters }: { texts: string[]; posters: string[] }) {
  const rm = useReducedMotion()
  const tier = useTier()
  const light = tier === 'light'
  const wrap = useRef<HTMLDivElement>(null)
  const inView = useInView(wrap)
  const story = useRef<Story>({ raw: 0, p: 0, t: 0, still: false })
  const [family, setFamily] = useState('"Big Shoulders"')
  story.current.still = rm

  useEffect(() => {
    const v = getComputedStyle(document.body).getPropertyValue('--font-display').trim()
    const el = document.querySelector('[data-deco-font]')
    const fam = el ? getComputedStyle(el).fontFamily : v
    if (fam) setFamily(fam)
  }, [])

  useGSAP(() => {
    if (rm) return
    const el = document.querySelector('[data-story]')
    if (!el) return
    const hero = document.querySelector<HTMLElement>('[data-hero]')
    const st = ScrollTrigger.create({
      trigger: el, start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => { story.current.raw = self.progress; if (hero) hero.style.opacity = String(Math.max(0, 1 - self.progress / 0.12)) },
    })
    return () => st.kill()
  }, { dependencies: [rm] })

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden>
      <Canvas
        frameloop={rm ? 'demand' : inView ? 'always' : 'never'}
        dpr={light ? [1, 1.5] : [1, 2]}
        camera={{ fov: 38, near: 0.1, far: 220, position: [0, 2, 20] }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <Rig story={story} />
        <World story={story} light={light} posters={posters} texts={texts} family={family} />
        <EffectComposer multisampling={light ? 0 : 4}>
          <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.15} intensity={light ? 0.9 : 1.25} radius={0.72} />
          <Vignette offset={0.25} darkness={light ? 0.4 : 0.55} />
        </EffectComposer>
        {rm && <Kick />}
      </Canvas>
    </div>
  )
}
