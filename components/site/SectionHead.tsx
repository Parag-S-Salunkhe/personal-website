import Link from 'next/link'

/** A section heading on cloth: optional place-card name in script (decorative), the h2, an "All the …" link. */
export function SectionHead({ id, title, name, text, href, linkLabel }: { id: string; title: string; name?: string; text?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <div className="min-w-0">
        {name && <p aria-hidden="true" className="ev-name text-4xl text-[var(--candle)]">{name}</p>}
        <h2 id={id} className="ev-h2 text-[var(--wax)]">{title}</h2>
        {text && <p className="mt-2 max-w-[52ch] text-[var(--sage)]">{text}</p>}
      </div>
      {href && linkLabel && (
        <Link href={href} className="ev-link inline-flex min-h-[44px] items-center">{linkLabel}</Link>
      )}
    </div>
  )
}

/** An empty place setting: the composed invitation shown when there's nothing to list. */
export function EmptySetting({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 120" className={className} aria-hidden="true">
      <rect x="22" y="40" width="4" height="62" rx="2" fill="#C9C2B2" />
      <path d="M18 40 v18 M24 40 v18 M30 40 v18" stroke="#C9C2B2" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="110" cy="66" r="50" fill="#b98c47" opacity=".9" />
      <circle cx="110" cy="66" r="45" fill="#F4F1EA" />
      <circle cx="110" cy="66" r="31" fill="none" stroke="#E4DFD2" strokeWidth="1.5" />
      <rect x="190" y="40" width="5" height="62" rx="2.5" fill="#C9C2B2" />
      <path d="M190 40 q10 14 0 30" fill="#C9C2B2" />
    </svg>
  )
}

/** The composed empty state: a linen card with an empty place setting, a line, and a way back. */
export function Empty({ title, text, href, cta }: { title: string; text: string; href?: string; cta?: string }) {
  return (
    <div className="ev-card mx-auto grid max-w-xl justify-items-center gap-3 px-8 py-10 text-center">
      <EmptySetting className="h-auto w-48" />
      <p className="ev-title mt-2">{title}</p>
      <p className="ev-soft max-w-[40ch]">{text}</p>
      {href && cta && <Link href={href} className="ev-btn mt-2">{cta}</Link>}
    </div>
  )
}
