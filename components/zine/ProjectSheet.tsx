import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { Github } from '@/components/icons/Brand'
import type { Project } from '@/lib/content'
import { safeHttpUrl, isOptimizable } from '@/lib/url'
import { Staple } from './Marks'

// A build sheet: what it is, what it's made of, where to see it. Links are http(s) only.
export default function ProjectSheet({ project }: { project: Project }) {
  const live = safeHttpUrl(project.projectUrl)
  const code = safeHttpUrl(project.githubUrl)
  const image = safeHttpUrl(project.imageUrl)
  return (
    <article className="relative h-full border-2 border-riso-blue bg-slip">
      <Staple className="left-6 top-[-2px]" />
      <Staple className="right-6 top-[-2px]" />
      <div className="flex items-center justify-between border-b-2 border-riso-blue px-4 py-2">
        <p className="t-label text-lg">Build sheet</p>
        <p className="t-label nums text-lg">Filed {new Date(project.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })}</p>
      </div>
      {image && (
        <div className="duo relative aspect-[16/9] border-b-2 border-riso-blue">
          <Image unoptimized={!isOptimizable(image)} src={image} alt={`Screenshot of ${project.title}`} fill sizes="(min-width: 1024px) 360px, 90vw" />
        </div>
      )}
      <div className="p-4">
        <h2 className="t-title text-2xl [overflow-wrap:anywhere]">{project.title}</h2>
        <p className="mt-2 text-base text-ink">{project.description}</p>
        {project.techStack.length > 0 && (
          <div className="mt-4">
            <p className="t-label text-base">Made with</p>
            <ul className="mt-1 flex flex-wrap gap-1 text-sm text-ink">
              {project.techStack.map((t) => (
                <li key={t} className="border border-riso-blue px-2 py-0.5">{t}</li>
              ))}
            </ul>
          </div>
        )}
        {(live || code) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {live && (
              <a href={live} target="_blank" rel="noopener noreferrer" className="btn btn-line min-h-[44px] text-base">
                <ExternalLink className="h-4 w-4" aria-hidden="true" /> See it live
              </a>
            )}
            {code && (
              <a href={code} target="_blank" rel="noopener noreferrer" className="btn btn-line min-h-[44px] text-base">
                <Github className="h-4 w-4" /> Read the code
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
