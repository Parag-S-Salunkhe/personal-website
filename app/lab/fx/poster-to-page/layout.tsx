import { Big_Shoulders, Instrument_Sans } from 'next/font/google'

const display = Big_Shoulders({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const sans = Instrument_Sans({ subsets: ['latin'], variable: '--font-sans-pp', display: 'swap' })

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div id="p2p-root" className={`${display.variable} ${sans.variable}`} style={{ fontFamily: 'var(--font-sans-pp), system-ui, sans-serif' }}>{children}</div>
}
