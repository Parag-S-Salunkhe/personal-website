/** Paragraphs on a linen sheet: the calm reading column (read mode). */
export default function Prose({ paragraphs, empty, lead = false, className = '' }: { paragraphs: string[]; empty: string; lead?: boolean; className?: string }) {
  return (
    <div className={`ev-card px-6 py-10 sm:px-12 sm:py-14 ${className}`}>
      {paragraphs.length > 0 ? (
        <div className="ev-prose mx-auto">
          {paragraphs.map((p, i) => (
            <p key={i} className={`whitespace-pre-line [overflow-wrap:anywhere] ${lead && i === 0 ? 'text-xl' : ''}`}>{p}</p>
          ))}
        </div>
      ) : (
        <p className="ev-soft mx-auto max-w-[68ch] text-lg italic">{empty}</p>
      )}
    </div>
  )
}
