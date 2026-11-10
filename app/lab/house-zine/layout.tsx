import type { Metadata } from 'next'
import { Anybody, Literata, Reenie_Beanie } from 'next/font/google'
import styles from '@/components/lab/house-zine/styles.module.css'

const anybody = Anybody({ subsets: ['latin'], axes: ['wdth'], display: 'swap', variable: '--font-anybody' })
const literata = Literata({ subsets: ['latin'], style: ['normal', 'italic'], display: 'swap', variable: '--font-literata' })
const reenie = Reenie_Beanie({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-reenie' })

export const metadata: Metadata = { title: 'House zine (lab)', robots: { index: false, follow: false } }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${anybody.variable} ${literata.variable} ${reenie.variable} ${styles.root} min-h-[100dvh]`}>{children}</div>
}
