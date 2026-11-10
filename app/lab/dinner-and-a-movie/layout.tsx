import { Instrument_Serif, Schibsted_Grotesk } from 'next/font/google'

const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-dm-serif', display: 'swap' })
const sans = Schibsted_Grotesk({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })

const CSS = `
[data-evening]{--eve-sky:#E9A66B;--eve-page:#2A2234;--eve-glow:#F6B94F;font-family:var(--font-dm-sans),system-ui,sans-serif;font-variant-numeric:tabular-nums}
.dm-serif{font-family:var(--font-dm-serif),Georgia,serif;font-weight:400}
.dm-pinned{position:fixed;top:12px;right:14px;z-index:90;display:grid;justify-items:center;gap:4px;pointer-events:none}
.dm-clock{width:92px;height:92px;filter:drop-shadow(0 6px 14px rgba(0,0,0,.5))}
.dm-time{font-size:13px;color:#FFF3D6;background:#0F1A2E;border-radius:999px;padding:1px 10px;font-variant-numeric:tabular-nums;letter-spacing:.02em}
.dm-candle{width:46px;height:116px;margin-top:6px;filter:drop-shadow(0 0 14px rgba(246,185,79,.45))}
.dm-flame{transform-box:fill-box;transform-origin:50% 100%;animation:dm-fl 1.3s ease-in-out infinite}
@keyframes dm-fl{0%,100%{transform:scale(1,1) skewX(0)}25%{transform:scale(.95,1.07) skewX(2deg)}60%{transform:scale(1.03,.95) skewX(-2deg)}}
.dm-ring{opacity:0}
.dm-strike .dm-ring{animation:dm-ring 1.6s ease-out 3}
.dm-strike .dm-clock{animation:dm-shake .5s ease-in-out 3}
@keyframes dm-ring{0%{opacity:.9;stroke-width:2}100%{opacity:0;stroke-width:16}}
@keyframes dm-shake{0%,100%{transform:rotate(0)}25%{transform:rotate(-4deg)}75%{transform:rotate(4deg)}}
@media (max-width:767px){
  .dm-pinned{left:0;right:0;top:0;height:50px;grid-auto-flow:column;justify-content:end;align-items:center;gap:10px;padding:0 12px;background:#0F1A2E;box-shadow:0 2px 14px rgba(0,0,0,.5)}
  .dm-clock{width:40px;height:40px;filter:none}
  .dm-candle{width:22px;height:46px;margin:0;filter:none}
}
@media (prefers-reduced-motion:reduce){.dm-flame,.dm-strike .dm-ring,.dm-strike .dm-clock{animation:none}}
`

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div data-evening className={`${serif.variable} ${sans.variable}`}>
      <style>{CSS}</style>
      {children}
    </div>
  )
}
