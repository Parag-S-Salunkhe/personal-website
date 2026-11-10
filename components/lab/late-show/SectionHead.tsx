import Link from 'next/link'
import s from './styles.module.css'

export default function SectionHead({ id, title, line, href, cta }: { id: string; title: string; line: string; href: string; cta: string }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-xl">
        <h2 id={id} className={`${s.display} text-5xl sm:text-6xl text-[var(--beam)]`}>{title}</h2>
        <p className="mt-3 text-base text-[var(--beam)]/80">{line}</p>
      </div>
      <Link href={href} className="inline-flex min-h-[44px] w-fit items-center border border-[var(--brass)] px-4 text-sm font-semibold text-[var(--brass)] hover:bg-[var(--brass)] hover:text-[var(--velvet)] active:translate-y-px">
        {cta}
      </Link>
    </div>
  )
}
