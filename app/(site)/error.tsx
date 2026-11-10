'use client'
import Link from 'next/link'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6" aria-labelledby="error-title">
      <p className="t-hand -rotate-1 text-3xl">the printer jammed</p>
      <h1 id="error-title" className="t-display mis mt-2 text-[clamp(2.5rem,9vw,4.5rem)]">Something went wrong</h1>
      <p className="mt-4 max-w-[48ch] text-xl">
        This page didn&rsquo;t load properly. Try again, and if it keeps happening, the rest of the zine is still here.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn">Try again</button>
        <Link href="/" className="btn btn-line">Back to the front page</Link>
      </div>
    </section>
  )
}
