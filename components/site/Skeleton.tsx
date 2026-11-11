// Loading states shaped like the page: a heading bar and a grid of poster, card or list blocks.
const block = 'animate-pulse rounded-[3px] bg-[rgb(241_238_230/0.08)]'

export default function Skeleton({ shape = 'card', count = 8 }: { shape?: 'poster' | 'card' | 'list'; count?: number }) {
  const grid = shape === 'poster' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : shape === 'card' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
  const item = shape === 'poster' ? 'aspect-[2/3]' : shape === 'card' ? 'h-64' : 'h-24'
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6" role="status" aria-label="Loading">
      <div className={`${block} h-16 w-64`} />
      <div className={`${block} mt-4 h-5 w-96 max-w-full`} />
      <div className={`${block} mt-10 h-24 w-full`} />
      <div className={`mt-10 grid gap-8 ${grid}`}>
        {Array.from({ length: count }, (_, i) => <div key={i} className={`${block} ${item}`} />)}
      </div>
    </div>
  )
}
