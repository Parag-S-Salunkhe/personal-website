import type { Metadata } from 'next'
import type { CSSProperties, ReactNode } from 'react'
import { Big_Shoulders, Instrument_Sans } from 'next/font/google'
import s from '@/components/lab/late-show/styles.module.css'

const display = Big_Shoulders({ subsets: ['latin'], weight: ['800', '900'], display: 'swap', variable: '--font-display' })
const body = Instrument_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-body' })

export const metadata: Metadata = { title: "Late Show: tonight at Parag's", robots: { index: false, follow: false } }

const palette = {
  '--velvet': '#2B0B14', '--curtain': '#6B1A2B', '--brass': '#D8A84E', '--beam': '#FFF3D6', '--tungsten': '#FF9F43', '--seat': '#1F5C5A',
} as CSSProperties

export default function LateShowLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${display.variable} ${body.variable} ${s.scope} ${s.grain} min-h-[100dvh]`} style={palette}>
      {children}
    </div>
  )
}
