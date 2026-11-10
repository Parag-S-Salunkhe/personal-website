'use client'

import { useReducedMotion } from 'framer-motion'

const BULB_COLORS = ['#F5C55C', '#EF7B52', '#E56F96', '#FFE9C4']

// Bulb x-positions along the 1200-wide viewBox; y follows the wire's sag
const BULBS = [60, 170, 280, 390, 500, 610, 720, 830, 940, 1050, 1160]

function wireY(x: number) {
  // Repeating catenary-ish sag: each 300px span dips ~34px
  const t = (x % 300) / 300
  return 16 + Math.sin(t * Math.PI) * 34
}

/**
 * A strand of warm fairy lights sagging across the top of the hero.
 * The strand sways gently; bulbs twinkle with staggered flicker.
 */
export default function StringLights() {
  const reduceMotion = useReducedMotion()

  return (
    <div
      aria-hidden
      className={`absolute -top-1 inset-x-0 h-24 origin-top ${reduceMotion ? '' : 'animate-sway'}`}
    >
      <svg viewBox="0 0 1200 110" preserveAspectRatio="none" className="w-full h-full">
        {/* Wire */}
        <path
          d="M0,16 Q75,52 150,50 Q225,48 300,16 Q375,52 450,50 Q525,48 600,16 Q675,52 750,50 Q825,48 900,16 Q975,52 1050,50 Q1125,48 1200,16"
          fill="none"
          className="stroke-night/30 dark:stroke-cream/25"
          strokeWidth="2"
        />
        {BULBS.map((x, i) => {
          const y = wireY(x)
          const color = BULB_COLORS[i % BULB_COLORS.length]
          return (
            <g key={x}>
              {/* Pendant */}
              <line x1={x} y1={y} x2={x} y2={y + 10} className="stroke-night/30 dark:stroke-cream/25" strokeWidth="1.5" />
              {/* Glow halo */}
              <circle
                cx={x}
                cy={y + 17}
                r="14"
                fill={color}
                opacity="0.35"
                className={reduceMotion ? '' : 'animate-flicker'}
                style={{
                  filter: 'blur(6px)',
                  animationDuration: `${3 + (i % 4)}s`,
                  animationDelay: `${-i * 0.7}s`,
                }}
              />
              {/* Bulb */}
              <circle cx={x} cy={y + 17} r="5.5" fill={color} />
              <circle cx={x - 1.5} cy={y + 15} r="1.6" fill="#FFFDF6" opacity="0.85" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
