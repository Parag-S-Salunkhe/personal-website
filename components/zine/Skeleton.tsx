// Loading skeletons shaped like the page they stand in for (no spinners).
export function CardGridSkeleton({ shape }: { shape: 'poster' | 'clipping' | 'spread' | 'scrap' }) {
  const cell =
    shape === 'poster' ? 'aspect-[2/3]'
      : shape === 'clipping' ? 'aspect-[4/5]'
        : shape === 'spread' ? 'aspect-[2/1]'
          : 'aspect-square'
  const cols =
    shape === 'spread' ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:pt-14" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="h-20 w-2/3 max-w-md animate-pulse bg-riso-blue/15 sm:h-24" />
      <div className="mt-4 h-8 w-1/2 max-w-sm animate-pulse bg-riso-pink/20" />
      <div className="mt-10 h-24 animate-pulse border-y-2 border-riso-blue/30" />
      <div className={`mt-10 grid gap-8 ${cols}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`${cell} animate-pulse bg-riso-blue/10`} />
        ))}
      </div>
    </div>
  )
}
