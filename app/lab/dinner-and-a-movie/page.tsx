import Link from 'next/link'
import LabTag from '@/components/lab/kit/LabTag'
import { getLabData } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import Pinned from '@/components/lab/dinner-and-a-movie/Pinned'
import { CinemaFrame, DinnerFrame } from '@/components/lab/dinner-and-a-movie/Stills'
import { buildStory } from '@/components/lab/dinner-and-a-movie/data'
import { fmtTime } from '@/components/lab/dinner-and-a-movie/timeline'
import Lazy from '@/components/lab/dinner-and-a-movie/Lazy'

export const metadata = { title: 'Dinner & a movie' }
export const revalidate = 3600

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
const H = 'dm-serif'

export default async function Page() {
  const d = await getLabData()
  const story = buildStory(d)
  const first = story.films[0]
  return (
    <main className="text-[#FFF3D6]" style={{ background: 'var(--eve-page)' }}>
      <LabTag title="Dinner & a movie" />
      <Pinned mode="home" />
      <style>{`.dm-rm{display:none}@media (prefers-reduced-motion: reduce){[data-story]{display:none!important}.dm-rm{display:grid}}[data-story]{height:800vh}@media (max-width:767px){[data-story]{height:620vh}}`}</style>

      <div data-story className="relative">
        <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
          <DinnerFrame className="absolute inset-0" />
          <Lazy data={story} />
          <header data-hero className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-16 sm:px-12 sm:pt-20" style={{ opacity: 'var(--hero, 1)' }}>
            <h1 className={`${H} text-[3.2rem] leading-[0.98] text-[#FFF3D6] sm:text-[6.5rem]`} style={{ textShadow: '0 2px 30px rgba(15,26,46,.75)' }}>Dinner <i>&amp;</i> a movie</h1>
            <p className="mt-4 max-w-md text-lg text-[#FFF3D6]" style={{ textShadow: '0 1px 14px rgba(15,26,46,.9)' }}>One evening at Parag&rsquo;s, seven until one. Scroll and the night goes by: supper first, then the table turns into a cinema.</p>
          </header>
        </div>
      </div>

      <section className="dm-rm gap-6 px-5 py-20 sm:grid-cols-2 sm:px-12" aria-label="Two moments of the evening">
        <figure><h2 className={`${H} mb-3 text-4xl`}>{fmtTime(20)}</h2><DinnerFrame className="aspect-[4/3] w-full rounded-sm" /><figcaption className="mt-2 text-sm text-[#FFF3D6]/80">Supper, dusk in the window.</figcaption></figure>
        <figure><h2 className={`${H} mb-3 text-4xl`}>{fmtTime(23)}</h2><CinemaFrame poster={first?.posterUrl ?? null} className="aspect-[4/3] w-full rounded-sm" /><figcaption className="mt-2 text-sm text-[#FFF3D6]/80">The same room, turned to the wall.</figcaption></figure>
      </section>

      <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-20 sm:px-12">
        <h2 className={`${H} text-5xl sm:text-7xl`}>The rest of the evening, in order</h2>
        <p className="mt-3 max-w-xl text-[#FFF3D6]/80">Everything from the night above, as plain lists.</p>

        <section aria-labelledby="dm-cook" className="mt-16 grid gap-8 border-t border-[#FFF3D6]/20 pt-8 md:grid-cols-[14rem_1fr]">
          <div><h3 id="dm-cook" className={`${H} text-4xl`}><i>8 pm</i> Dinner</h3><Link href="/cooking" className="mt-2 inline-block text-[#F6B94F] underline underline-offset-4">All cooking</Link></div>
          <ul className="grid gap-5 sm:grid-cols-2">
            {d.dishes.slice(0, 6).map((x) => (
              <li key={x.id}><Link href={`/cooking/${x.slug}`} className="group block"><p className={`${H} text-2xl group-hover:text-[#F6B94F]`}>{x.dishName}</p><p className="text-sm text-[#FFF3D6]/75">{x.category} · {x.rating}/5 · {fmt(x.cookDate)}</p></Link></li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="dm-write" className="mt-14 grid gap-8 border-t border-[#FFF3D6]/20 pt-8 md:grid-cols-[14rem_1fr]">
          <div><h3 id="dm-write" className={`${H} text-4xl`}><i>9 pm</i> Conversation</h3><Link href="/blog" className="mt-2 inline-block text-[#F6B94F] underline underline-offset-4">All writing</Link></div>
          <ul className="grid gap-5">
            {d.posts.slice(0, 5).map((p) => (
              <li key={p.id}><Link href={`/blog/${p.slug}`} className="group block"><p className={`${H} text-2xl group-hover:text-[#F6B94F]`}>{p.title}</p><p className="text-sm text-[#FFF3D6]/75">{p.blogType ?? 'Post'} · {fmt(p.publishDate)}</p></Link></li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="dm-notes" className="mt-14 grid gap-8 border-t border-[#FFF3D6]/20 pt-8 md:grid-cols-[14rem_1fr]">
          <div><h3 id="dm-notes" className={`${H} text-4xl`}><i>10 pm</i> Place cards</h3><Link href="/notes" className="mt-2 inline-block text-[#F6B94F] underline underline-offset-4">All notes</Link></div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {d.notes.slice(0, 6).map((n) => (
              <li key={n.id}><Link href={`/notes/${n.slug}`} className="block rounded-[3px] bg-[#F1EEE6] px-5 py-4 text-[#17352A] hover:bg-white" style={{ outline: '1px solid #B88A44', outlineOffset: '-6px' }}><p className={`${H} text-2xl`}>{n.title}</p><p className="text-sm text-[#17352A]/80">{n.category ?? 'Note'} · {fmt(n.createdAt)}</p></Link></li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="dm-films" className="mt-14 grid gap-8 border-t border-[#FFF3D6]/20 pt-8 md:grid-cols-[14rem_1fr]">
          <div>
            <h3 id="dm-films" className={`${H} text-4xl`}><i>11 pm</i> The feature</h3>
            <Link href="/lab/dinner-and-a-movie/movies" className="mt-2 inline-block text-[#F6B94F] underline underline-offset-4">The late programme</Link>
            <br /><Link href="/movies" className="mt-1 inline-block text-[#F6B94F] underline underline-offset-4">All movies</Link>
          </div>
          <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {d.movies.slice(0, 6).map((m) => (
              <li key={m.id}><Link href={`/movies/${m.slug}`} className="group block">
                {m.posterUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={labImg(m.posterUrl, 256) ?? ''} alt="" loading="lazy" className="aspect-[2/3] w-full rounded-[2px] object-cover" />}
                <p className={`${H} mt-2 text-xl group-hover:text-[#F6B94F]`}>{m.title}</p><p className="text-sm text-[#FFF3D6]/75">{m.rating}/5 · {fmt(m.watchDate)}</p>
              </Link></li>
            ))}
          </ul>
        </section>

        <section id="dm-door" aria-labelledby="dm-door-h" className="mt-20 rounded-[3px] bg-[#FFF3D6] px-6 py-8 text-[#0F1A2E] sm:px-10" style={{ outline: '1px solid #B88A44', outlineOffset: '-8px' }}>
          <h3 id="dm-door-h" className={`${H} text-4xl sm:text-5xl`}><i>One o&rsquo;clock.</i> Leave a note by the door</h3>
          {story.door && <p className="mt-4 max-w-2xl text-xl italic">&ldquo;{story.door.message}&rdquo;<span className="ml-2 text-base not-italic text-[#0F1A2E]/70">{fmt(story.door.date)}</span></p>}
          <Link href="/#guest-note" className="mt-6 inline-block rounded-full bg-[#7C2236] px-6 py-3 text-lg text-[#FFF3D6] hover:bg-[#9a2c44]">Sign the guestbook</Link>
        </section>
      </div>
    </main>
  )
}
