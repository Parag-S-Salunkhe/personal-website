'use client'
import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import s from './styles.module.css'

const EMOJI = [
  { e: '❤️', label: 'Heart' },
  { e: '👋', label: 'Wave' },
  { e: '🍿', label: 'Popcorn' },
  { e: '🍝', label: 'Pasta' },
]
const MAX = 500

export default function GuestForm() {
  const [message, setMessage] = useState('')
  const [emoji, setEmoji] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const text = message.trim()
    if (!text) { setState('error'); setError('Write a few words first, then send it.'); return }
    setState('sending'); setError('')
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emoji ? { message: text, emoji } : { message: text }),
      })
      if (res.status === 201) { setState('done'); setMessage(''); return }
      if (res.status === 429) { setState('error'); setError('Easy there. Wait five minutes, then leave another note.'); return }
      const body = await res.json().catch(() => null)
      setState('error'); setError(body?.error || 'That did not go through. Try again in a moment.')
    } catch {
      setState('error'); setError('I could not reach the site. Check your connection and try again.')
    }
  }

  if (state === 'done') {
    return (
      <div role="status" className="py-4">
        <p className={`${s.title} text-2xl`}>Got it. Thank you.</p>
        <p className={`${s.hand} mt-2 text-3xl`}>see you at the table</p>
        <button type="button" onClick={() => setState('idle')} className={`${s.btn} ${s.link} mt-4 inline-flex min-h-[44px] items-center font-semibold`}>Write another</button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="hz-note" className={`${s.label} block text-lg`}>Your note</label>
      <textarea
        id="hz-note" name="message" rows={4} maxLength={MAX} value={message}
        onChange={(e) => { setMessage(e.target.value); if (state === 'error') setState('idle') }}
        placeholder="Say hi, or tell me what to cook next."
        aria-describedby="hz-count hz-status"
        aria-invalid={state === 'error'}
        className="mt-1 block w-full resize-y border-2 border-[var(--riso-blue)] bg-white/70 px-3 py-2 text-base text-[var(--ink)] placeholder:text-[var(--riso-blue)]/70"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="Add a mark (optional)" className="flex gap-1">
          {EMOJI.map(({ e, label }) => (
            <button
              key={e} type="button" aria-label={label} aria-pressed={emoji === e}
              onClick={() => setEmoji(emoji === e ? null : e)}
              className={`${s.btn} grid h-11 w-11 place-items-center border-2 border-[var(--riso-blue)] text-xl ${emoji === e ? 'bg-[var(--riso-yellow)]' : 'bg-transparent hover:bg-[var(--riso-yellow)]/50'}`}
            ><span aria-hidden="true">{e}</span></button>
          ))}
        </div>
        <p id="hz-count" className={`${s.nums} text-sm`}>{message.length}/{MAX}</p>
      </div>
      <p id="hz-status" role={state === 'error' ? 'alert' : undefined} className={`min-h-6 pt-2 text-sm font-semibold text-[var(--ink)] ${state === 'error' ? '' : 'sr-only'}`}>{state === 'error' ? error : ''}</p>
      <button
        type="submit" disabled={state === 'sending'}
        className={`${s.btn} ${s.label} mt-2 inline-flex min-h-[48px] items-center gap-2 bg-[var(--riso-blue)] px-6 text-lg text-[var(--paper)] hover:bg-[var(--riso-pink)] hover:text-[var(--ink)]`}
      >
        {state === 'sending' ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
        {state === 'sending' ? 'Sending' : 'Send my note'}
      </button>
    </form>
  )
}
