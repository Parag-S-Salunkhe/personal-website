import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
}

// The host's side of the door: same cloth and linen, no scene, nothing moving.
export default function LoginPage() {
  return (
    <section aria-labelledby="login-title" className="mx-auto grid max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="relative mx-auto w-full max-w-md">
        <div aria-hidden="true" className="absolute inset-[-25%] rounded-full bg-[radial-gradient(closest-side,rgb(246_185_79/0.18),transparent)]" />
        <div className="ev-card relative px-8 pb-10 pt-9">
          <p aria-hidden="true" className="ev-name text-4xl text-[var(--claret)]">The host</p>
          <h1 id="login-title" className="ev-h1 mt-1">Sign in</h1>
          <p className="ev-soft mt-3">This is where I add movies, dishes and posts. If you&rsquo;re a guest, the good stuff is on the table.</p>
          <LoginForm />
        </div>
      </div>
    </section>
  )
}
