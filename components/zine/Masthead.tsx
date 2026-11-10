'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV } from '@/lib/site'


export default function Masthead() {
  const pathname = usePathname() || '/'
  return (
    <header className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <a
        href="#main"
        className="t-label sr-only z-50 focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:bg-riso-yellow focus:px-3 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <div className="flex flex-wrap items-center justify-between gap-x-6 border-b-2 border-riso-blue pt-2">
        <Link
          href="/"
          aria-current={pathname === '/' ? 'page' : undefined}
          className="t-display inline-flex min-h-[48px] items-center text-xl sm:text-2xl"
          style={{ fontVariationSettings: "'wdth' 120" }}
        >
          Parag&rsquo;s zine
        </Link>
        <nav aria-label="Sections" className="-mx-1 max-w-full overflow-x-auto">
          <ul className="flex gap-x-1 sm:gap-x-3">
            {NAV.map(({ label, href }) => {
              const current = pathname === href || pathname.startsWith(`${href}/`)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={current ? 'page' : undefined}
                    className={`t-label relative inline-flex min-h-[48px] items-center px-1 text-lg transition-colors duration-200 ease-zine hover:text-ink ${
                      current ? 'text-ink' : ''
                    }`}
                  >
                    {label}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-1 bottom-0 h-[5px] origin-left bg-riso-pink transition-transform duration-300 ease-zine ${
                        current ? 'scale-x-100' : 'scale-x-0'
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
