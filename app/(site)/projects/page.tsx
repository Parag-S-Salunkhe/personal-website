import type { Metadata } from 'next'
import { getProjects } from '@/lib/content'
import PrintTitle from '@/components/zine/PrintTitle'
import ProjectSheet from '@/components/zine/ProjectSheet'
import Settle from '@/components/zine/Settle'
import { Empty } from '@/components/zine/SectionHead'
import { tilt } from '@/lib/format'
import { JsonLd, collection } from '@/lib/jsonld'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Things Parag is building and tinkering with between dinners, with what each one is made of and where to see it.',
  alternates: { canonical: '/projects' },
  openGraph: { url: '/projects' },
}

export default async function ProjectsPage() {
  const projects = await getProjects()
  return (
    <>
      <JsonLd data={collection('Projects', '/projects', metadata.description as string, [])} />
    <section aria-labelledby="projects-title" className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:pt-14">
      <div className="mb-10">
        <PrintTitle id="projects-title" lines="Projects" className="text-[clamp(3rem,13vw,6rem)]" />
        <p className="t-hand mt-2 -rotate-1 text-3xl sm:text-4xl">what&rsquo;s on the workbench between dinners</p>
      </div>
      {projects.length === 0 ? (
        <Empty title="The workbench is clear" text="Build sheets for the next things I make will be pinned here." href="/" cta="Back to the front page" />
      ) : (
        <ul className="grid items-start gap-10 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <li key={p.id}>
              <Settle rotate={tilt(i + 1, 0.4)}>
                <ProjectSheet project={p} />
              </Settle>
            </li>
          ))}
        </ul>
      )}
    </section>
    </>
  )
}
