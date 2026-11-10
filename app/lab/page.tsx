import type { Metadata } from 'next'
import Link from 'next/link'
import { DIRECTIONS, EXPERIMENTS } from '@/components/lab/kit/registry'

export const metadata: Metadata = { title: 'Index' }

// The lab's running order: the four directions first, then every technique experiment.
export default function LabIndex() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-20 sm:px-10" style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      <h1 className="text-5xl font-semibold leading-none tracking-tight sm:text-7xl" style={{ textWrap: 'balance' }}>
        Motion lab
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-[#CFC4B4]" style={{ textWrap: 'pretty' }}>
        Prototypes for the next look of the site: four directions, then the techniques they are built from. Nothing here is
        indexed or linked from the live site.
      </p>

      <section aria-labelledby="dir" className="mt-16">
        <h2 id="dir" className="text-2xl font-semibold">Directions</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {DIRECTIONS.map((d) => (
            <li key={d.id}>
              <Link href={`/lab/${d.id}`} className="block h-full rounded-2xl border border-[#3A322C] bg-[#1D1916] p-6 transition hover:border-[#F6B94F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F6B94F]">
                <span className="block text-xl font-semibold">{d.title}</span>
                <span className="mt-2 block text-[#CFC4B4]">{d.line}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="fx" className="mt-16">
        <h2 id="fx" className="text-2xl font-semibold">Technique experiments</h2>
        <ol className="mt-6 divide-y divide-[#3A322C] border-y border-[#3A322C]">
          {EXPERIMENTS.map((e, i) => (
            <li key={e.id}>
              <Link href={`/lab/fx/${e.id}`} className="grid grid-cols-[3rem_1fr] gap-x-4 py-4 transition hover:bg-[#1D1916] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F6B94F] sm:grid-cols-[3rem_14rem_1fr]">
                <span className="text-[#8C7F70]" style={{ fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
                <span className="font-semibold">{e.title}</span>
                <span className="col-start-2 text-[#CFC4B4] sm:col-start-3">{e.line}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
