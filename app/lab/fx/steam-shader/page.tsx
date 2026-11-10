import LabTag from '@/components/lab/kit/LabTag'
import { getLabData } from '@/components/lab/kit/data'
import Lazy from '@/components/lab/fx/steam-shader/Lazy'

export const metadata = { title: 'Steam shader' }
export const revalidate = 3600

export default async function Page() {
  const { dishes } = await getLabData()
  const story = dishes.slice(0, 4).map((d) => ({ name: d.dishName, category: d.category, rating: d.rating }))
  const fallback = [{ name: 'Tonight’s plate', category: 'Supper', rating: 5 }]

  return (
    <main className="bg-[#10281F] text-[#F1EEE6]">
      <LabTag title="Steam shader" />
      <style>{`@media (prefers-reduced-motion: reduce){[data-story]{height:auto!important}}`}</style>
      <div data-story className="relative" style={{ height: '500vh' }}>
        <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
          {/* static poster frame until the scene paints */}
          <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(40% 30% at 50% 60%, rgba(246,185,79,.32), rgba(246,185,79,0) 70%), radial-gradient(90% 60% at 50% 60%, #17352A 0%, #10281F 55%, #0b1511 100%)' }}>
            <div className="absolute left-[26%] top-[52%] h-[6px] w-[6px] rounded-full bg-[#FFF8EA]" style={{ boxShadow: '0 0 30px 14px rgba(246,185,79,.8)' }} />
            <div className="absolute left-1/2 top-[64%] h-[22%] w-[34%] -translate-x-1/2 rounded-[50%] bg-[#F1EEE6]/90" />
          </div>
          <Lazy dishes={story.length ? story : fallback} />
          <header className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-16 sm:px-12 sm:pt-20">
            <h1 className="text-5xl leading-[1.02] text-[#FFF8EA] sm:text-7xl" style={{ fontFamily: 'var(--font-gilda), serif', textShadow: '0 2px 24px rgba(0,0,0,.7)' }}>Straight from the pass</h1>
            <p className="mt-3 max-w-md text-base text-[#F1EEE6]" style={{ textShadow: '0 1px 14px rgba(0,0,0,.9)' }}>Each plate arrives hot, with steam and a candle beside it. Scroll and the next one comes in; the last one cools.</p>
          </header>
        </div>
      </div>

      <section className="relative mx-auto max-w-4xl px-6 py-24 sm:px-12" aria-labelledby="menu-h">
        <h2 id="menu-h" className="text-4xl text-[#FFF8EA] sm:text-5xl" style={{ fontFamily: 'var(--font-gilda), serif' }}>The menu</h2>
        <p className="mt-3 max-w-xl text-[#F1EEE6]/80">Everything cooked recently, best kept warm.</p>
        {dishes.length === 0 ? (
          <p className="mt-10 text-[#F1EEE6]/80">Nothing on the menu yet.</p>
        ) : (
          <ol className="mt-10 divide-y divide-[#F1EEE6]/20 border-y border-[#F1EEE6]/20">
            {dishes.map((d) => (
              <li key={d.id} className="flex items-baseline justify-between gap-6 py-5">
                <div>
                  <p className="text-2xl text-[#FFF8EA] sm:text-3xl" style={{ fontFamily: 'var(--font-gilda), serif' }}>{d.dishName}</p>
                  <p className="mt-1 text-sm text-[#A9C3AE]">{d.category}</p>
                </div>
                <p className="shrink-0 text-xl text-[#F6B94F]">{d.rating}/5</p>
              </li>
            ))}
          </ol>
        )}
        <a href="/cooking" className="mt-8 inline-block text-sm text-[#A9C3AE] underline underline-offset-4 hover:text-[#FFF8EA]">All the cooking</a>
      </section>
    </main>
  )
}
