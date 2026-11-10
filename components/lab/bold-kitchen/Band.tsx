import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import s from './styles.module.css'

type Props = {
  id: string
  title: string
  blurb: string
  href: string
  linkLabel: string
  bg: string
  fg: string
  dark?: boolean
  children: React.ReactNode
}

/** A big enamel colour field: giant category word, one line, a link out, then the row. */
export default function Band({ id, title, blurb, href, linkLabel, bg, fg, dark, children }: Props) {
  return (
    <section
      aria-labelledby={id}
      className={`${dark ? s.onDark : ''} mx-2 mt-2 rounded-[2rem] px-4 py-12 md:mx-4 md:mt-3 md:rounded-[3rem] md:px-12 md:py-20`}
      style={{ background: bg, color: fg }}
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 id={id} className={s.display} style={{ fontSize: 'clamp(3.5rem, 14vw, 11rem)' }}>
            {title}
          </h2>
          <div className="flex max-w-[34ch] flex-col items-start gap-4 md:pb-3">
            <p className={`${s.body} text-lg md:text-xl`}>{blurb}</p>
            <Link
              href={href}
              className={`${s.press} inline-flex h-11 items-center gap-2 rounded-full px-5 text-base font-bold`}
              style={{ background: fg, color: bg }}
            >
              {linkLabel}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="mt-10 md:mt-16">{children}</div>
      </div>
    </section>
  )
}

export function Empty({ text }: { text: string }) {
  return (
    <p className={`${s.title} max-w-[28ch] rounded-3xl border-2 border-current p-6 text-2xl`}>{text}</p>
  )
}
