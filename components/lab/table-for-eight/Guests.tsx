import type { LabGuestNote } from '@/components/lab/kit/data'
import { fmt, hash, shorten } from './content'

const SKIN = ['#E8B58F', '#C98B62', '#F0C9A6', '#9A6342', '#D9A07A']
const HAIR = ['#2A1A12', '#5A3220', '#B8742F', '#1D1D22', '#8C8C90']
const COAT = ['#7C2236', '#A9C3AE', '#F6B94F', '#F1EEE6', '#3E6B55']

/** Painted guests (SVG with a turbulence-displaced brush edge) holding the real guestbook notes. */
export default function Guests({ notes }: { notes: LabGuestNote[] }) {
  const list = notes.slice(0, 5)
  return (
    <div className="relative">
      <style>{`
        @keyframes tfe-breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        @keyframes tfe-wave{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(14deg)}}
        .tfe-guest{animation:tfe-breathe 4.2s ease-in-out infinite;transform-origin:50% 100%}
        .tfe-hand{animation:tfe-wave 1.3s ease-in-out infinite;transform-origin:0 0}
        @media (prefers-reduced-motion:reduce){.tfe-guest,.tfe-hand{animation:none}}
      `}</style>
      <svg width="0" height="0" aria-hidden className="absolute">
        <filter id="tfe-paint" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4" /><feDisplacementMap in="SourceGraphic" scale="7" /></filter>
      </svg>
      <ul className="grid gap-x-4 gap-y-14 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((g, i) => {
          const h = hash(g.id)
          const skin = SKIN[h % 5], hair = HAIR[(h >> 3) % 5], coat = COAT[(h >> 6) % 5]
          const waving = i === 2
          return (
            <li key={g.id} className="relative flex flex-col items-center" style={{ marginTop: i % 2 ? 18 : 0 }}>
              <blockquote className="relative z-10 w-full rounded-[3px] bg-[#F6F1E4] px-4 py-3 text-sm leading-snug text-[#17352A] shadow-[0_10px_26px_rgba(0,0,0,.4)]" style={{ transform: `rotate(${(i % 3 - 1) * 1.6}deg)`, outline: '1px solid #B88A44', outlineOffset: '-5px' }}>
                <p>{shorten(g.message, 120)}</p>
                <footer className="mt-1 text-xs text-[#17352A]/70">{g.emoji ? `${g.emoji} ` : ''}left {fmt(g.createdAt)}</footer>
              </blockquote>
              <svg viewBox="0 0 160 170" className="tfe-guest -mt-1 w-40" aria-hidden style={{ animationDelay: `${i * 0.7}s` }}>
                <g filter="url(#tfe-paint)">
                  <path d="M14 170 C16 122 44 108 80 108 C116 108 144 122 146 170 Z" fill={coat} />
                  <path d="M66 108 L80 134 L94 108 Z" fill="#F1EEE6" opacity=".85" />
                  <rect x="68" y="92" width="24" height="22" rx="8" fill={skin} />
                  <ellipse cx="80" cy="64" rx="30" ry="34" fill={skin} />
                  <path d={h % 2 ? 'M48 62 C44 24 116 18 112 62 C106 44 90 38 80 40 C66 40 54 46 48 62 Z' : 'M46 70 C38 18 122 14 114 70 C112 48 100 34 80 34 C60 34 48 48 46 70 Z'} fill={hair} />
                  <circle cx="68" cy="68" r="2.6" fill="#2A1A12" /><circle cx="92" cy="68" r="2.6" fill="#2A1A12" />
                  <path d="M70 84 Q80 92 90 84" fill="none" stroke="#7C2236" strokeWidth="3" strokeLinecap="round" />
                  {waving && <g className="tfe-hand" transform="translate(136 130)"><rect x="-6" y="-40" width="14" height="42" rx="7" fill={coat} /><circle cx="1" cy="-46" r="9" fill={skin} /></g>}
                </g>
              </svg>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
