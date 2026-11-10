'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import s from './styles.module.css'

const MAX = 500
const EMOJI = ['❤️', '🍝', '🎬', '👋']

export default function GuestForm() {
  const [message, setMessage] = useState('')
  const [emoji, setEmoji] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'sending') return
    if (!message.trim()) {
      setState('error')
      setFeedback('Note not sent. Write a line or two first.')
      return
    }
    setState('sending')
    setFeedback('')
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), ...(emoji ? { emoji } : {}) }),
      })
      if (res.status === 201) {
        setState('done')
        setFeedback('Note left. Thank you, I will read it with my tea.')
        setMessage('')
        setEmoji(null)
        return
      }
      const body = await res.json().catch(() => ({}))
      setState('error')
      if (res.status === 429) setFeedback('Note not sent. You left one a moment ago, so wait five minutes and try again.')
      else setFeedback(`Note not sent. ${body?.error ?? 'Something went wrong, please try again.'}`)
    } catch {
      setState('error')
      setFeedback('Note not sent. The connection dropped, please try again.')
    }
  }

  const left = MAX - message.length

  return (
    <form onSubmit={onSubmit} className={`${s.onDark} flex flex-col gap-3`} noValidate>
      <label htmlFor="bk-note" className={`${s.title} text-lg text-[var(--tile)]`}>
        Leave a note
      </label>
      <textarea
        id="bk-note"
        value={message}
        maxLength={MAX}
        rows={3}
        onChange={(e) => {
          setMessage(e.target.value)
          if (state !== 'sending') setState('idle')
        }}
        placeholder="Tell me what you watched, ate or want me to cook."
        aria-describedby="bk-note-help"
        className="min-h-[96px] w-full resize-none rounded-2xl border-2 border-transparent bg-[var(--tile)] p-3 text-base text-[var(--ink)] placeholder:text-[#55555e] focus-visible:border-[var(--mustard)]"
      />
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Add an emoji" className="flex gap-1">
          {EMOJI.map((em) => (
            <button
              key={em}
              type="button"
              aria-pressed={emoji === em}
              aria-label={`Emoji ${em}`}
              onClick={() => setEmoji(emoji === em ? null : em)}
              className={`${s.press} h-11 w-11 rounded-full border-2 text-lg ${emoji === em ? 'border-[var(--mustard)] bg-[var(--mustard)]' : 'border-[var(--tile)]/40 bg-transparent hover:border-[var(--tile)]'}`}
            >
              <span aria-hidden="true">{em}</span>
            </button>
          ))}
        </div>
        <span id="bk-note-help" className={`${s.nums} ml-auto text-sm text-[var(--tile)]/80`}>
          {left} characters left
        </span>
        <button
          type="submit"
          disabled={state === 'sending'}
          className={`${s.press} ${s.title} inline-flex h-11 items-center gap-2 rounded-full bg-[var(--mustard)] px-6 text-base text-[var(--ink)] hover:bg-[var(--tile)] disabled:opacity-60`}
        >
          {state === 'sending' ? 'Leaving it…' : 'Leave a note'}
          <Send size={16} aria-hidden="true" />
        </button>
      </div>
      <p role="status" aria-live="polite" className={`min-h-[1.5rem] text-sm ${state === 'error' ? 'text-[#FFB4A0]' : 'text-[var(--mustard)]'}`}>
        {feedback}
      </p>
    </form>
  )
}
