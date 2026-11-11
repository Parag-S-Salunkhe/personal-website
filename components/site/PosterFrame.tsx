import Image from 'next/image'
import { isOptimizable } from '@/lib/url'

/** A film poster (2:3) through next/image, or a drawn "no poster yet" card in the same frame. */
export default function PosterFrame({ src, title, sizes, priority = false, className = '' }: { src: string | null; title: string; sizes: string; priority?: boolean; className?: string }) {
  return (
    <div className={`relative aspect-[2/3] overflow-hidden rounded-[3px] bg-[var(--night)] ${className}`}>
      {src ? (
        <Image unoptimized={!isOptimizable(src)} src={src} alt={`Poster for ${title}`} fill priority={priority} sizes={sizes} className="object-cover" />
      ) : (
        <div role="img" aria-label={`No poster for ${title} yet`} className="absolute inset-0 grid place-items-center p-4 text-center">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_30%,rgb(255_243_214/0.25),transparent_70%)]" />
          <span className="ev-serif relative text-xl text-[var(--wax)] [overflow-wrap:anywhere]">{title}</span>
        </div>
      )}
    </div>
  )
}
