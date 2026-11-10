import { Bricolage_Grotesque, Figtree } from 'next/font/google'

const display = Bricolage_Grotesque({ subsets: ['latin'], axes: ['opsz'], variable: '--wc-display', display: 'swap' })
const sans = Figtree({ subsets: ['latin'], variable: '--wc-sans', display: 'swap' })

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${sans.variable}`}>{children}</div>
}
