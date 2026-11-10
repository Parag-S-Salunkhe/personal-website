'use client'
import { useState, type FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Send } from 'lucide-react'
import s from './styles.module.css'

const MAX = 500
const EMOJI = ['❤️', '👏', '🍿', '🍝', '😄']
type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'ok' } | { kind: 'err'; text: string }

export default function GuestbookForm() {
  const reduce = useReducedMotion()
  const [message, setMessage] = useState('')
  const [emoji, setEmoji] = useState<string | null>(null)
  const [state, setState] = useState<State>({ kind: 'idle' })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const text = message.trim()
    if (!text) { setState({ kind: 'err', text: 'Note not sent. Write a line or two first.' }); return }
    setState({ kind: 'sending' })
    try {
      const res = await fetch('/api/guestbook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(emoji ? { message: text, emoji } : { message: text }) })
      if (res.status === 201) { setState({ kind: 'ok' }); setMessage(''); setEmoji(null); return }
      if (res.status === 429) { setState({ kind: 'err', text: 'Note not sent. One note per visit: wait five minutes and try again.' }); return }
      const body = await res.json().catch(() => null)
      setState({ kind: 'err', text: `Note not sent. ${body?.error ?? 'Something went wrong. Try again in a moment.'}` })
    } catch {
      setState({ kind: 'err', text: 'Note not sent. Check your connection and try again.' })
    }
  }

  if (state.kind === 'ok') {
    return (
      <motion.div role="status" initial={reduce ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="border-2 border-[var(--brass)] bg-[var(--beam)] p-6 text-[var(--velvet)]">
        <p className={`${s.display} text-4xl`}>Note&apos;s in the box</p>
        <p className="mt-2">Thanks for stopping by. I read every one, usually with a snack.</p>
        <button type="button" onClick={() => setState({ kind: 'idle' })} className="mt-4 inline-flex min-h-[44px] items-center underline">Leave another</button>
      </motion.div>
    )
  }
  const sending = state.kind === 'sending'
  return (
    <form onSubmit={onSubmit} noValidate className="border-2 border-[var(--brass)] bg-[var(--velvet)]/80 p-5 sm:p-6">
      <label htmlFor="ls-note" className={`${s.display} block text-3xl`}>Leave a note</label>
      <p id="ls-hint" className="mt-1 text-sm text-[var(--beam)]/80">Say hello, or tell me what to watch next. No links please.</p>
      <textarea id="ls-note" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={MAX} rows={3} aria-describedby="ls-hint ls-count ls-status"
        className="mt-3 w-full resize-y border border-[var(--brass)]/70 bg-[#14040a] p-3 text-base text-[var(--beam)] placeholder:text-[var(--beam)]/55" placeholder="Dear Parag, ..." />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <fieldset className="flex items-center gap-1">
          <legend className="sr-only">Pick an emoji, optional</legend>
          {EMOJI.map((e) => (
            <label key={e} className="cursor-pointer">
              <input type="checkbox" className="peer sr-only" checked={emoji === e} onChange={() => setEmoji(emoji === e ? null : e)} />
              <span className="grid h-11 w-11 place-items-center border border-transparent text-xl peer-checked:border-[var(--tungsten)] peer-checked:bg-[var(--curtain)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-[var(--tungsten)]">{e}</span>
            </label>
          ))}
        </fieldset>
        <span id="ls-count" className={`num text-sm ${message.length > MAX - 40 ? 'text-[var(--tungsten)]' : 'text-[var(--beam)]/80'}`}>{message.length} / {MAX}</span>
      </div>
      <button type="submit" disabled={sending} className="mt-3 inline-flex min-h-[48px] w-full items-center justify-center gap-2 bg-[var(--tungsten)] px-6 font-bold text-[var(--velvet)] hover:bg-[var(--beam)] active:translate-y-px active:scale-[0.98] disabled:opacity-60">
        <Send size={18} aria-hidden /> {sending ? 'Sending' : 'Leave a note'}
      </button>
      <p id="ls-status" role={state.kind === 'err' ? 'alert' : undefined} className="mt-3 min-h-[1.5rem] text-sm text-[var(--beam)]">{state.kind === 'err' ? state.text : ''}</p>
    </form>
  )
}
