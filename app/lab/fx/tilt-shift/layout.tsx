import { Gilda_Display, Hanken_Grotesk } from 'next/font/google'

const display = Gilda_Display({ subsets: ['latin'], weight: '400', variable: '--ts-display', display: 'swap' })
const sans = Hanken_Grotesk({ subsets: ['latin'], variable: '--ts-sans', display: 'swap' })

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${sans.variable}`}>{children}</div>
}
