// The static poster frame behind the book scene: a closed red book between two candle glows, pure CSS (server HTML).
export default function BookPoster() {
  return (
    <div aria-hidden="true" className="absolute inset-0 grid place-items-center bg-[var(--cloth-deep)]">
      <div className="absolute left-[12%] top-[38%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgb(246_185_79/0.55),rgb(246_185_79/0)_70%)]" />
      <div className="absolute right-[12%] top-[34%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgb(246_185_79/0.55),rgb(246_185_79/0)_70%)]" />
      <div className="relative h-[46%] max-h-80 w-[44%] min-w-[11rem] max-w-md -rotate-2 rounded-[3px] border border-[rgb(246_185_79/0.7)] bg-[linear-gradient(135deg,#8a2740,#6b1b2e)] shadow-[0_28px_50px_rgb(0_0_0/0.55)]">
        <div className="absolute inset-3 rounded-[3px] border border-[rgb(246_185_79/0.55)]" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-[family-name:var(--font-gilda)] text-2xl leading-tight text-[var(--wax)] sm:text-3xl">From the<br />kitchen</div>
      </div>
    </div>
  )
}
