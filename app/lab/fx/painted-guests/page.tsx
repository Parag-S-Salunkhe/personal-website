import LabTag from '@/components/lab/kit/LabTag'
import { getLabData, type LabDish } from '@/components/lab/kit/data'
import Lazy from '@/components/lab/fx/painted-guests/Lazy'
import type { Course, CourseKind } from '@/components/lab/fx/painted-guests/layout'

export const metadata = { title: 'Painted guests' }
export const revalidate = 3600

// Choose a plausible order of courses from the real dishes: starter, mains, one more, dessert last.
function pickCourses(dishes: LabDish[]): Course[] {
  const real = dishes.filter((d) => d.dishName.trim().length >= 8)
  const starters = real.filter((d) => /starter/i.test(d.category))
  const mains = real.filter((d) => /main/i.test(d.category))
  const desserts = real.filter((d) => /dessert|sweet/i.test(d.category))
  const others = real.filter((d) => !/starter|main|dessert|sweet|drink|dinner/i.test(d.category))
  const seq: [LabDish, CourseKind][] = [
    ...starters.slice(0, 1).map((d): [LabDish, CourseKind] => [d, 'starter']),
    ...mains.slice(0, 2).map((d): [LabDish, CourseKind] => [d, 'main']),
    ...others.slice(0, 1).map((d): [LabDish, CourseKind] => [d, 'bowl']),
    ...desserts.slice(0, 1).map((d): [LabDish, CourseKind] => [d, 'dessert']),
  ]
  if (seq.length < 3) for (const d of real) if (!seq.some(([x]) => x.id === d.id) && seq.length < 4) seq.splice(seq.length - (desserts.length ? 1 : 0), 0, [d, 'bowl'])
  return seq.slice(0, 5).map(([d, kind]) => ({ id: d.id, name: d.dishName, category: d.category, rating: d.rating, kind }))
}

export default async function Page() {
  const data = await getLabData()
  const courses = pickCourses(data.dishes)
  return (
    <main style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif' }}>
      <LabTag title="Painted guests" />
      <style>{`@media (prefers-reduced-motion: reduce){[data-pg-wrap]{height:100dvh !important}}`}</style>
      <section data-pg-wrap className="relative" style={{ height: '400vh' }}>
        <div
          className="sticky top-0 h-[100dvh] overflow-hidden"
          style={{ background: 'radial-gradient(60% 40% at 50% 78%, #3a2418 0%, #14100d 60%, #0a120e 100%)' }}
        >
          <Lazy courses={courses} />
          <div data-pg-title className="pointer-events-none absolute left-0 top-0 z-[5] max-w-[34rem] px-6 pt-16 md:px-12 md:pt-20" style={{ willChange: 'opacity, transform' }}>
            <h1 className="text-5xl leading-[1.02] text-[#FFF8EA] md:text-7xl" style={{ fontFamily: 'var(--font-gilda), Georgia, serif', textShadow: '0 2px 18px rgba(10,20,15,0.8)' }}>
              Painted guests
            </h1>
            <p className="mt-4 max-w-[26rem] text-base leading-relaxed text-[#F1EEE6] md:text-lg" style={{ textShadow: '0 1px 12px rgba(10,20,15,0.9)' }}>
              A supper club table, hand-painted. Scroll to light the candles and bring the courses out. The guest beside the host will wave back.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12" style={{ background: '#F1EEE6', color: '#17352A' }}>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-gilda), Georgia, serif' }}>What came out of the kitchen</h2>
          <ul className="mt-10 divide-y divide-[#17352A]/20">
            {data.dishes.map((d) => (
              <li key={d.id} className="flex items-baseline justify-between gap-6 py-4">
                <div>
                  <p className="text-xl md:text-2xl" style={{ fontFamily: 'var(--font-gilda), Georgia, serif' }}>{d.dishName}</p>
                  <p className="mt-1 text-sm text-[#7C2236]">{d.category}</p>
                </div>
                <p className="shrink-0 text-base tabular-nums">Rated {d.rating} of 5</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
