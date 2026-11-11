import Link from 'next/link'
import { fmtDate } from '@/lib/format'
import { Flap } from './InviteCard'
import './writing.css'

/** A small envelope link to the older / newer post. The flap opens on hover/focus. */
export default function Envelope({ href, kicker, title, date, align = 'left' }: { href: string; kicker: string; title: string; date: string; align?: 'left' | 'right' }) {
  return (
    <div className="pt-9">
      <Link
        href={href}
        className={`wr-inv wr-inv-sm ev-card relative block px-6 pb-5 pt-[calc(var(--flap)+1rem)] ${align === 'right' ? 'text-right' : ''}`}
      >
        <Flap />
        <span className="ev-label block text-[var(--claret)]">{kicker}</span>
        <span className="ev-title mt-1 block [overflow-wrap:anywhere]">{title}</span>
        <span className="ev-meta ev-soft mt-1 block">{fmtDate(date)}</span>
      </Link>
    </div>
  )
}
