import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Design lab',
  robots: { index: false, follow: false },
}

// Neutral frame for the design prototypes: each look paints its own page.
export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <div className="relative isolate min-h-[100dvh] bg-neutral-100 text-neutral-900">{children}</div>
}
