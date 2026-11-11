import Nav from '@/components/site/Nav'
import Footer from '@/components/site/Footer'
import SmoothScroll from '@/components/site/SmoothScroll'

// One evening at Parag's (run 2): the candle-lit table look. Spec: .claude/redesign-v3/run2/design/SITE.md
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="evening flex flex-col">
      <SmoothScroll>
        <Nav />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
      </SmoothScroll>
    </div>
  )
}
