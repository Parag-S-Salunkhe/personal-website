'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password) {
      setError('Type the password first.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        // Full reload so the new cookie is sent with the next request.
        window.location.href = '/admin'
        return
      }
      if (res.status === 429) setError('Too many tries. Wait 15 minutes, then try again.')
      else if (res.status === 401) setError('That password didn’t work. Check it and try again.')
      else setError('Sign-in isn’t working on the server right now. Try again later.')
    } catch {
      setError('I couldn’t reach the site. Check your connection and try again.')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6">
      <label htmlFor="login-password" className="t-label block text-lg">Password</label>
      <input
        id="login-password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          if (error) setError('')
        }}
        aria-invalid={!!error}
        aria-describedby="login-error"
        className="field mt-1 min-h-[48px]"
        required
      />
      <p id="login-error" role={error ? 'alert' : undefined} className={`min-h-6 pt-2 text-sm font-semibold text-riso-red ${error ? '' : 'sr-only'}`}>
        {error}
      </p>
      <button type="submit" disabled={loading} className="btn mt-2 w-full">
        {loading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
        {loading ? 'Signing in' : 'Sign in'}
      </button>
    </form>
  )
}
