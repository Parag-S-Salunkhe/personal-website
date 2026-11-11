'use client'
import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'

const MARKS = [
  { e: '❤️', label: 'Heart' },
  { e: '👋', label: 'Wave' },
  { e: '🍿', label: 'Popcorn' },
  { e: '🍝', label: 'Pasta' },
]
const MAX = 500

// The site's one next step: leave a guestbook note. Same request, limits and states as
// components/zine/GuestForm.tsx (POST /api/guestbook; 201 / 429 / error); only the look changed.
// It sits on a linen card (ev-card), so the text colours here are the on-linen ones.
export default function GuestForm({ idPrefix = 'note' }: { idPrefix?: string }) {
  const [message, setMessage] = useState('')
  const [emoji, setEmoji] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const ids = { field: `${idPrefix}-message`, count: `${idPrefix}-count`, status: `${idPrefix}-status` }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const text = message.trim()
    if (!text) {
      setState('error')
      setError('Write a few words first, then send it.')
      return
    }
    setState('sending')
    setError('')
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emoji ? { message: text, emoji } : { message: text }),
      })
      if (res.status === 201) {
        setState('done')
        setMessage('')
        setEmoji(null)
        return
      }
      if (res.status === 429) {
        setState('error')
        setError('Easy there. Wait five minutes, then leave another note.')
        return
      }
      const body = await res.json().catch(() => null)
      setState('error')
      setError(body?.error || 'That did not go through. Try again in a moment.')
    } catch {
      setState('error')
      setError('I could not reach the site. Check your connection and try again.')
    }
  }

  if (state === 'done') {
    return (
      <div role="status" className="py-4">
        <p className="ev-title">Got it. Thank you.</p>
        <p className="ev-name mt-2 text-4xl text-[var(--claret)]">See you at the table</p>
        <button type="button" onClick={() => setState('idle')} className="ev-link mt-4 inline-flex min-h-[44px] items-center">
          Write another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor={ids.field} className="ev-label block">Your note</label>
      <textarea
        id={ids.field}
        name="message"
        rows={4}
        maxLength={MAX}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value)
          if (state === 'error') setState('idle')
        }}
        placeholder="Say hi, or tell me what to cook next."
        aria-describedby={`${ids.count} ${ids.status}`}
        aria-invalid={state === 'error'}
        className="ev-field mt-1.5 resize-y"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="Add a mark (optional)" className="flex gap-1">
          {MARKS.map(({ e, label }) => (
            <button
              key={e}
              type="button"
              aria-label={label}
              aria-pressed={emoji === e}
              onClick={() => setEmoji(emoji === e ? null : e)}
              className={`grid h-11 w-11 place-items-center rounded-full border text-xl transition-[background-color,border-color,transform] duration-200 ease-[var(--ease-ev)] active:translate-y-px active:scale-[.98] ${
                emoji === e ? 'border-[var(--claret)] bg-[rgb(246_185_79/0.45)]' : 'border-[var(--brass)] bg-transparent hover:bg-[rgb(246_185_79/0.2)]'
              }`}
            >
              <span aria-hidden="true">{e}</span>
            </button>
          ))}
        </div>
        <p id={ids.count} className="ev-meta ev-soft">{message.length}/{MAX}</p>
      </div>
      <p
        id={ids.status}
        role="alert"
        className={`min-h-6 pt-2 text-sm font-semibold text-[var(--claret)] ${state === 'error' ? '' : 'sr-only'}`}
      >
        {state === 'error' ? error : ''}
      </p>
      <button type="submit" disabled={state === 'sending'} className="ev-btn mt-2">
        {state === 'sending' ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
        {state === 'sending' ? 'Sending' : 'Send my note'}
      </button>
    </form>
  )
}
