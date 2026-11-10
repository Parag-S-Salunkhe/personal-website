// Share images (next/og) in the House Zine look: paper, blue ink with a pink misregistration
// layer, a halftone corner and a strip of tape. Fonts are static TTFs read from assets/og.
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const ogSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'

const C = { paper: '#F1F1EC', slip: '#FAFAF7', blue: '#2F4FA2', pink: '#FF4FA3', yellow: '#FFE14A', ink: '#1B2350' }

async function fonts() {
  const dir = join(process.cwd(), 'assets/og')
  const [display, label, hand] = await Promise.all([
    readFile(join(dir, 'Anybody-ExpandedBlack.ttf')),
    readFile(join(dir, 'Anybody-CondensedBold.ttf')),
    readFile(join(dir, 'ReenieBeanie-Regular.ttf')),
  ])
  return [
    { name: 'Display', data: display, weight: 900 as const, style: 'normal' as const },
    { name: 'Label', data: label, weight: 700 as const, style: 'normal' as const },
    { name: 'Hand', data: hand, weight: 400 as const, style: 'normal' as const },
  ]
}

const titleSize = (t: string) => (t.length > 60 ? 52 : t.length > 36 ? 62 : t.length > 18 ? 76 : 92)

// Pink halftone dots fading out from the top-left corner (an SVG, since next/og can't tile gradients).
const HALFTONE = (() => {
  let dots = ''
  for (let y = 0; y < 20; y++) for (let x = 0; x < 31; x++) {
    const r = 3.2 * (1 - (x / 31) * 0.8 - (y / 20) * 0.7)
    if (r > 0.4) dots += `<circle cx='${x * 18 + (y % 2) * 9 + 6}' cy='${y * 18 + 6}' r='${r.toFixed(2)}'/>`
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='560' height='360'><g fill='${C.pink}' fill-opacity='0.6'>${dots}</g></svg>`)}`
})()

export type OgCard = {
  /** Small line above the title, e.g. "Movies" or "Film, watched 3 May 2025". */
  kicker: string
  title: string
  /** Handwritten line under the title. */
  scribble?: string
  /** Score out of 5, drawn in the pink circle. */
  rating?: number
  /** https image (a TMDB poster) shown taped on the right. */
  image?: string | null
}

export async function zineImage({ kicker, title, scribble, rating, image }: OgCard) {
  const t = title.length > 90 ? `${title.slice(0, 87)}…` : title
  const size = titleSize(t)
  const textWidth = image ? 720 : 1000
  const titleStyle = { width: textWidth, display: 'flex', fontFamily: 'Display', fontSize: size, lineHeight: 1.02, letterSpacing: -1 } as const
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: C.paper, fontFamily: 'Label', color: C.blue }}>
        {/* halftone corner */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HALFTONE} width={560} height={360} alt="" style={{ position: 'absolute', left: 0, top: 0 }} />
        {/* masthead */}
        <div style={{ position: 'absolute', left: 72, right: 72, top: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `4px solid ${C.blue}`, paddingBottom: 10 }}>
          <div style={{ fontFamily: 'Display', fontSize: 34, display: 'flex' }}>Parag&rsquo;s zine</div>
          <div style={{ fontSize: 30, display: 'flex' }}>paragsalunkhe.me</div>
        </div>

        <div style={{ position: 'absolute', left: 72, top: 150, display: 'flex', flexDirection: 'column', width: textWidth }}>
          <div style={{ fontSize: 40, display: 'flex' }}>{kicker}</div>
          <div style={{ position: 'relative', display: 'flex', width: textWidth, marginTop: 14 }}>
            <div style={{ ...titleStyle, position: 'absolute', left: 5, top: 4, color: C.pink }}>{t}</div>
            <div style={{ ...titleStyle, position: 'relative', color: C.blue }}>{t}</div>
          </div>
          {scribble && <div style={{ fontFamily: 'Hand', fontSize: 52, marginTop: 18, transform: 'rotate(-1.5deg)', display: 'flex' }}>{scribble}</div>}
          {typeof rating === 'number' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 22 }}>
              <div style={{ width: 88, height: 88, borderRadius: 999, border: `6px solid ${C.pink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Display', fontSize: 42, color: C.blue }}>
                {Number.isInteger(rating) ? rating : rating.toFixed(1)}
              </div>
              <div style={{ fontSize: 36, display: 'flex' }}>out of 5</div>
            </div>
          )}
        </div>


        {image ? (
          <div style={{ position: 'absolute', right: 80, top: 128, width: 300, height: 450, display: 'flex', transform: 'rotate(2deg)' }}>
            <div style={{ position: 'absolute', left: 14, top: 14, width: 300, height: 450, background: C.pink, display: 'flex' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} width={300} height={450} alt="" style={{ position: 'absolute', left: 0, top: 0, objectFit: 'cover' }} />
            <div style={{ position: 'absolute', left: 115, top: -16, width: 80, height: 30, background: C.yellow, opacity: 0.9, transform: 'rotate(-4deg)', display: 'flex' }} />
          </div>
        ) : (
          <div style={{ position: 'absolute', right: 72, bottom: 56, display: 'flex', alignItems: 'center', gap: 14, transform: 'rotate(-2deg)' }}>
            <div style={{ width: 120, height: 36, background: C.yellow, display: 'flex' }} />
            <div style={{ fontFamily: 'Hand', fontSize: 44, display: 'flex' }}>take one for the road</div>
          </div>
        )}

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 18, background: C.blue, display: 'flex' }} />
      </div>
    ),
    { ...ogSize, fonts: await fonts() },
  )
}

/** Only TMDB posters are fetched for share images (known host, https). */
export const ogPoster = (url: string | null | undefined) =>
  url && /^https:\/\/image\.tmdb\.org\/t\/p\//.test(url) ? url.replace('/w500/', '/w342/') : null
