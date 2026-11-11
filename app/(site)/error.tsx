'use client'
import Link from 'next/link'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-[1.2fr_1fr]" aria-labelledby="error-title">
      <div>
        <h1 id="error-title" className="ev-display text-[var(--wax)]">The candle went out</h1>
        <p className="mt-5 max-w-[46ch] text-xl text-[var(--sage)]">
          This page didn&rsquo;t load properly. Try again; if it keeps happening, the rest of the table is still set.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="ev-btn">Try again</button>
          <Link href="/" className="ev-btn ev-btn-line">Back to the table</Link>
        </div>
      </div>
      <svg viewBox="0 0 120 200" className="mx-auto h-64 w-auto" aria-hidden="true">
        <path d="M60 18 C62 40 54 52 64 70" fill="none" stroke="rgb(169 195 174 / .55)" strokeWidth="3" strokeLinecap="round" className="motion-safe:animate-pulse" />
        <rect x="58.5" y="74" width="3" height="10" fill="#2a1d12" />
        <rect x="44" y="82" width="32" height="96" rx="3" fill="var(--linen)" />
        <path d="M44 92 q6 8 0 18" fill="#E4DFD2" />
        <ellipse cx="60" cy="182" rx="40" ry="8" fill="var(--brass)" />
      </svg>
    </section>
  )
}
