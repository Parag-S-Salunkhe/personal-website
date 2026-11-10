import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
}

// The office copy: same paper and ink, no tape or tilt.
export default function LoginPage() {
  return (
    <section aria-labelledby="login-title" className="mx-auto grid max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto w-full max-w-md border-2 border-riso-blue bg-slip">
        <div className="border-b-2 border-riso-blue px-6 py-3">
          <p className="t-label text-lg">Office copy, staff only</p>
        </div>
        <div className="px-6 pb-8 pt-6">
          <h1 id="login-title" className="t-display mis text-5xl">Sign in</h1>
          <p className="mt-3 text-ink">This is where I add movies, dishes and posts. If you&rsquo;re a guest, the good stuff is on the front page.</p>
          <LoginForm />
        </div>
      </div>
    </section>
  )
}
