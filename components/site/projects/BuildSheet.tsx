import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { Github } from '@/components/icons/Brand'
import type { Project } from '@/lib/content'
import { safeHttpUrl, isOptimizable } from '@/lib/url'

// A build sheet on the workbench: what it is, what it's made of, where to see it. Links are http(s) only.
export default function BuildSheet({ project }: { project: Project }) {
  const live = safeHttpUrl(project.projectUrl)
  const code = safeHttpUrl(project.githubUrl)
  const image = safeHttpUrl(project.imageUrl)
  const filed = new Date(project.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })
  return (
    <article className="ev-card relative flex h-full flex-col">
      <span aria-hidden="true" className="absolute left-1/2 top-3 h-3 w-3 -translate-x-1/2 rounded-full bg-[var(--brass)] shadow-[0_2px_3px_rgb(0_0_0/0.4)]" />
      <div className="flex items-center justify-between gap-4 px-6 pb-2 pt-8">
        <p className="ev-name text-3xl text-[var(--claret)]" aria-hidden="true">Build sheet</p>
        <p className="ev-meta ev-soft">Filed {filed}</p>
      </div>
      {image && (
        <div className="relative mx-6 mt-2 aspect-[16/9] overflow-hidden rounded-[2px]">
          <Image unoptimized={!isOptimizable(image)} src={image} alt={`Screenshot of ${project.title}`} fill sizes="(min-width: 1024px) 360px, 90vw" className="object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col px-6 pb-7 pt-4">
        <h2 className="ev-title [overflow-wrap:anywhere]">{project.title}</h2>
        <p className="ev-soft mt-2">{project.description}</p>
        {project.techStack.length > 0 && (
          <div className="mt-5">
            <p className="ev-label">Made with</p>
            <ul className="mt-2 flex flex-wrap gap-1.5 text-sm">
              {project.techStack.map((t) => (
                <li key={t} className="rounded-[3px] border border-[var(--brass)] px-2 py-0.5">{t}</li>
              ))}
            </ul>
          </div>
        )}
        {(live || code) && (
          <div className="mt-auto flex flex-wrap gap-2 pt-6">
            {live && (
              <a href={live} target="_blank" rel="noopener noreferrer" className="ev-btn min-h-[44px] px-4 text-sm">
                <ExternalLink className="h-4 w-4" aria-hidden="true" /> See it live
              </a>
            )}
            {code && (
              <a href={code} target="_blank" rel="noopener noreferrer" className="ev-btn min-h-[44px] border-[var(--cloth)] bg-transparent px-4 text-sm text-[var(--cloth)] hover:border-[var(--claret)] hover:bg-[var(--claret)] hover:text-[var(--wax)] hover:shadow-none">
                <Github className="h-4 w-4" /> Read the code
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
