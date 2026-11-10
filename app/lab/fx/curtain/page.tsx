import { getLabData, withPosters } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import LabTag from '@/components/lab/kit/LabTag'
import Lazy from '@/components/lab/fx/curtain/Lazy'

export const metadata = { title: 'Curtain' }
export const revalidate = 3600

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })

export default async function Page() {
  const data = await getLabData()
  const movies = withPosters(data.movies)
  const tonight = movies[0]
  const poster = tonight ? labImg(tonight.posterUrl, 640) : null

  return (
    <main style={{ background: '#2B0B14', color: '#FFF3D6' }}>
      <LabTag title="Curtain" />
      <section id="curtain-wrap" className="relative h-[300vh] motion-reduce:h-auto">
        <div className="sticky top-0 h-[100dvh] w-full overflow-hidden" style={{ background: '#2B0B14' }}>
          {/* static poster frame: shown until the WebGL scene mounts */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 60% 55% at 50% 22%, rgba(255,159,67,.35), transparent 70%), repeating-linear-gradient(90deg, #4a1220 0 3%, #6B1A2B 5%, #4a1220 8%)',
            }}
          />
          <div className="absolute inset-x-0 top-0 h-[16%]" style={{ background: 'linear-gradient(#6B1A2B, #4a1220)', borderBottom: '6px solid #D8A84E' }} />
          {poster && <Lazy poster={poster} />}

          <div className="cu-intro pointer-events-none absolute inset-x-0 bottom-[14%] z-10 px-6 text-center">
            <h1 className="mx-auto max-w-[14ch] text-[clamp(3rem,9vw,7rem)] font-black leading-[0.9] tracking-tight" style={{ fontFamily: 'var(--font-display), Impact, sans-serif', textShadow: '0 2px 24px #2B0B14, 0 0 6px #2B0B14' }}>
              Lights down. Curtain up.
            </h1>
            <p className="mt-4 text-base md:text-lg" style={{ textShadow: '0 1px 12px #2B0B14' }}>Scroll to part the velvet.</p>
          </div>

          {tonight && (
            <div className="cu-tonight pointer-events-none absolute inset-x-0 bottom-0 z-10 px-6 pb-[7vh] pt-24 text-center opacity-0" style={{ background: 'linear-gradient(to top, rgba(43,11,20,.92) 35%, rgba(43,11,20,0))' }}>
              <p className="text-sm" style={{ color: '#D8A84E' }}>Now showing at Parag&apos;s</p>
              <h2 className="text-[clamp(1.8rem,5vw,3.4rem)] font-black leading-none" style={{ fontFamily: 'var(--font-display), Impact, sans-serif' }}>{tonight.title}</h2>
              <p className="mt-2 text-lg"><span aria-hidden>{'★'.repeat(Math.max(0, Math.min(5, tonight.rating)))}</span><span className="sr-only">Rated </span> {tonight.rating} / 5</p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24">
        <h2 className="text-5xl font-black md:text-6xl" style={{ fontFamily: 'var(--font-display), Impact, sans-serif' }}>This week at Parag&apos;s</h2>
        <p className="mt-3 max-w-xl text-lg opacity-85">What has been on the projector lately, newest first.</p>
        <ul className="mt-10 divide-y divide-[#D8A84E]/30">
          {data.movies.slice(0, 8).map((m) => (
            <li key={m.id} className="flex items-center gap-5 py-4">
              {m.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={labImg(m.posterUrl, 256) ?? ''} alt="" width={64} height={96} loading="lazy" className="h-24 w-16 shrink-0 rounded-sm object-cover" />
              ) : <div className="h-24 w-16 shrink-0 rounded-sm bg-[#6B1A2B]" />}
              <div className="min-w-0 flex-1">
                <h3 className="text-2xl font-extrabold leading-tight" style={{ fontFamily: 'var(--font-display), Impact, sans-serif' }}>{m.title}</h3>
                <p className="text-sm opacity-80">Watched {fmt(m.watchDate)}</p>
              </div>
              <p className="shrink-0 text-lg" style={{ color: '#D8A84E' }}>{m.rating} / 5</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
