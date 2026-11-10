import { Scissors } from 'lucide-react'
import s from './styles.module.css'

export function Rated({ n, className = '' }: { n: number; className?: string }) {
  return (
    <span className={`relative inline-grid h-12 w-12 shrink-0 place-items-center ${className}`} role="img" aria-label={`Rated ${n} out of 5`}>
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <path d="M24 4C35 3 45 11 44 24C43 37 33 45 22 44C10 43 3 34 4 23C5 12 14 5 27 5C31 5 34 6 36 8" fill="none" stroke="#FF4FA3" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className={`${s.display} ${s.nums} relative text-xl`} style={{ fontVariationSettings: "'wdth' 100" }} aria-hidden="true">{n}</span>
    </span>
  )
}

export function CutLine({ className = '' }: { className?: string }) {
  return (
    <div className={`relative mx-auto flex max-w-6xl items-center px-4 sm:px-6 ${className}`} aria-hidden="true">
      <Scissors className="h-5 w-5 shrink-0 text-[var(--riso-blue)]" strokeWidth={2} />
      <div className="ml-2 flex-1 border-t-2 border-dashed border-[var(--riso-blue)]" />
    </div>
  )
}

export function Tape({ className = '' }: { className?: string }) {
  return <span className={`${s.tape} ${className}`} aria-hidden="true" />
}

export function Staple({ className = '' }: { className?: string }) {
  return <span className={`${s.staple} ${className}`} aria-hidden="true" />
}

export function NoPoster() {
  return (
    <svg viewBox="0 0 200 300" className="absolute inset-0 h-full w-full" role="img" aria-label="No poster yet: a clapperboard">
      <rect width="200" height="300" fill="#2F4FA2" />
      <g fill="#FF4FA3">
        {Array.from({ length: 11 }).map((_, r) => Array.from({ length: 8 }).map((__, c) => (
          <circle key={`${r}-${c}`} cx={12 + c * 25 + (r % 2) * 12} cy={12 + r * 27} r={Math.max(0.8, 4.5 - r * 0.4)} />
        )))}
      </g>
      <g transform="rotate(-6 100 150)" stroke="#1B2350" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <rect x="42" y="118" width="116" height="84" rx="3" fill="#F1F1EC" />
        <path d="M42 118 L158 118 L158 96 L42 96 Z" fill="#FFE14A" />
        <path d="M58 96 L72 118 M82 96 L96 118 M106 96 L120 118 M130 96 L144 118" fill="none" />
        <path d="M42 96 L36 74 L152 66 L158 96" fill="#FF4FA3" />
        <path d="M54 150 H146 M54 170 H116 M54 188 H132" fill="none" strokeWidth="3" />
      </g>
    </svg>
  )
}

export function Plate({ variant = 0 }: { variant?: number }) {
  return (
    <svg viewBox="0 0 200 110" className="h-24 w-full" role="img" aria-label="A hand-drawn plate, no photo yet">
      <g fill="none" stroke="#2F4FA2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M100 8C132 7 156 28 155 56C154 84 128 103 99 102C68 101 45 82 46 54C47 27 70 9 102 9" />
        <path d="M100 24C124 23 140 38 139 56C138 74 122 88 100 87C78 86 62 72 62 55C62 38 78 24 100 24" strokeWidth="2" />
        <path d="M24 20V50M17 20V42C17 50 31 50 31 42V20M24 50V96" />
        <path d="M176 18C168 30 168 50 176 62V96M176 18V62" />
      </g>
      <circle cx="100" cy="56" r="33" fill="#FF4FA3" fillOpacity=".3" />
      <circle cx="100" cy="56" r="40" fill="none" stroke="#FF4FA3" strokeWidth="3" strokeLinecap="round" strokeDasharray="0.1 6.5" />
      {variant === 0 && (
        <g fill="none" stroke="#FF4FA3" strokeWidth="3.5" strokeLinecap="round">
          <path d="M82 52C76 44 88 40 82 32" /><path d="M100 52C94 44 106 40 100 30" /><path d="M118 52C112 44 124 40 118 32" />
        </g>
      )}
      {variant === 1 && (
        <g fill="none" stroke="#2F4FA2" strokeWidth="3" strokeLinecap="round">
          <circle cx="100" cy="56" r="18" fill="#FFE14A" />
          <path d="M100 38V74M82 56H118M87 43L113 69M113 43L87 69" strokeWidth="2" />
        </g>
      )}
      {variant === 2 && (
        <g stroke="#2F4FA2" strokeWidth="2.5" fill="#FFE14A">
          <circle cx="88" cy="58" r="8" /><circle cx="106" cy="50" r="8" /><circle cx="110" cy="68" r="8" /><circle cx="92" cy="74" r="5" fill="#FF4FA3" />
        </g>
      )}
    </svg>
  )
}

export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 12C40 6 84 14 98 56" /><path d="M82 48L98 58L104 38" />
    </svg>
  )
}
