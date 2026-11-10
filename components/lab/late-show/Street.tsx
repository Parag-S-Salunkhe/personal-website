import FlapBoard, { type BoardRow } from './FlapBoard'

const bulbs = (n: number) => Array.from({ length: n }, (_, i) => <i key={i} className={`ls-b ls-b${i % 3}`} />)

/** Beat 1: the street at night. Art Deco front, chasing bulbs, the letterboard and the split-flap board. Server HTML. */
export default function Street({ tonight, rows }: { tonight: string; rows: BoardRow[] }) {
  return (
    <header className="ls-street" id="ls-street">
      <div className="ls-sky" aria-hidden>{Array.from({ length: 36 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 46}%`, animationDelay: `${(i % 7) * 0.4}s` }} />)}</div>
      <div className="ls-front">
        <div className="ls-fin" aria-hidden><span>Late Show</span></div>
        <div className="ls-marquee">
          <div className="ls-bulbrow ls-bulbrow-top" aria-hidden>{bulbs(34)}</div>
          <div className="ls-sign">
            <p className="ls-sign-small">Parag&rsquo;s repertory cinema, one night only</p>
            <h1 className="ls-sign-title">Tonight at Parag&rsquo;s</h1>
            <div className="ls-letterboard" aria-label={`Now showing: ${tonight}`}>
              <span className="ls-lb-label">Now showing</span>
              <span className="ls-lb-film">{tonight}</span>
            </div>
          </div>
          <div className="ls-bulbrow ls-bulbrow-bot" aria-hidden>{bulbs(34)}</div>
          <div className="ls-bulbcol ls-bulbcol-l" aria-hidden>{bulbs(9)}</div>
          <div className="ls-bulbcol ls-bulbcol-r" aria-hidden>{bulbs(9)}</div>
        </div>
        <div className="ls-board-wrap">
          <FlapBoard rows={rows} />
        </div>
        <div className="ls-doors" aria-hidden><span /><span /><span /></div>
      </div>
      <div className="ls-wet" aria-hidden>{tonight}</div>
    </header>
  )
}
