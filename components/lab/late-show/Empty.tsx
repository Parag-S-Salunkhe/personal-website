import Link from 'next/link'
export default function Empty({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="flex flex-col items-start gap-3 border border-dashed border-[var(--brass)]/60 p-6">
      <p className="max-w-md">{text}</p>
      <Link href={href} className="inline-flex min-h-[44px] items-center text-[var(--tungsten)] underline">{cta}</Link>
    </div>
  )
}
