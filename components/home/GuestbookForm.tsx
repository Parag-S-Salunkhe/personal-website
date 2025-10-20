'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Check } from 'lucide-react'

const emojis = ['👍', '❤️', '🎉', '🔥', '✨', '🚀', '💯', '😊']
const presetMessages = [
  'Love the site!',
  'Great work!',
  'Keep it up!',
  'Inspiring!',
  'Amazing design!',
  'Very cool!',
]

export default function GuestbookForm() {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset')
  const [selectedEmoji, setSelectedEmoji] = useState(emojis[0])
  const [selectedPreset, setSelectedPreset] = useState(presetMessages[0])
  const [customMessage, setCustomMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const message = mode === 'preset' ? selectedPreset : customMessage

    if (!message.trim()) {
      setError('Please enter a message')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          emoji: selectedEmoji,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to post message')
        setLoading(false)
        return
      }

      setSuccess(true)
      setCustomMessage('')
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError('Failed to post message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="w-full"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-900/20 dark:to-cyan-900/20 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-xl">
          <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Leave a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setMode('preset')}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  mode === 'preset'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/20 dark:bg-black/20 text-gray-700 dark:text-gray-300'
                }`}
              >
                Quick Message
              </button>
              <button
                type="button"
                onClick={() => setMode('custom')}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  mode === 'custom'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/20 dark:bg-black/20 text-gray-700 dark:text-gray-300'
                }`}
              >
                Custom Message
              </button>
            </div>

            {/* Emoji Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pick an emoji
              </label>
              <div className="flex gap-2 flex-wrap justify-center">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-3xl p-2 rounded-xl transition-all duration-300 ${
                      selectedEmoji === emoji
                        ? 'bg-blue-500/30 scale-110'
                        : 'bg-white/20 dark:bg-black/20 hover:scale-105'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <AnimatePresence mode="wait">
              {mode === 'preset' ? (
                <motion.div
                  key="preset"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Choose a message
                  </label>
                  <select
                    value={selectedPreset}
                    onChange={(e) => setSelectedPreset(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/50 border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {presetMessages.map((msg) => (
                      <option key={msg} value={msg}>
                        {msg}
                      </option>
                    ))}
                  </select>
                </motion.div>
              ) : (
                <motion.div
                  key="custom"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your message (max 500 characters)
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value.slice(0, 500))}
                    placeholder="Write something nice..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/50 border border-white/30 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {customMessage.length}/500 characters
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-center text-red-700 dark:text-red-300 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-center text-green-700 dark:text-green-300 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Message posted successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Posting...
                </>
              ) : success ? (
                <>
                  <Check className="w-5 h-5" />
                  Posted!
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </motion.section>
  )
}
