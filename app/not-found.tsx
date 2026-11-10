import type { Metadata } from 'next'
import Link from 'next/link'
import Masthead from '@/components/zine/Masthead'
import Footer from '@/components/zine/Footer'
import { Tape } from '@/components/zine/Marks'

export const metadata: Metadata = { title: 'Page not found', robots: { index: false, follow: true } }

// Root 404: rendered outside the (site) layout, so it brings its own masthead and footer.
export default function NotFound() {
  return (
    <div className="zine flex flex-col">
      <Masthead />
      <main id="main" className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="t-hand -rotate-2 text-4xl">well, this is awkward</p>
          <h1 className="t-display mis mt-2 text-[clamp(4rem,18vw,9rem)]">404</h1>
          <p className="mt-4 max-w-[40ch] text-xl">
            This page fell out of the zine. It may have moved when the site got its new look, or the link had a typo.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="btn">Back to the front page</Link>
            <Link href="/movies" className="btn btn-line">See what&rsquo;s been on</Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-sm rotate-2" aria-hidden="true">
          <Tape className="-top-3 left-8 -rotate-6" />
          <Tape className="-top-3 right-8 rotate-6" pink />
          <div className="torn bg-slip px-6 pb-12 pt-10">
            <div className="halftone-blue h-40 opacity-30" />
            <p className="t-title mt-4 text-2xl">Missing page</p>
            <p className="t-hand mt-1 text-3xl">if found, return to the front</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
