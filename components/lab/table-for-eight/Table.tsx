'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import styles from './styles.module.css'

export type TablePlace = {
  key: string
  name: string
  href: string
  blurb: string
  latest: string | null
  empty?: boolean
}

const EASE = [0.22, 1, 0.36, 1] as const
const STEP = 0.12
const START = 0.2
const CANDLE_AT = START + 8 * STEP + 0.1

function Cutlery({ side, delay, reduce, faint }: { side: 'l' | 'r'; delay: number; reduce: boolean; faint: boolean }) {
  const dx = side === 'l' ? -22 : 22
  return (
    <motion.g
      initial={reduce ? false : { x: dx, opacity: 0 }}
      animate={{ x: 0, opacity: faint ? 0.45 : 1 }}
      transition={{ duration: 0.7, ease: EASE, delay: delay + 0.15 }}
    >
      {side === 'l' ? (
        <g fill="#D9DDD6" stroke="#8E9A92" strokeWidth=".8">
          <rect x="22" y="70" width="5" height="62" rx="2.5" />
          <path d="M16 32h17v30c0 6-3 9-8.5 9S16 68 16 62z" />
          <path d="M20.5 32v22 M24.5 32v22 M28.5 32v22" stroke="#8E9A92" strokeWidth=".8" fill="none" />
        </g>
      ) : (
        <g fill="#D9DDD6" stroke="#8E9A92" strokeWidth=".8">
          <rect x="174" y="84" width="5" height="48" rx="2.5" />
          <path d="M174 50c9 4 11 16 10 34h-10z" />
        </g>
      )}
    </motion.g>
  )
}

function PlaceSetting({ place, index }: { place: TablePlace; index: number }) {
  const reduce = !!useReducedMotion()
  const delay = START + index * STEP
  const faint = !!place.empty
  const label = place.empty ? `${place.name}: pull up a chair and leave a note` : `${place.name}. ${place.blurb}${place.latest ? `. Latest: ${place.latest}` : ''}`
  const goNote = (e: React.MouseEvent) => {
    if (!place.empty) return
    window.setTimeout(() => document.getElementById('note-message')?.focus({ preventScroll: true }), 350)
  }
  return (
    <Link href={place.href} className={styles.place} aria-label={label} onClick={goNote}>
      <svg viewBox="0 0 200 150" className="mx-auto block w-full max-w-[220px]" aria-hidden="true" focusable="false">
        {/* wine glass, seen from above */}
        <motion.g
          initial={reduce ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: faint ? 0.5 : 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: delay + 0.3 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <circle cx="176" cy="22" r="12" fill="rgba(241,238,230,.1)" stroke="#D9DDD6" strokeWidth="1" />
          <circle cx="176" cy="22" r="7.5" fill="#7C2236" />
          <ellipse cx="173" cy="19" rx="3" ry="1.8" fill="#FFF8EA" opacity=".5" />
        </motion.g>
        <Cutlery side="l" delay={delay} reduce={reduce} faint={faint} />
        <Cutlery side="r" delay={delay} reduce={reduce} faint={faint} />
        <ellipse className={styles.shade} cx="100" cy="82" rx="56" ry="54" fill="#06120D" />
        <g className={styles.lift}>
          <motion.g
            initial={reduce ? false : { opacity: 0, scale: 1.18, y: -14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE, delay }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            <circle cx="100" cy="76" r="56" fill={faint ? 'rgba(241,238,230,.06)' : '#F1EEE6'} stroke={faint ? 'rgba(241,238,230,.45)' : '#C9C3B2'} strokeWidth="1.5" strokeDasharray={faint ? '4 6' : undefined} />
            {!faint && (
              <>
                <circle cx="100" cy="76" r="46" fill="#FBFAF5" stroke="#D5CFC0" strokeWidth="1" />
                <circle cx="100" cy="76" r="51" fill="none" stroke="#7C2236" strokeWidth=".8" strokeDasharray="2 4" opacity=".5" />
                <PlateMark k={place.key} />
              </>
            )}
            {faint && <circle cx="100" cy="76" r="30" fill="none" stroke="rgba(246,185,79,.5)" strokeWidth="1.2" strokeDasharray="2 5" />}
          </motion.g>
        </g>
      </svg>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: delay + 0.35 }}
        className={`${styles.card} relative mx-auto -mt-3 w-[88%] max-w-[190px] rounded-[6px] px-3 pb-2 pt-1.5 text-center`}
      >
        <span className={`${styles.script} block text-[28px] leading-[1.05]`}>{place.name}</span>
        <span className="mt-0.5 grid min-h-[2.5rem] place-items-start text-center text-xs leading-[1.25] text-[var(--ink-soft)] sm:text-[13px]">
          <span className={`${styles.swapA} ${styles.pretty} w-full`}>{place.blurb}</span>
          <span className={`${styles.swapB} ${styles.pretty} w-full line-clamp-2 break-words font-semibold text-[var(--claret)]`}>
            {place.latest ?? 'Nothing here yet.'}
          </span>
        </span>
      </motion.div>
    </Link>
  )
}

