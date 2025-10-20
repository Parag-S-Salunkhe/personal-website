'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Check } from 'lucide-react'

interface MoodStats {
  stats: {
    happy: number
    fire: number
    neutral: number
    sad: number
    sleepy: number
  }
  percentages: {
    happy: number
    fire: number
    neutral: number
    sad: number
    sleepy: number
  }
  total: number
}

interface Message {
  id: string
  message: string
  emoji?: string
  createdAt: string
}

const moods = [
  { key: 'happy', emoji: '😊', label: 'Happy', color: 'from-yellow-400 to-orange-400', quote: "Your positive energy is contagious! Keep shining! ✨" },
  { key: 'fire', emoji: '🔥', label: 'Fire', color: 'from-red-400 to-orange-500', quote: "You're on fire today! Channel that energy into something amazing! 💪" },
  { key: 'neutral', emoji: '😐', label: 'Neutral', color: 'from-gray-400 to-gray-500', quote: "Every moment is a fresh start. What will you create today? 🌱" },
  { key: 'sad', emoji: '😔', label: 'Sad', color: 'from-blue-400 to-indigo-500', quote: "Tough days build stronger tomorrows. You've got this! 💙" },
  { key: 'sleepy', emoji: '😴', label: 'Sleepy', color: 'from-purple-400 to-pink-500', quote: "Rest is productive too. Recharge and come back stronger! 🌙" },
] as const

const emojis = ['👍', '❤️', '🎉', '🔥', '✨', '🚀']
const presetMessages = ['Love the site!', 'Great work!', 'Keep it up!', 'Inspiring!']

