import Link from 'next/link'

/** Small corner tag on every lab page: what this is, and the way back to the index. */
export default function LabTag({ title }: { title: string }) {
  return (
    <Link
      href="/lab"
      className="fixed left-3 top-3 z-[100] rounded-full bg-black/55 px-3 py-1 text-xs text-white/85 backdrop-blur-sm transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
    >
      ← Lab · {title}
    </Link>
  )
}
