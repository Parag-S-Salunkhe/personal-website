import type { Metadata } from 'next'
import { Gilda_Display, Hanken_Grotesk, Pinyon_Script } from 'next/font/google'
import type { CSSProperties } from 'react'

const gilda = Gilda_Display({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-tfe-display' })
const hanken = Hanken_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-tfe-body' })
const pinyon = Pinyon_Script({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-tfe-script' })

export const metadata: Metadata = {
  title: 'Table for Eight · Design lab',
  robots: { index: false, follow: false },
}

const palette = {
  '--cloth': '#17352A',
  '--cloth-deep': '#10281F',
  '--cloth-lift': '#1D4235',
  '--linen': '#F1EEE6',
  '--candle': '#F6B94F',
  '--claret': '#7C2236',
  '--sage': '#A9C3AE',
  '--wax': '#FFF8EA',
  '--ink': '#17352A',
  '--ink-soft': '#3F5547',
} as CSSProperties

export default function TableForEightLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${gilda.variable} ${hanken.variable} ${pinyon.variable} relative isolate min-h-[100dvh] overflow-x-clip bg-[var(--cloth)] font-[family-name:var(--font-tfe-body)] text-[var(--sage)] antialiased selection:bg-[var(--candle)] selection:text-[var(--cloth)]`}
      style={{ ...palette, caretColor: 'var(--candle)' }}
    >
      {children}
    </div>
  )
}
