import Link from 'next/link'
import { EmptySetting } from './SectionHead'

// The 404 body, shared by the root not-found (own chrome) and (site)/not-found (inside the site layout).
export default function NotFoundBody() {
  return (
    <div className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-[1.1fr_1fr]">
      <div>
        <p aria-hidden="true" className="ev-name text-5xl text-[var(--candle)]">Nobody here</p>
        <h1 className="ev-display mt-2 text-[var(--wax)]">This seat is free</h1>
        <p className="mt-5 max-w-[42ch] text-xl text-[var(--sage)]">
          There&rsquo;s no page at this address. It may have moved when the site was re-laid, or the link had a typo.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="ev-btn">Back to the table</Link>
          <Link href="/movies" className="ev-btn ev-btn-line">See what&rsquo;s been on</Link>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-sm" aria-hidden="true">
        <div className="absolute inset-[-20%] rounded-full bg-[radial-gradient(closest-side,rgb(246_185_79/0.28),transparent)]" />
        <div className="ev-card relative px-8 pb-10 pt-8 text-center">
          <EmptySetting className="mx-auto h-auto w-full" />
          <p className="ev-name mt-6 text-5xl text-[var(--claret)]">For you</p>
          <p className="ev-soft mt-1">404, the place card says.</p>
        </div>
      </div>
    </div>
  )
}
