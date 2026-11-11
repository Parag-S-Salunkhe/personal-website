import type { Metadata } from 'next'
import { getProjects } from '@/lib/content'
import { Empty } from '@/components/site/SectionHead'
import BuildSheet from '@/components/site/projects/BuildSheet'
import { Lamp, Settle } from '@/components/site/projects/Bench'
import { JsonLd, collection } from '@/lib/jsonld'
import { ogBase } from '@/lib/site'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Things Parag is building and tinkering with between dinners, with what each one is made of and where to see it.',
  alternates: { canonical: '/projects' },
  openGraph: { ...ogBase, url: '/projects' },
}

export default async function ProjectsPage() {
  const projects = await getProjects()
  return (
    <>
      <JsonLd data={collection('Projects', '/projects', metadata.description as string, [])} />
      <section aria-labelledby="projects-title" className="mx-auto max-w-6xl px-4 pb-8 pt-16 sm:px-6 lg:pt-20">
        <div className="mb-14 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p aria-hidden="true" className="ev-name text-4xl text-[var(--candle)]">The workbench</p>
            <h1 id="projects-title" className="ev-display text-[var(--wax)]">Projects</h1>
            <p className="mt-4 max-w-[46ch] text-lg text-[var(--sage)]">What&rsquo;s on the workbench between dinners: what each thing is made of, and where to see it.</p>
          </div>
          <svg viewBox="0 0 120 120" className="hidden h-28 w-auto md:block" aria-hidden="true">
            <path d="M20 112 h50" stroke="var(--brass)" strokeWidth="4" strokeLinecap="round" />
            <path d="M45 112 L45 70 L82 34" stroke="var(--brass)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M70 22 L104 46 L92 60 L60 36 Z" fill="var(--claret)" />
            <defs>
              <linearGradient id="lamp-cone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#F6B94F" stopOpacity=".55" />
                <stop offset="1" stopColor="#F6B94F" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M92 60 L118 120 L52 120 Z" fill="url(#lamp-cone)" />
            <circle cx="92" cy="58" r="4" fill="#FFF3D6" className="ev-glow" />
          </svg>
        </div>
        {projects.length === 0 ? (
          <Empty title="The workbench is clear" text="Build sheets for the next things I make will be pinned here." href="/" cta="Back to the table" />
        ) : (
          <Lamp>
            <ul className="grid items-stretch gap-10 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <li key={p.id}>
                  <Settle i={i}>
                    <BuildSheet project={p} />
                  </Settle>
                </li>
              ))}
            </ul>
          </Lamp>
        )}
      </section>
    </>
  )
}
