'use client'

// Last-resort error screen (the root layout itself failed), so it can't rely on the site's CSS or fonts.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IE">
      <body style={{ margin: 0, minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#F1F1EC', color: '#2F4FA2', fontFamily: 'Georgia, serif' }}>
        <main style={{ maxWidth: '36rem', padding: '2rem' }}>
          <h1 style={{ fontFamily: 'Impact, sans-serif', fontSize: '3rem', margin: 0, textShadow: '3px 2px 0 #FF4FA3' }}>The printer jammed</h1>
          <p style={{ fontSize: '1.25rem', color: '#1B2350' }}>Something went wrong loading the site. Try again in a moment.</p>
          <button type="button" onClick={reset} style={{ minHeight: 48, padding: '0 1.5rem', background: '#2F4FA2', color: '#F1F1EC', border: 0, fontSize: '1.125rem', cursor: 'pointer' }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
