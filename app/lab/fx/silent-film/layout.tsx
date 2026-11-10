import { Playfair_Display_SC, Old_Standard_TT } from 'next/font/google'

const sc = Playfair_Display_SC({ subsets: ['latin'], weight: ['400', '700', '900'], variable: '--font-sc', display: 'swap' })
const ital = Old_Standard_TT({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'], variable: '--font-ital', display: 'swap' })

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${sc.variable} ${ital.variable}`}>{children}</div>
}
