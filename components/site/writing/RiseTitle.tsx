import './writing.css'

/** Title text split into words, each rising out of its own mask on load (CSS only, text stays in the server HTML). */
export default function RiseTitle({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className="wr-word"><span style={{ ['--i' as string]: Math.min(i, 9) }}>{w}</span></span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
}
