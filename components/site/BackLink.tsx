import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex min-h-[44px] items-center gap-2 text-[var(--candle)] hover:text-[var(--wax)]">
      <ArrowLeft className="h-5 w-5 transition-transform duration-300 ease-[var(--ease-ev)] group-hover:-translate-x-1" aria-hidden="true" />
      <span className="underline decoration-1 underline-offset-4 group-hover:decoration-2">{children}</span>
    </Link>
  )
}
