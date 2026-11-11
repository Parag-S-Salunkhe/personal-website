'use client'

// Last-resort error screen (the root layout itself failed), so it can't rely on the site's CSS or fonts.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IE">
      <body style={{ margin: 0, minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#17352A', color: '#FFF8EA', fontFamily: 'Georgia, serif' }}>
        <main style={{ maxWidth: '36rem', padding: '2rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 400, margin: 0 }}>The candle went out</h1>
          <p style={{ fontSize: '1.25rem', color: '#A9C3AE', fontFamily: 'system-ui, sans-serif' }}>Something went wrong loading the site. Try again in a moment.</p>
          <button type="button" onClick={reset} style={{ minHeight: 48, padding: '0 1.5rem', background: '#7C2236', color: '#FFF8EA', border: 0, borderRadius: 3, fontSize: '1.0625rem', cursor: 'pointer' }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
