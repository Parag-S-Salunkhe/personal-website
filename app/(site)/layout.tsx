import Masthead from '@/components/zine/Masthead'
import Footer from '@/components/zine/Footer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="zine flex flex-col">
      <Masthead />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer />
    </div>
  )
}
