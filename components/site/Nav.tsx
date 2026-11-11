'use client'
// The persistent link row: always at the top, so nobody has to scroll through the evening to find a page.
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV } from '@/lib/site'

export default function Nav() {
  const pathname = usePathname() || '/'
  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(184_138_68/0.35)] bg-[var(--cloth-deep)]">
      <a
        href="#main"
        className="ev-label sr-only z-50 focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded-[3px] focus:bg-[var(--candle)] focus:px-3 focus:py-2 focus:text-[var(--cloth)]"
      >
        Skip to content
      </a>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 px-4 sm:px-6">
        <Link
          href="/"
          aria-current={pathname === '/' ? 'page' : undefined}
          className="group inline-flex min-h-[52px] items-center text-[var(--wax)]"
        >
          <span className="inline-flex items-baseline gap-1.5">
            <span className="ev-serif text-2xl">Parag&rsquo;s</span>
            <span aria-hidden="true" className="ev-name inline-block text-[1.7rem] text-[var(--candle)] transition-transform duration-300 ease-[var(--ease-ev)] group-hover:-rotate-3">table</span>
          </span>
          <span className="sr-only">: home</span>
        </Link>
        <a href="/#guest-note" className="ev-btn order-2 min-h-[40px] px-4 text-sm md:order-3">Leave a note</a>
        <nav aria-label="Sections" className="order-3 -mx-2 w-full md:order-2 md:mx-0 md:w-auto md:flex-1">
          <ul className="flex justify-between gap-x-1 sm:justify-start sm:gap-x-4 md:justify-end">
            {NAV.map(({ label, href }) => {
              const current = pathname === href || pathname.startsWith(`${href}/`)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={current ? 'page' : undefined}
                    className={`group relative inline-flex min-h-[44px] items-center px-2 text-[0.9375rem] transition-colors duration-200 sm:text-base ${
                      current ? 'text-[var(--wax)]' : 'text-[var(--sage)] hover:text-[var(--wax)]'
                    }`}
                  >
                    {label}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-2 bottom-2 h-[2px] origin-left rounded-full bg-[var(--candle)] shadow-[0_0_8px_rgb(246_185_79/0.8)] transition-transform duration-300 ease-[var(--ease-ev)] ${
                        current ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'
                      }`}
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </header>
  )
}
