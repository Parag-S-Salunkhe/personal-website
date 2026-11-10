import type { Metadata } from 'next'
import { Archivo } from 'next/font/google'
import type { CSSProperties } from 'react'
import s from '@/components/lab/bold-kitchen/styles.module.css'

const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  axes: ['wdth'],
  variable: '--bk-archivo',
})

export const metadata: Metadata = {
  title: 'Bold Kitchen',
  robots: { index: false, follow: false },
}

const palette = {
  '--tile': '#F6F6F1',
  '--grout': '#E6E6DD',
  '--ink': '#17171C',
  '--tomato': '#E5421E',
  '--cobalt': '#1E4FA3',
  '--mustard': '#F2B33D',
  '--pea': '#3E7B4F',
} as CSSProperties

export default function BoldKitchenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={palette}
      className={`${archivo.variable} ${s.root} relative isolate min-h-[100dvh] overflow-x-clip bg-[var(--tile)] text-[var(--ink)]`}
    >
      {children}
    </div>
  )
}
