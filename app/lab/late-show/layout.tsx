import { Big_Shoulders, Instrument_Sans } from 'next/font/google'
import './ls.css'

const display = Big_Shoulders({ subsets: ['latin'], weight: ['800', '900'], variable: '--ls-display', display: 'swap' })
const sans = Instrument_Sans({ subsets: ['latin'], variable: '--ls-sans', display: 'swap' })

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${sans.variable} ls-root`}>{children}</div>
}
