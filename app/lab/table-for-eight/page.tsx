import LabTag from '@/components/lab/kit/LabTag'
import { getLabData } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import Lazy from '@/components/lab/table-for-eight/Lazy'
import Reveals from '@/components/lab/table-for-eight/Reveals'
import Plate from '@/components/lab/table-for-eight/Plate'
import Guests from '@/components/lab/table-for-eight/Guests'
import { BASE, buildCards, buildStage, fmt, shorten, stars } from '@/components/lab/table-for-eight/content'

export const metadata = { title: 'Table for eight' }
export const revalidate = 3600

const serif = { fontFamily: 'var(--font-gilda), Georgia, serif' } as const
const script = { fontFamily: 'var(--font-pinyon), cursive' } as const

export default async function Page() {
  const d = await getLabData()
  const cards = buildCards(d)
  const stage = buildStage(d)
  const movies = d.movies.slice(0, 6)
  const dishes = d.dishes.slice(0, 4)
  const posts = d.posts.slice(0, 3)
  const notes = d.notes.slice(0, 6)

  return (
    <main className="bg-[#17352A] text-[#F1EEE6]">
      <LabTag title="Table for eight" />
      <style>{`@media (prefers-reduced-motion: reduce){[data-story]{height:auto!important}}`}</style>
      <div data-story className="relative h-[420vh] sm:h-[720vh]">
        <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
          {/* static poster frame, replaced by the scene once it paints */}
          <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(60% 42% at 50% 56%, rgba(246,185,79,.42), rgba(246,185,79,0) 70%), radial-gradient(90% 60% at 50% 60%, #17352A 0%, #10281F 55%, #0b0f0d 100%)' }}>
            <div className="absolute left-1/2 top-[56%] h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-[#FFF8EA]" style={{ boxShadow: '0 0 28px 12px rgba(246,185,79,.8), -180px 6px 22px 8px rgba(246,185,79,.55), 190px 4px 22px 8px rgba(246,185,79,.55)' }} />
          </div>
          <Lazy cards={cards} stage={stage} />
          <header data-hero className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-16 sm:px-12 sm:pt-20" style={{ opacity: 'var(--hero, 1)' }}>
            <h1 className="text-5xl leading-[1.02] text-[#FFF8EA] sm:text-7xl" style={{ ...serif, textShadow: '0 2px 24px rgba(0,0,0,.6)' }}>Table for eight</h1>
            <p className="mt-3 max-w-md text-base text-[#F1EEE6]" style={{ textShadow: '0 1px 14px rgba(0,0,0,.8)' }}>Supper is at eight. Light the candles, take your seat, and scroll: the camera goes round the table one course at a time.</p>
          </header>
        </div>
      </div>

      <Reveals>
        {/* the film course */}
        <section className="relative mx-auto max-w-6xl px-6 py-24 sm:px-12" aria-labelledby="film-h">
          <h2 id="film-h" data-mv="wipe" className="text-4xl text-[#FFF8EA] sm:text-6xl" style={serif}>The film course</h2>
          <p className="mt-3 max-w-xl text-[#A9C3AE]">What went on the screen after supper, most recent first.</p>
          <div data-mv="unroll" className="mt-10 grid gap-8 rounded-[3px] bg-[#F1EEE6] p-6 text-[#17352A] shadow-[0_30px_60px_rgba(0,0,0,.45)] sm:grid-cols-[1.4fr_1fr] sm:p-10" style={{ outline: '1px solid #B88A44', outlineOffset: '-10px' }}>
            <ol data-mv="lines" className="divide-y divide-[#17352A]/15">
              {movies.map((m) => (
                <li key={m.id} className="flex items-baseline gap-4 py-3">
                  <span className="min-w-0 flex-1 text-xl sm:text-2xl" style={serif}>{m.title}</span>
                  <span className="shrink-0 tracking-wide text-[#7C2236]" aria-label={`Rated ${m.rating} of 5`}>{stars(m.rating)}</span>
                  <span className="hidden shrink-0 text-sm tabular-nums text-[#17352A]/70 sm:inline">{fmt(m.watchDate)}</span>
                </li>
              ))}
            </ol>
            <div data-mv="deal" className="flex items-start justify-center gap-3">
              {movies.filter((m) => m.posterUrl).slice(0, 3).map((m, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={m.id} src={labImg(m.posterUrl, 384) ?? ''} alt={`Poster for ${m.title}`} loading="lazy" className="w-[30%] rounded-[2px] shadow-[0_10px_24px_rgba(0,0,0,.35)] sm:w-[32%]" style={{ transform: `rotate(${(i - 1) * 3}deg) translateY(${i === 1 ? 14 : 0}px)` }} />
              ))}
            </div>
          </div>
          <a href={`${BASE}/movies`} className="mt-6 inline-block text-[#F6B94F] underline underline-offset-4 hover:text-[#FFF8EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F6B94F]">See the whole menu card</a>
        </section>

        {/* the kitchen */}
        <section className="relative bg-[#10281F] px-6 py-24 sm:px-12" aria-labelledby="kitchen-h">
          <div className="mx-auto max-w-6xl">
            <h2 id="kitchen-h" data-mv="wipe" className="text-4xl text-[#FFF8EA] sm:text-6xl" style={serif}>From the kitchen</h2>
            <ul data-mv="deal" className="mt-12 grid gap-10 sm:grid-cols-2">
              {dishes.map((c) => (
                <li key={c.id} className="flex items-center gap-6">
                  <Plate name={c.dishName} className="w-28 shrink-0 drop-shadow-[0_14px_18px_rgba(0,0,0,.5)] sm:w-36" />
                  <div>
                    <p className="text-2xl text-[#FFF8EA]" style={serif}>{c.dishName}</p>
                    <p className="mt-1 text-sm text-[#F6B94F]">{c.category} · {c.rating}/5 · {fmt(c.cookDate)}</p>
                    {c.ingredients.length > 0 && <p className="mt-2 text-sm text-[#A9C3AE]">{shorten(c.ingredients.join(', '), 90)}</p>}
                  </div>
                </li>
              ))}
            </ul>
            <a href="/cooking" className="mt-10 inline-block text-[#F6B94F] underline underline-offset-4 hover:text-[#FFF8EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F6B94F]">The whole kitchen</a>
          </div>
        </section>

        {/* the reading */}
        <section className="relative mx-auto max-w-6xl px-6 py-24 sm:px-12" aria-labelledby="read-h">
          <h2 id="read-h" data-mv="wipe" className="text-4xl text-[#FFF8EA] sm:text-6xl" style={serif}>The reading</h2>
          <p className="mt-3 max-w-xl text-[#A9C3AE]">Each post arrives as an invitation.</p>
          <ul data-mv="deal" className="mt-10 grid gap-8 md:grid-cols-3">
            {posts.map((p, i) => (
              <li key={p.id}>
                <a href="/blog" className="group relative block rounded-[3px] bg-[#F6F1E4] px-6 pb-7 pt-12 text-[#17352A] shadow-[0_20px_40px_rgba(0,0,0,.45)] transition-transform duration-500 hover:-translate-y-2 hover:rotate-[-1deg] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F6B94F]" style={{ outline: '1px solid #B88A44', outlineOffset: '-7px' }}>
                  <span aria-hidden className="absolute inset-x-0 top-0 h-9 origin-top bg-[#7C2236] transition-transform duration-500 group-hover:[transform:rotateX(180deg)]" style={{ clipPath: 'polygon(0 0,100% 0,50% 100%)' }} />
                  <p className="text-3xl leading-none text-[#7C2236]" style={script}>{i === 0 ? 'Newest' : 'You are invited'}</p>
                  <p className="mt-3 text-2xl leading-snug" style={serif}>{p.title}</p>
                  <p className="mt-2 text-sm text-[#17352A]/80">{shorten(p.excerpt, 130)}</p>
                  <p className="mt-3 text-sm text-[#17352A]/70">{fmt(p.publishDate)}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* notes */}
        <section className="relative overflow-hidden bg-[#10281F] px-6 py-24 sm:px-12" aria-labelledby="notes-h">
          <div className="mx-auto max-w-6xl">
            <h2 id="notes-h" data-mv="wipe" className="text-4xl text-[#FFF8EA] sm:text-6xl" style={serif}>Place cards</h2>
            <p className="mt-3 max-w-xl text-[#A9C3AE]">Short notes, propped up where you can read them.</p>
            <ul data-mv="fan" className="mt-14 flex flex-wrap justify-center gap-y-8 sm:flex-nowrap sm:justify-start">
              {notes.map((n, i) => (
                <li key={n.id} className="sm:-ml-4 sm:first:ml-0" style={{ transform: `rotate(${(i - (notes.length - 1) / 2) * 4}deg)`, zIndex: i }}>
                  <a href="/notes" className="block h-40 w-44 rounded-[3px] bg-[#F6F1E4] px-4 py-4 text-[#17352A] shadow-[0_14px_30px_rgba(0,0,0,.5)] transition-transform duration-300 hover:-translate-y-3 focus-visible:-translate-y-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F6B94F]" style={{ outline: '1px solid #B88A44', outlineOffset: '-5px' }}>
                    <p className="text-2xl leading-none text-[#7C2236]" style={script}>{n.category ?? 'Note'}</p>
                    <p className="mt-2 text-lg leading-snug" style={serif}>{shorten(n.title, 54)}</p>
                    <p className="mt-2 text-xs text-[#17352A]/70">{fmt(n.createdAt)}</p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* guests */}
        <section className="relative mx-auto max-w-6xl px-6 py-24 sm:px-12" aria-labelledby="guests-h">
          <h2 id="guests-h" data-mv="wipe" className="text-4xl text-[#FFF8EA] sm:text-6xl" style={serif}>Who else is here</h2>
          <p className="mt-3 max-w-xl text-[#A9C3AE]">Guests who left a note on their way out.</p>
          <div className="mt-14">
            {d.guestNotes.length > 0 ? <Guests notes={d.guestNotes} /> : <p className="text-[#F1EEE6]/80">Nobody has left a note yet. Be the first.</p>}
          </div>
        </section>

        {/* note stub */}
        <section id="note-stub" className="relative bg-[#10281F] px-6 py-24 text-center sm:px-12" aria-labelledby="stub-h">
          <div data-mv="unroll" className="mx-auto max-w-md rounded-[3px] bg-[#F6F1E4] px-8 py-10 text-[#17352A] shadow-[0_24px_50px_rgba(0,0,0,.5)]" style={{ outline: '1px solid #B88A44', outlineOffset: '-8px' }}>
            <p id="stub-h" className="text-5xl leading-none text-[#7C2236]" style={script}>For you</p>
            <p className="mt-4 text-2xl" style={serif}>Leave a note at the table</p>
            <p className="mt-2 text-sm text-[#17352A]/80">The ninth chair is empty. Pull it out and write a line.</p>
            <a href="/#guest-note" className="mt-6 inline-block rounded-[3px] bg-[#7C2236] px-6 py-3 text-[#FFF8EA] transition-colors hover:bg-[#5a1626] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F6B94F]">Write a note</a>
          </div>
        </section>
      </Reveals>
    </main>
  )
}
