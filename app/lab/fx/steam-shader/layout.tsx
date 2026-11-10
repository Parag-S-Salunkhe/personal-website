import { Gilda_Display, Hanken_Grotesk } from 'next/font/google'

const gilda = Gilda_Display({ subsets: ['latin'], weight: '400', variable: '--font-gilda', display: 'swap' })
const hanken = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-hanken', display: 'swap' })

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${gilda.variable} ${hanken.variable}`} style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif' }}>{children}</div>
}