export default function MoodGuestbookRow() {
  // Mood state
  const [stats, setStats] = useState<MoodStats | null>(null)
  const [moodLoading, setMoodLoading] = useState(true)
  const [voted, setVoted] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [moodError, setMoodError] = useState<string | null>(null)
  const [showQuote, setShowQuote] = useState(false)
  const [currentQuote, setCurrentQuote] = useState('')

  // Guestbook state
  const [messageMode, setMessageMode] = useState<'quick' | 'custom'>('quick')
  const [recentMessages, setRecentMessages] = useState<Message[]>([])
  const [selectedEmoji, setSelectedEmoji] = useState(emojis[0])
  const [selectedPreset, setSelectedPreset] = useState(presetMessages[0])
  const [customMessage, setCustomMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMoodStats = async () => {
    try {
      const res = await fetch('/api/mood')
      const data = await res.json()
      setStats(data)
      setMoodLoading(false)
    } catch (err) {
      console.error('Error fetching mood stats:', err)
      setMoodLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/guestbook')
      const data = await res.json()
      setRecentMessages(data.slice(0, 3))
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  useEffect(() => {
    fetchMoodStats()
    fetchMessages()
  }, [])

  const handleVote = async (mood: string) => {
    setMoodError(null)
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMoodError(data.error || 'Failed to vote')
        return
      }

      setStats(data)
      setVoted(true)
      setSelectedMood(mood)
      
      // Show motivational quote
      const moodData = moods.find(m => m.key === mood)
      if (moodData) {
        setCurrentQuote(moodData.quote)
        setShowQuote(true)
        setTimeout(() => setShowQuote(false), 5000)
      }
    } catch (err) {
      setMoodError('Failed to submit vote')
    }
  }

  const validateCustomMessage = (msg: string): string | null => {
    if (!msg.trim()) return 'Message cannot be empty'
    if (msg.length > 500) return 'Message is too long (max 500 characters)'
    
    // Check for URLs
    const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi
    if (urlPattern.test(msg)) return 'URLs are not allowed'
    
    // Check for HTML tags
    if (/<[^>]*>/g.test(msg)) return 'HTML tags are not allowed'
    
    // Check for excessive special characters
    const specialChars = msg.match(/[^a-zA-Z0-9\s.,!?'"]/g) || []
    if (specialChars.length / msg.length > 0.2) return 'Too many special characters'
    
    // Check for repeating characters
    if (/(.)\1{5,}/.test(msg)) return 'Please avoid repeating characters'
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const message = messageMode === 'quick' ? selectedPreset : customMessage

    // Validate custom message
    if (messageMode === 'custom') {
      const validationError = validateCustomMessage(message)
      if (validationError) {
        setError(validationError)
        setLoading(false)
        return
      }
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
      fetchMessages()
      
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
      transition={{ delay: 0.4 }}
      className="w-full"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Mood Meter */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 dark:from-pink-900/20 dark:to-purple-900/20 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-xl">
            <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
              How are you feeling?
            </h2>

            {/* Mood Buttons */}
            <div className="flex justify-center gap-3 mb-6 flex-wrap">
              {moods.map((mood) => (
                <motion.button
                  key={mood.key}
                  onClick={() => !voted && handleVote(mood.key)}
                  disabled={voted}
                  whileHover={!voted ? { scale: 1.1 } : {}}
                  whileTap={!voted ? { scale: 0.95 } : {}}
                  className={`relative p-3 rounded-2xl text-3xl transition-all duration-300 ${
                    voted
                      ? selectedMood === mood.key
                        ? 'bg-gradient-to-br ' + mood.color + ' shadow-lg'
                        : 'opacity-50 cursor-not-allowed'
                      : 'bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 cursor-pointer'
                  }`}
                >
                  {mood.emoji}
                </motion.button>
              ))}
            </div>

            {/* Motivational Quote */}
            <AnimatePresence>
              {showQuote && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 bg-white/20 dark:bg-black/20 rounded-xl text-center text-gray-800 dark:text-gray-200 font-medium"
                >
                  {currentQuote}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats Bars */}
            {stats && !moodLoading && (
              <div className="space-y-2">
                {moods.map((mood) => {
                  const percentage = stats.percentages[mood.key as keyof typeof stats.percentages]
                  
                  return (
                    <div key={mood.key}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{mood.emoji}</span>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {mood.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {percentage}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/20 dark:bg-black/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                          className={`h-full bg-gradient-to-r ${mood.color}`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Guestbook */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-900/20 dark:to-cyan-900/20 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-xl">
            <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Leave a message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mode Toggle */}
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => setMessageMode('quick')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    messageMode === 'quick'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white/20 dark:bg-black/20 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Quick Pick
                </button>
                <button
                  type="button"
                  onClick={() => setMessageMode('custom')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    messageMode === 'custom'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white/20 dark:bg-black/20 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Custom Message
                </button>
              </div>

              {/* Emoji Picker */}
              <div className="flex gap-2 justify-center flex-wrap">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-2xl p-2 rounded-xl transition-all duration-300 ${
                      selectedEmoji === emoji
                        ? 'bg-blue-500/30 scale-110'
                        : 'bg-white/20 dark:bg-black/20 hover:scale-105'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Message Input */}
              <AnimatePresence mode="wait">
                {messageMode === 'quick' ? (
                  <motion.div
                    key="quick"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <select
                      value={selectedPreset}
                      onChange={(e) => setSelectedPreset(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/50 border border-white/30 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value.slice(0, 500))}
                      placeholder="Write something nice..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/50 border border-white/30 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
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
                    className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-center text-red-700 dark:text-red-300 text-xs"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Posting...
                  </>
                ) : success ? (
                  <>
                    <Check className="w-4 h-4" />
                    Posted!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </button>
            </form>

            {/* Recent Messages */}
            {recentMessages.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-2">Recent messages</p>
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 bg-white/20 dark:bg-black/20 rounded-lg flex items-start gap-2"
                  >
                    {msg.emoji && <span className="text-lg">{msg.emoji}</span>}
                    <p className="text-sm text-gray-800 dark:text-gray-200 flex-1">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
