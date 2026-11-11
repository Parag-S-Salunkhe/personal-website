/** Paragraphs on a linen sheet: the calm reading column (read mode). */
export default function Prose({ paragraphs, empty, lead = false, className = '' }: { paragraphs: string[]; empty: string; lead?: boolean; className?: string }) {
  return (
    <div className={`ev-card px-6 py-10 sm:px-12 sm:py-14 ${className}`}>
      {paragraphs.length > 0 ? (
        <div className="ev-prose mx-auto">
          {paragraphs.map((p, i) => {
            // Posts are written in markdown: a "## Heading" paragraph is shown as a heading, not as "##".
            const h = /^(#{1,6})\s+(.+)$/.exec(p.trim())
            if (h && !h[2].includes('\n')) {
              return h[1].length <= 2
                ? <h2 key={i} className="ev-serif mt-10 text-2xl leading-snug first:mt-0">{h[2]}</h2>
                : <h3 key={i} className="ev-serif mt-8 text-xl leading-snug first:mt-0">{h[2]}</h3>
            }
            return <p key={i} className={`whitespace-pre-line [overflow-wrap:anywhere] ${lead && i === 0 ? 'text-xl' : ''}`}>{p}</p>
          })}
        </div>
      ) : (
        <p className="ev-soft mx-auto max-w-[68ch] text-lg italic">{empty}</p>
      )}
    </div>
  )
}