// Tiny motif in each plate's well: what the course is.
function PlateMark({ k }: { k: string }) {
  const c = { fill: 'none', stroke: '#17352A', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (k) {
    case 'movies':
      return <g {...c}><path d="M86 60l30 16-30 16z" fill="#F6B94F" stroke="#B8802A" strokeWidth="1.6" /></g>
    case 'cooking':
      return <g {...c}><path d="M80 78h40a20 14 0 0 1-40 0z" fill="#F6B94F" stroke="#B8802A" strokeWidth="1.6" /><path d="M90 70c-4-6 4-8 0-14M100 70c-4-6 4-8 0-14M110 70c-4-6 4-8 0-14" stroke="#7C2236" strokeWidth="1.6" /></g>
    case 'blog':
      return <g {...c}><rect x="80" y="62" width="40" height="28" rx="2" fill="#FFF8EA" stroke="#7C2236" strokeWidth="1.6" /><path d="M80 64l20 14 20-14" stroke="#7C2236" strokeWidth="1.6" /></g>
    case 'notes':
      return <g {...c}><path d="M82 58h36v32H82z" fill="#F6B94F" stroke="#B8802A" strokeWidth="1.6" /><path d="M89 69h22M89 77h16" stroke="#17352A" strokeWidth="1.4" /></g>
    case 'projects':
      return <g {...c}><circle cx="100" cy="76" r="14" fill="none" stroke="#7C2236" strokeWidth="1.6" /><path d="M100 56v10M100 86v10M80 76h10M110 76h10" stroke="#7C2236" strokeWidth="1.6" /><circle cx="100" cy="76" r="4" fill="#F6B94F" stroke="none" /></g>
    default:
      return <g {...c}><path d="M100 90c-16-10-18-22-10-27 5-3 9 0 10 4 1-4 5-7 10-4 8 5 6 17-10 27z" fill="#7C2236" stroke="#7C2236" strokeWidth="1.2" /></g>
  }
}

function Candle({ y, delayIdx, reduce }: { y: string; delayIdx: number; reduce: boolean }) {
  const dcls = [styles.d1, styles.d2, styles.d3][delayIdx % 3]
  return (
    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: y }}>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2">
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: EASE, delay: CANDLE_AT + delayIdx * 0.15 }}
          className="h-full w-full"
        >
          <div
            className={`${styles.glow} ${dcls} h-full w-full rounded-full`}
            style={{ background: 'radial-gradient(circle, rgba(246,185,79,.6) 0%, rgba(246,185,79,.28) 24%, rgba(246,185,79,.08) 45%, rgba(246,185,79,0) 68%)' }}
          />
        </motion.div>
      </div>
      <svg viewBox="0 0 40 40" className="relative block h-10 w-10 sm:h-14 sm:w-14" aria-hidden="true" focusable="false">
        <circle cx="20" cy="20" r="17" fill="#17352A" opacity=".5" />
        <circle cx="20" cy="20" r="14" fill="#F1EEE6" />
        <circle cx="20" cy="20" r="14" fill="none" stroke="#C9C3B2" strokeWidth="1" />
        <circle cx="20" cy="20" r="9" fill="#E3DDCB" />
        <motion.g
          initial={reduce ? false : { opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE, delay: CANDLE_AT + delayIdx * 0.15 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <circle className={`${styles.flame} ${dcls}`} cx="20" cy="20" r="4.6" fill="#F6B94F" />
          <circle cx="20" cy="20" r="2" fill="#FFF8EA" />
        </motion.g>
      </svg>
    </div>
  )
}

