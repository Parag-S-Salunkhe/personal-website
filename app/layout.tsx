import type { Metadata, Viewport } from 'next'
import { Anybody, Literata, Reenie_Beanie } from 'next/font/google'
import './globals.css'
import { siteName, siteUrl } from '@/lib/site'

const anybody = Anybody({ subsets: ['latin'], axes: ['wdth'], display: 'swap', variable: '--font-anybody' })
const literata = Literata({ subsets: ['latin'], style: ['normal', 'italic'], display: 'swap', variable: '--font-literata' })
const reenie = Reenie_Beanie({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-reenie', preload: false })

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName}: supper clubs, movie nights and home cooking`, template: `%s | ${siteName}` },
  description:
    "Parag Salunkhe's corner of the internet: the movies from movie night, the dishes from the supper club table, and the things he wrote down. Leave a note on the way out.",
  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  icons: { icon: '/favicon.ico' },
  openGraph: { type: 'website', siteName, locale: 'en_IE' },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F1F1EC',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IE" className={`${anybody.variable} ${literata.variable} ${reenie.variable}`}>
      <body>{children}</body>
    </html>
  )
}
