import { Big_Shoulders, Gilda_Display, Hanken_Grotesk, Instrument_Sans } from 'next/font/google'

const big = Big_Shoulders({ subsets: ['latin'], variable: '--font-big', display: 'swap' })
const inst = Instrument_Sans({ subsets: ['latin'], variable: '--font-inst', display: 'swap' })
const gilda = Gilda_Display({ subsets: ['latin'], weight: '400', variable: '--font-gilda', display: 'swap' })
const hanken = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-hanken', display: 'swap' })

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${big.variable} ${inst.variable} ${gilda.variable} ${hanken.variable}`} style={{ fontFamily: 'var(--font-inst), system-ui, sans-serif' }}>{children}</div>
}
