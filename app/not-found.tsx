import type { Metadata } from 'next'
import Masthead from '@/components/zine/Masthead'
import Footer from '@/components/zine/Footer'
import NotFoundBody from '@/components/zine/NotFoundBody'

export const metadata: Metadata = { title: 'Page not found', robots: { index: false, follow: true } }

// Unmatched URLs render here, outside the (site) layout, so this one brings its own masthead and footer.
export default function NotFound() {
  return (
    <div className="zine flex flex-col">
      <Masthead />
      <main id="main" className="flex flex-1">
        <NotFoundBody />
      </main>
      <Footer />
    </div>
  )
}
