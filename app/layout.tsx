import type { Metadata, Viewport } from 'next'
import { Anybody, Gilda_Display, Hanken_Grotesk, Literata, Pinyon_Script, Reenie_Beanie } from 'next/font/google'
import './globals.css'
import { siteName, siteUrl } from '@/lib/site'

const anybody = Anybody({ subsets: ['latin'], axes: ['wdth'], display: 'swap', variable: '--font-anybody' })
const literata = Literata({ subsets: ['latin'], style: ['normal', 'italic'], display: 'swap', variable: '--font-literata' })
const reenie = Reenie_Beanie({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-reenie', preload: false })
// The site's look (run 2, "one evening at Parag's"); the zine fonts above stay for /admin.
const gilda = Gilda_Display({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-gilda' })
const hanken = Hanken_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-hanken' })
const pinyon = Pinyon_Script({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-pinyon', preload: false })

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName}: supper clubs, movie nights and home cooking`, template: `%s | ${siteName}` },
  description:
    "Parag's zine: the movies from movie night, the dishes from the supper club table, and the things he wrote down. Leave a note on the way out.",
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
  themeColor: '#17352A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IE" className={`${anybody.variable} ${literata.variable} ${reenie.variable} ${gilda.variable} ${hanken.variable} ${pinyon.variable}`}>
      <body>{children}</body>
    </html>
  )
}
