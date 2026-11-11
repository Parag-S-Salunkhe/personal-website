import type { Metadata } from 'next'
import Nav from '@/components/site/Nav'
import Footer from '@/components/site/Footer'
import NotFoundBody from '@/components/site/NotFoundBody'

export const metadata: Metadata = { title: 'Page not found', robots: { index: false, follow: true } }

// Unmatched URLs render here, outside the (site) layout, so this one brings its own chrome
// (the run 2 evening look; see .claude/redesign-v3/run2/design/SITE.md §8).
export default function NotFound() {
  return (
    <div className="evening flex flex-col">
      <Nav />
      <main id="main" className="flex flex-1">
        <NotFoundBody />
      </main>
      <Footer />
    </div>
  )
}
