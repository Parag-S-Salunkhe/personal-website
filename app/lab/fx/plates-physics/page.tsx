import LabTag from '@/components/lab/kit/LabTag'
import { getLabData } from '@/components/lab/kit/data'
import Lazy from '@/components/lab/fx/plates-physics/Lazy'

export const metadata = { title: 'Plates physics' }
export const revalidate = 3600

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })

export default async function Page() {
  const d = await getLabData()
  const dishes = d.dishes.slice(0, 4).map((x) => ({ name: x.dishName, category: x.category }))
  return (
    <main className="bg-[#0b120f] text-[#F1EEE6]">
      <LabTag title="Plates physics" />
      <style>{`@media (prefers-reduced-motion: reduce){[data-story]{height:auto!important}}`}</style>
      <div data-story className="relative" style={{ height: '450vh' }}>
        <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
          <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(60% 45% at 50% 52%, rgba(246,185,79,.35), rgba(246,185,79,0) 70%), radial-gradient(90% 70% at 50% 55%, #17352A 0%, #10281F 60%, #0b120f 100%)' }}>
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-[#F1EEE6]/80" />
          </div>
          <Lazy dishes={dishes} />
          <header className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-16 sm:px-12 sm:pt-20">
            <h1 className="text-4xl leading-[1.02] text-[#FFF8EA] sm:text-6xl" style={{ fontFamily: 'var(--font-gilda), serif', textShadow: '0 2px 24px rgba(0,0,0,.7)' }}>Set the table</h1>
            <p className="mt-3 max-w-md text-base text-[#F1EEE6]" style={{ textShadow: '0 1px 14px rgba(0,0,0,.9)' }}>Plates and cutlery really fall here. Drag one and let go to toss it, then scroll for each course.</p>
          </header>
        </div>
      </div>

      <section className="relative mx-auto max-w-4xl px-6 py-24 sm:px-12" aria-labelledby="menu-h">
        <h2 id="menu-h" className="text-4xl text-[#FFF8EA] sm:text-5xl" style={{ fontFamily: 'var(--font-gilda), serif' }}>What came to the table</h2>
        <p className="mt-3 max-w-xl text-[#F1EEE6]/80">The latest dishes from the kitchen, in the order they were cooked.</p>
        <ol className="mt-10 divide-y divide-[#F1EEE6]/15 border-y border-[#F1EEE6]/15">
          {d.dishes.slice(0, 8).map((x) => (
            <li key={x.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
              <span className="text-2xl text-[#FFF8EA]" style={{ fontFamily: 'var(--font-gilda), serif' }}>{x.dishName}</span>
              <span className="text-sm text-[#F1EEE6]/75">{x.category} · {x.rating}/5 · {fmt(x.cookDate)}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
