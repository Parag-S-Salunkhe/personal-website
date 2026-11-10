import LabTag from '@/components/lab/kit/LabTag'
import { getLabData } from '@/components/lab/kit/data'
import type { SeatCard } from '@/components/lab/fx/table-orbit/seats'
import Lazy from '@/components/lab/fx/table-orbit/Lazy'

export const metadata = { title: 'Table orbit' }
export const revalidate = 3600

const shorten = (s: string, n = 110) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)
const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })

export default async function Page() {
  const d = await getLabData()
  const m = d.movies[0], c = d.dishes[0], p = d.posts[0], n = d.notes[0], pr = d.projects[0], g = d.guestNotes[0]
  const cards: SeatCard[] = [
    { key: 'movies', name: 'Movies', headline: m?.title ?? 'Nothing watched yet', meta: m ? `${m.rating}/5 · ${fmt(m.watchDate)}` : '', href: '/movies' },
    { key: 'cooking', name: 'Cooking', headline: c?.dishName ?? 'Nothing cooked yet', meta: c ? `${c.category} · ${c.rating}/5` : '', href: '/cooking' },
    { key: 'writing', name: 'Writing', headline: p?.title ?? 'Nothing written yet', meta: p ? fmt(p.publishDate) : '', href: '/blog' },
    { key: 'notes', name: 'Notes', headline: n?.title ?? 'No notes yet', meta: n ? `${n.category ?? 'Note'} · ${fmt(n.createdAt)}` : '', href: '/notes' },
    { key: 'projects', name: 'Projects', headline: pr?.title ?? 'No projects yet', meta: pr ? shorten(pr.description, 80) : '', href: '/projects' },
    { key: 'guestbook', name: 'Guestbook', headline: g ? `“${shorten(g.message, 90)}”` : 'No notes left yet', meta: g ? `Left ${fmt(g.createdAt)}` : '', href: null },
    { key: 'you-a', name: 'For you', headline: 'An empty chair', meta: 'Pull it out and stay a while.', href: null },
    { key: 'you-b', name: 'For you', headline: 'And another', meta: 'Bring someone who likes the same films.', href: null },
  ]

  return (
    <main className="bg-[#0d0b0a] text-[#F1EEE6]">
      <LabTag title="Table orbit" />
      <style>{`@media (prefers-reduced-motion: reduce){[data-story]{height:auto!important}}`}</style>
      <div data-story className="relative" style={{ height: '500vh' }}>
        <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
          {/* static poster frame, replaced by the scene once it paints */}
          <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(60% 42% at 50% 56%, rgba(246,185,79,.42), rgba(246,185,79,0) 70%), radial-gradient(90% 60% at 50% 60%, #17352A 0%, #10281F 55%, #0b0f0d 100%)' }}>
            <div className="absolute left-1/2 top-[56%] h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-[#FFF8EA]" style={{ boxShadow: '0 0 28px 12px rgba(246,185,79,.8), -180px 6px 22px 8px rgba(246,185,79,.55), 190px 4px 22px 8px rgba(246,185,79,.55)' }} />
          </div>
          <Lazy cards={cards} />
          <header data-hero className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-16 sm:px-12 sm:pt-20" style={{ opacity: 'var(--hero, 1)' }}>
            <h1 className="text-5xl leading-[1.02] text-[#FFF8EA] sm:text-7xl" style={{ fontFamily: 'var(--font-gilda), serif', textShadow: '0 2px 24px rgba(0,0,0,.6)' }}>Table for eight</h1>
            <p className="mt-3 max-w-md text-base text-[#F1EEE6]" style={{ textShadow: '0 1px 14px rgba(0,0,0,.8)' }}>Supper is at eight. Scroll and the camera goes round the table, one seat at a time.</p>
          </header>
        </div>
      </div>

      <section className="relative mx-auto max-w-5xl px-6 py-24 sm:px-12" aria-labelledby="seats-h">
        <h2 id="seats-h" className="text-4xl text-[#FFF8EA] sm:text-5xl" style={{ fontFamily: 'var(--font-gilda), serif' }}>Who is sitting where</h2>
        <p className="mt-3 max-w-xl text-[#F1EEE6]/80">Six seats are taken by the sections of the site. The last two are for whoever turns up.</p>
        <ol className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {cards.map((c, i) => (
            <li key={c.key} className="border-t border-[#F1EEE6]/20 pt-5">
              <p className="text-3xl text-[#F6B94F]" style={{ fontFamily: 'var(--font-pinyon), cursive' }}><span className="sr-only">Seat {i + 1}: </span>{c.name}</p>
              <p className="mt-1 text-2xl text-[#FFF8EA]" style={{ fontFamily: 'var(--font-gilda), serif' }}>{c.headline}</p>
              <p className="mt-1 text-sm text-[#F1EEE6]/75">{c.meta}</p>
              {c.href && <a href={c.href} className="mt-3 inline-block text-sm text-[#A9C3AE] underline underline-offset-4 hover:text-[#FFF8EA]">Go to {c.name.toLowerCase()}</a>}
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
