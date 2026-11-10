import { Big_Shoulders, Instrument_Sans } from 'next/font/google'

// Big Shoulders is the variable family behind "Big Shoulders Display": wght 100-900 + opsz 10-72.
const display = Big_Shoulders({ subsets: ['latin'], weight: 'variable', axes: ['opsz'], variable: '--font-display-kt', display: 'swap' })
const sans = Instrument_Sans({ subsets: ['latin'], variable: '--font-sans-kt', display: 'swap' })

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${sans.variable}`}>{children}</div>
}
