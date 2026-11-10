import Link from 'next/link'
import type { LabDish } from '@/components/lab/data'
import s from './styles.module.css'
import SectionHead from './SectionHead'
import Empty from './Empty'
import Reveal from './Reveal'
import { fmtDate } from './fmt'

function Cloche() {
  return (
    <svg viewBox="0 0 120 64" aria-hidden className="h-14 w-auto">
      <g fill="none" stroke="#FFF3D6" strokeWidth="2.5" strokeLinecap="round">
        <path d="M14 50a46 40 0 0 1 92 0Z" />
        <path d="M6 54h108" />
        <circle cx="60" cy="8" r="4" />
        <path d="M34 36a30 24 0 0 1 22-18" opacity="0.6" />
      </g>
    </svg>
  )
}

export default function DishesRow({ dishes }: { dishes: LabDish[] }) {
  return (
    <section aria-labelledby="cooking-h" className="bg-[var(--seat)]/30 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead id="cooking-h" title="From the concession stand" line="Dinner is part of the programme. Here is what came off the stove, by the board." href="/cooking" cta="See the whole menu" />
        {dishes.length === 0 ? (
          <Empty text="The kitchen is closed. Nothing on the board yet." href="/cooking" cta="Check the cooking page" />
        ) : (
          <Reveal>
            <ul className={`${s.row} -mx-5 flex gap-6 overflow-x-auto px-5 pb-6 sm:mx-0 sm:px-0`}>
              {dishes.map((d) => (
                <li key={d.id} className="w-[280px] shrink-0 self-start">
                  <Link href="/cooking" className={`${s.lift} ${s.felt} block border-[6px] border-[var(--brass)] p-5 text-[#f4ecd8] shadow-[0_14px_30px_-10px_rgba(0,0,0,0.7)]`}>
                    {d.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.imageUrl} alt={`${d.dishName}`} className="mb-4 aspect-[4/3] w-full object-cover" />
                    ) : (
                      <div className="mb-3 flex justify-center opacity-90"><Cloche /></div>
                    )}
                    <p className={`${s.display} break-words text-4xl leading-none`}>{d.dishName}</p>
                    <div className="mt-4 flex items-end gap-2 text-sm">
                      <span className="font-semibold">{d.category}</span>
                      <span className="mb-1 flex-1 border-b-2 border-dotted border-[#f4ecd8]/60" aria-hidden />
                      <span className="num font-semibold" role="img" aria-label={`Rated ${d.rating} out of 5`}>{d.rating} / 5</span>
                    </div>
                    {d.ingredients.length > 0 && (
                      <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                        {d.ingredients.slice(0, 5).map((i, k) => <li key={`${i}-${k}`}>{i}</li>)}
                        {d.ingredients.length > 5 && <li className="num">and {d.ingredients.length - 5} more</li>}
                      </ul>
                    )}
                    <time dateTime={d.cookDate} className="num mt-4 block text-sm opacity-90">Cooked {fmtDate(d.cookDate)}</time>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  )
}
