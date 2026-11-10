'use client'

import { useState } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { Check, AlertTriangle } from 'lucide-react'
import styles from './styles.module.css'

const MAX = 500
const EMOJI = ['❤️', '👋', '🍷', '🎬', '😂']
type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'done' } | { kind: 'error'; text: string }

export type Scrap = { id: string; message: string; emoji: string | null }

export default function NoteForm({ scraps }: { scraps: Scrap[] }) {
  const reduce = !!useReducedMotion()
  const [message, setMessage] = useState('')
  const [emoji, setEmoji] = useState<string | null>(null)
  const [state, setState] = useState<State>({ kind: 'idle' })
  const left = MAX - message.length

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (state.kind === 'sending') return
    const text = message.trim()
    if (!text) {
      setState({ kind: 'error', text: 'Note not sent. Write a line or two first.' })
      return
    }
    setState({ kind: 'sending' })
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emoji ? { message: text, emoji } : { message: text }),
      })
      if (res.status === 201) {
        setState({ kind: 'done' })
        setMessage('')
        setEmoji(null)
        return
      }
      const body = await res.json().catch(() => ({}))
      if (res.status === 429) {
        setState({ kind: 'error', text: 'You left a note a moment ago. Wait five minutes, then try again.' })
      } else {
        setState({ kind: 'error', text: `Note not sent. ${typeof body.error === 'string' ? body.error : 'Try again in a moment.'}` })
      }
    } catch {
      setState({ kind: 'error', text: 'Note not sent. Check your connection and try again.' })
    }
  }

  return (
    <div id="leave-a-note" className="scroll-mt-6 rounded-[10px] bg-[var(--linen)] p-5 text-[var(--ink)] shadow-[0_24px_40px_-24px_rgba(0,0,0,.8)] sm:p-7">
      <h2 className={`${styles.display} text-2xl leading-tight sm:text-3xl`}>The guest book</h2>
      <p className={`${styles.pretty} mt-2 text-base text-[var(--ink-soft)]`}>Two chairs are empty. Leave a note and I will know you were here.</p>

      {scraps.length > 0 && (
        <ul className="mt-4 space-y-2">
          {scraps.slice(0, 2).map((s) => (
            <li key={s.id} className="flex gap-3 rounded-[6px] border border-dashed border-[var(--ink-soft)]/40 bg-white/50 px-3 py-2 text-sm">
              {s.emoji && <span aria-hidden="true">{s.emoji}</span>}
              <span className="line-clamp-2 break-words">{s.message}</span>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onSubmit} className="mt-5" noValidate>
        <label htmlFor="note-message" className="text-sm font-semibold">Your note</label>
        <textarea
          id="note-message"
          value={message}
          onChange={(e) => { setMessage(e.target.value); if (state.kind !== 'sending') setState({ kind: 'idle' }) }}
          maxLength={MAX}
          rows={4}
          aria-describedby="note-count note-status"
          placeholder="Say hello, or tell me what to cook next."
          className="mt-1 block min-h-[112px] w-full resize-y rounded-[6px] border border-[var(--ink-soft)]/50 bg-white/70 px-3 py-2 text-base text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--claret)]"
        />
        <div className="mt-1 flex items-center justify-between text-sm text-[var(--ink-soft)]">
          <span>No links, please.</span>
          <span id="note-count" className={styles.nums}>{left} left</span>
        </div>

        <fieldset className="mt-3">
          <legend className="text-sm font-semibold">Add a mark (optional)</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {EMOJI.map((em) => (
              <button
                key={em}
                type="button"
                aria-pressed={emoji === em}
                aria-label={`Mark: ${em}`}
                onClick={() => setEmoji(emoji === em ? null : em)}
                className={`h-11 w-11 rounded-full border text-xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--claret)] ${emoji === em ? 'border-[var(--claret)] bg-[var(--claret)]/15' : 'border-[var(--ink-soft)]/40 bg-white/50 hover:-translate-y-0.5'}`}
              >
                <span aria-hidden="true">{em}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={state.kind === 'sending'}
            className="min-h-[48px] rounded-full bg-[var(--claret)] px-6 text-base font-semibold text-[var(--wax)] shadow-[0_8px_16px_-8px_rgba(124,34,54,.8)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:translate-y-px active:scale-[.98] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--claret)]"
          >
            {state.kind === 'sending' ? 'Leaving it on the table' : 'Leave a note'}
          </button>
        </div>

        <div id="note-status" role="status" aria-live="polite" className="mt-3 min-h-[1.5rem] text-sm">
          <AnimatePresence mode="wait">
            {state.kind === 'done' && (
              <motion.p key="ok" initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="flex items-start gap-2 font-semibold text-[#1F5A3A]">
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> Note left. Thank you, the chair is warm.
              </motion.p>
            )}
            {state.kind === 'error' && (
              <motion.p key="err" initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="flex items-start gap-2 font-semibold text-[var(--claret)]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {state.text}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  )
}