function Sprig({ y, flip }: { y: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 40 60" className="absolute left-1/2 h-12 w-8 -translate-x-1/2 -translate-y-1/2 opacity-80 sm:h-16 sm:w-10" style={{ top: y, transform: `translate(-50%,-50%) scaleX(${flip ? -1 : 1})` }} aria-hidden="true" focusable="false">
      <path d="M20 58C20 40 20 20 20 4" stroke="#6E9B7C" strokeWidth="1.5" fill="none" />
      <path d="M20 44c-10-2-14-8-14-14 8 0 13 5 14 14z M20 30c10-2 14-8 14-14-8 0-13 5-14 14z M20 18c-7-2-9-7-9-11 6 0 9 4 9 11z" fill="#3E7556" />
      <circle cx="30" cy="40" r="3" fill="#7C2236" /><circle cx="12" cy="14" r="2.4" fill="#7C2236" />
    </svg>
  )
}

export default function Table({ places }: { places: TablePlace[] }) {
  const reduce = !!useReducedMotion()
  const left = places.slice(0, 4)
  const right = places.slice(4, 8)
  return (
    <div className={`${styles.tableTop} px-3 py-8 sm:px-8 sm:py-12`}>
      <div className={styles.hem} aria-hidden="true" />
      <svg className="pointer-events-none absolute right-2 top-[38%] h-28 w-28 opacity-[.16]" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <circle cx="50" cy="50" r="38" fill="none" stroke="#7C2236" strokeWidth="6" />
        <circle cx="50" cy="50" r="33" fill="none" stroke="#7C2236" strokeWidth="1.5" strokeDasharray="40 30" />
      </svg>
      <svg className="pointer-events-none absolute left-1 bottom-[14%] h-24 w-24 opacity-[.13]" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <circle cx="50" cy="50" r="36" fill="none" stroke="#7C2236" strokeWidth="5" strokeDasharray="150 80" />
      </svg>
      <ul className="relative grid grid-cols-[1fr_44px_1fr] gap-x-1 gap-y-3 sm:grid-cols-[1fr_88px_1fr] sm:gap-x-4 sm:gap-y-6 list-none p-0">
        {[0, 1, 2, 3].map((r) => (
          <li key={`row-${r}`} className="contents">
            <div className="col-start-1" style={{ gridRow: r + 1 }}>
              <PlaceSetting place={left[r]} index={r * 2} />
            </div>
            <div className="col-start-3" style={{ gridRow: r + 1 }}>
              <PlaceSetting place={right[r]} index={r * 2 + 1} />
            </div>
          </li>
        ))}
        <li aria-hidden="true" className={`${styles.runner} relative col-start-2 row-start-1 row-span-4 list-none`}>
          <Sprig y="8%" />
          <Candle y="25%" delayIdx={0} reduce={reduce} />
          <Sprig y="38%" flip />
          <Candle y="50%" delayIdx={1} reduce={reduce} />
          <Sprig y="62%" />
          <Candle y="75%" delayIdx={2} reduce={reduce} />
          <Sprig y="92%" flip />
        </li>
      </ul>
    </div>
  )
}
