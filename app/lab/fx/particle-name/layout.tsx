import { Big_Shoulders, Instrument_Sans } from 'next/font/google'

const display = Big_Shoulders({ subsets: ['latin'], weight: ['800', '900'], variable: '--pn-display', display: 'swap' })
const sans = Instrument_Sans({ subsets: ['latin'], variable: '--pn-sans', display: 'swap' })

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${sans.variable}`}>{children}</div>
}
