import LabTag from '@/components/lab/kit/LabTag'
import { getLabData } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import Lazy from '@/components/lab/fx/deco-marquee/Lazy'

export const metadata = { title: 'Deco marquee' }
export const revalidate = 3600

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
const disp = { fontFamily: 'var(--font-display), Impact, sans-serif', fontWeight: 900 } as const

export default async function Page() {
  const d = await getLabData()
  const movies = d.movies
  const texts = [0, 1, 2].map((i) => movies[i]?.title ?? ['LATE SHOW', 'TONIGHT', 'DOORS AT EIGHT'][i]).concat('NOW SHOWING')
  const posters = movies.filter((m) => m.posterUrl).slice(0, 2).map((m) => labImg(m.posterUrl, 384) ?? '')
  const programme = movies.slice(0, 8)

  return (
    <main className="bg-[#14070d] text-[#FFF3D6]">
      <LabTag title="Deco marquee" />
      <style>{`@media (prefers-reduced-motion: reduce){[data-story]{height:auto!important}}`}</style>
      <div data-story className="relative" style={{ height: '500vh' }}>
        <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
          {/* static poster frame under the scene */}
          <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#08040c 0%,#1a0a1c 55%,#10353a 88%,#160a0e 88%)' }}>
            <div className="absolute left-1/2 top-[44%] h-[22%] w-[46%] -translate-x-1/2" style={{ background: '#3a1220', borderTop: '3px solid #D8A84E' }} />
            <div className="absolute left-1/2 top-[66%] h-[3%] w-[54%] -translate-x-1/2" style={{ background: '#6B1A2B', borderBottom: '3px solid #D8A84E' }} />
          </div>
          <Lazy texts={texts} posters={posters} />
          <header data-hero className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-16 sm:px-12 sm:pt-20">
            <h1 data-deco-font className="text-6xl leading-[0.95] text-[#FFF3D6] sm:text-8xl" style={{ ...disp, textShadow: '0 2px 24px rgba(0,0,0,.8)' }}>Late Show</h1>
            <p className="mt-3 max-w-md text-base text-[#FFF3D6]" style={{ textShadow: '0 1px 14px rgba(0,0,0,.9)' }}>The street is dark. Scroll and the marquee wakes up, bulb by bulb.</p>
          </header>
        </div>
      </div>

      <section className="relative mx-auto max-w-4xl px-6 py-24 sm:px-12" aria-labelledby="prog-h">
        <h2 id="prog-h" className="text-5xl text-[#D8A84E] sm:text-7xl" style={disp}>Tonight&apos;s programme</h2>
        <p className="mt-3 max-w-xl text-[#FFF3D6]/80">What has been on the screen lately, newest first.</p>
        <ol className="mt-12 border-t-2 border-[#D8A84E]">
          {programme.map((m, i) => (
            <li key={m.id} className="grid grid-cols-[3rem_1fr_auto] items-baseline gap-x-4 border-b border-[#D8A84E]/40 py-4">
              <span className="text-2xl text-[#FF9F43]" style={disp}>{String(i + 1).padStart(2, '0')}</span>
              <span>
                <span className="block text-3xl leading-none text-[#FFF3D6] sm:text-4xl" style={disp}>{m.title}</span>
                <span className="mt-1 block text-sm text-[#FFF3D6]/75">{m.type === 'SERIES' ? 'Series' : 'Film'} · {fmt(m.watchDate)}</span>
              </span>
              <span className="text-2xl text-[#D8A84E]" style={disp}>{m.rating}/5</span>
            </li>
          ))}
        </ol>
        <a href="/movies" className="mt-8 inline-block text-[#FFF3D6] underline underline-offset-4 decoration-[#D8A84E] hover:text-[#FF9F43]">All the films</a>
      </section>
    </main>
  )
}
