import { getLabData, withPosters } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import LabTag from '@/components/lab/kit/LabTag'
import Film from '@/components/lab/fx/silent-film/Film'

export const metadata = { title: 'Silent Film' }
export const revalidate = 3600

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })

export default async function Page() {
  const data = await getLabData()
  const reels = withPosters(data.movies).slice(0, 4).map((m) => ({ id: m.id, title: m.title, rating: m.rating, date: m.watchDate, poster: labImg(m.posterUrl, 640) }))

  return (
    <main style={{ background: '#0c0906', color: '#EFE6D2' }}>
      <LabTag title="Silent Film" />
      <Film reels={reels} />
      <section className="mx-auto max-w-3xl px-6 py-20" style={{ fontFamily: 'var(--font-ital), Georgia, serif' }}>
        <h2 className="text-4xl font-black md:text-5xl" style={{ fontFamily: 'var(--font-sc), Georgia, serif' }}>The programme</h2>
        <p className="mt-3 text-lg italic opacity-85">Every picture seen lately, newest first.</p>
        <ul className="mt-10 divide-y divide-[#EFE6D2]/25">
          {data.movies.map((m) => (
            <li key={m.id} className="flex items-center gap-4 py-4">
              {m.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={labImg(m.posterUrl, 256) ?? ''} alt="" width={56} height={84} loading="lazy" className="h-[84px] w-14 shrink-0 object-cover" style={{ filter: 'grayscale(1) sepia(.6)' }} />
              ) : <div className="h-[84px] w-14 shrink-0 bg-[#2a2118]" />}
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold leading-tight md:text-2xl" style={{ fontFamily: 'var(--font-sc), Georgia, serif' }}>{m.title}</h3>
                <p className="text-sm opacity-80">Seen {fmt(m.watchDate)}</p>
              </div>
              <p className="shrink-0 text-lg">{m.rating} / 5</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
