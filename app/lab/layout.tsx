import type { Metadata } from 'next'
import SmoothScroll from '@/components/lab/kit/SmoothScroll'

export const metadata: Metadata = {
  title: { default: 'Motion lab', template: '%s · Motion lab' },
  robots: { index: false, follow: false },
}

// The motion lab's own frame: no site masthead, one shared Lenis smooth scroll (window scroll).
// Each experiment and direction paints its own page.
export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <div className="relative isolate min-h-[100dvh] bg-[#14110F] text-[#F3EDE4] antialiased">{children}</div>
    </SmoothScroll>
  )
}
