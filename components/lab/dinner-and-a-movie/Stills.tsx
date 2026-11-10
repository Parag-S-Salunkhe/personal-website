// Static, server-rendered frames: the poster shown before the 3D room paints, and the reduced-motion stills.
import { labImg } from '@/components/lab/kit/img'

export function DinnerFrame({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`relative overflow-hidden ${className}`} style={{ background: 'linear-gradient(180deg,#E9A66B 0%,#C98A6E 28%,#3B4F7A 50%,#17352A 51%,#10281F 100%)' }}>
      <div className="absolute left-1/2 top-[8%] h-[40%] w-[62%] -translate-x-1/2 rounded-t-[3px] border-[6px] border-[#1a1412]" style={{ background: 'linear-gradient(180deg,#F3B97D,#E9A66B 40%,#8c6a8f 85%,#3B4F7A)' }} />
      <div className="absolute inset-x-[8%] top-[52%] h-[7%] rounded-[3px] bg-[#17352A]" style={{ boxShadow: '0 0 0 2px #10281F, 0 40px 60px rgba(0,0,0,.35)' }} />
      {[18, 34, 52, 68, 82].map((x, i) => (
        <span key={x} className="absolute h-[5px] w-[5px] rounded-full bg-[#FFF8EA]" style={{ left: `${x}%`, top: `${50 + (i % 2) * 1.2}%`, boxShadow: '0 0 26px 12px rgba(246,185,79,.8)' }} />
      ))}
    </div>
  )
}

export function CinemaFrame({ poster, className = '' }: { poster: string | null; className?: string }) {
  const src = labImg(poster, 640)
  return (
    <div aria-hidden className={`relative overflow-hidden ${className}`} style={{ background: 'radial-gradient(70% 60% at 50% 42%,#1d2a47 0%,#0F1A2E 70%)' }}>
      <div className="absolute left-1/2 top-[40%] h-[58%] w-[120%] -translate-x-1/2 -translate-y-1/2 opacity-80" style={{ background: 'conic-gradient(from 90deg at 50% 100%, transparent 0 40%, rgba(255,243,214,.34) 46% 54%, transparent 60%)', filter: 'blur(6px)' }} />
      <div className="absolute left-1/2 top-[12%] flex h-[44%] w-[70%] -translate-x-1/2 items-center justify-center overflow-hidden rounded-[2px] bg-[#FFF3D6]" style={{ boxShadow: '0 0 90px 30px rgba(255,243,214,.35)' }}>
        {src && /* eslint-disable-next-line @next/next/no-img-element */ <img src={src} alt="" className="h-full w-auto object-contain" />}
      </div>
      {[22, 40, 60, 78].map((x) => (
        <span key={x} className="absolute bottom-[6%] h-[16%] w-[11%] rounded-t-xl bg-[#7C2236]" style={{ left: `${x - 5}%`, boxShadow: 'inset 0 6px 14px rgba(0,0,0,.35)' }} />
      ))}
    </div>
  )
}
