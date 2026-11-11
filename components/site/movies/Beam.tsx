// The projector beam on the movie page: a soft CSS cone from the top left that settles on the poster on load, then holds.
// Pure CSS (no client JS); reduced motion keeps the cone static and drops the dust.
import type { ReactNode } from 'react'

const DUST = Array.from({ length: 14 }, (_, i) => ({
  left: 8 + ((i * 37) % 84), top: 6 + ((i * 53) % 80), size: 2 + (i % 3), delay: (i % 7) * 0.9, dur: 7 + (i % 5) * 1.6,
}))

export default function Beam({ children }: { children: ReactNode }) {
  return (
    <div className="mv-beam-wrap relative mx-auto w-full max-w-[16rem] md:max-w-none">
      <style>{`
        @keyframes mv-settle { 0% { opacity: 0; transform: rotate(-14deg) scale(1.1); } 35% { opacity: .55; } 55% { opacity: .3; } 100% { opacity: 1; transform: none; } }
        @keyframes mv-lit { 0% { filter: brightness(.35); } 100% { filter: brightness(1); } }
        @keyframes mv-drift { 0% { transform: translate3d(0,0,0); opacity: 0; } 20% { opacity: .8; } 100% { transform: translate3d(14px,-46px,0); opacity: 0; } }
        .mv-cone { animation: mv-settle 2.2s var(--ease-ev, ease-out) both; transform-origin: 0 0; }
        .mv-lit { animation: mv-lit 2.2s var(--ease-ev, ease-out) both; }
        .mv-dust { animation: mv-drift var(--dur) linear var(--delay) infinite; opacity: 0; }
        @media (prefers-reduced-motion: reduce) { .mv-cone, .mv-lit { animation: none !important; } .mv-dust { display: none; } }
      `}</style>
      <div aria-hidden="true" className="pointer-events-none absolute -left-[45%] -top-[22%] h-[130%] w-[160%] md:-left-[55%] md:-top-[26%]">
        <div
          className="mv-cone absolute inset-0"
          style={{
            clipPath: 'polygon(0 0, 100% 14%, 100% 100%, 18% 100%)',
            background: 'radial-gradient(ellipse 110% 100% at 0% 0%, rgba(255,243,214,.34) 0%, rgba(246,185,79,.14) 45%, rgba(246,185,79,0) 80%)',
          }}
        />
        {DUST.map((d, i) => (
          <span
            key={i}
            className="mv-dust absolute rounded-full bg-[#FFF3D6]"
            style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, ['--dur' as string]: `${d.dur}s`, ['--delay' as string]: `${d.delay}s` }}
          />
        ))}
      </div>
      <div className="mv-lit relative rounded-[3px] p-2 shadow-[0_24px_60px_rgb(0_0_0/0.6)] ring-1 ring-[var(--brass)]" style={{ background: 'rgb(184 138 68 / 0.18)' }}>
        {children}
      </div>
    </div>
  )
}
