import Link from 'next/link'

// A section title in the display face with the host's scribble under it, and the way in.
export function SectionHead({
  id,
  title,
  scribble,
  href,
  linkLabel,
}: {
  id: string
  title: string
  scribble?: string
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div>
        <h2 id={id} className="t-display mis text-[clamp(2.25rem,8vw,3.75rem)]">{title}</h2>
        {scribble && <p className="t-hand -rotate-1 pt-2 text-3xl">{scribble}</p>}
      </div>
      {href && linkLabel && (
        <Link href={href} className="t-label ink-link inline-flex min-h-[44px] items-center text-xl">{linkLabel}</Link>
      )}
    </div>
  )
}

// A composed invitation in a dashed clipping, never a blank panel.
export function Empty({ title, text, href, cta, art }: { title: string; text: string; href?: string; cta?: string; art?: React.ReactNode }) {
  return (
    <div className="cut relative mx-auto max-w-2xl bg-slip/60 px-6 py-10 text-center">
      {art && <div className="mx-auto mb-4 w-40">{art}</div>}
      <p className="t-title text-2xl">{title}</p>
      <p className="mx-auto mt-2 max-w-[44ch] text-lg">{text}</p>
      {href && cta && (
        <Link href={href} className="t-label ink-link mt-3 inline-flex min-h-[44px] items-center text-xl">{cta}</Link>
      )}
    </div>
  )
}

// The page opener every list and item page shares: back link, the print-run title, a scribble.
export function Section({ id, className = '', children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className={`mx-auto max-w-6xl px-4 sm:px-6 ${className}`}>
      {children}
    </section>
  )
}
