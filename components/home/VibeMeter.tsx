'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

const moods = [
  { key: 'happy', emoji: '😊', label: 'Happy', color: 'from-yellow-400 to-orange-400' },
  { key: 'fire', emoji: '🔥', label: 'Fire', color: 'from-red-400 to-orange-500' },
  { key: 'neutral', emoji: '😐', label: 'Neutral', color: 'from-gray-400 to-gray-500' },
  { key: 'sad', emoji: '😔', label: 'Sad', color: 'from-blue-400 to-indigo-500' },
  { key: 'sleepy', emoji: '😴', label: 'Sleepy', color: 'from-purple-400 to-pink-500' },
] as const

export default function VibeMeter() {
  const [stats, setStats] = useState<MoodStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [voted, setVoted] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/mood')
      const data = await res.json()
      setStats(data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching mood stats:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleVote = async (mood: string) => {
    setError(null)
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to vote')
        return
      }

      setStats(data)
      setVoted(true)
      setSelectedMood(mood)
    } catch (err) {
      setError('Failed to submit vote')
    }
  }

  const topMood = stats
    ? moods.reduce((prev, current) =>
        stats.percentages[current.key as keyof typeof stats.percentages] >
        stats.percentages[prev.key as keyof typeof stats.percentages]
          ? current
          : prev
      )
    : null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="w-full"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 dark:from-pink-900/20 dark:to-purple-900/20 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-xl">
          <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            How are you feeling today?
          </h2>

          {stats && topMood && (
            <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
              {stats.percentages[topMood.key as keyof typeof stats.percentages]}% of visitors are feeling {topMood.emoji} today
            </p>
          )}

          {/* Mood Buttons */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {moods.map((mood) => (
              <motion.button
                key={mood.key}
                onClick={() => !voted && handleVote(mood.key)}
                disabled={voted}
                whileHover={!voted ? { scale: 1.1 } : {}}
                whileTap={!voted ? { scale: 0.95 } : {}}
                className={`relative p-4 rounded-2xl text-4xl transition-all duration-300 ${
                  voted
                    ? selectedMood === mood.key
                      ? 'bg-gradient-to-br ' + mood.color + ' shadow-lg'
                      : 'opacity-50 cursor-not-allowed'
                    : 'bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 cursor-pointer'
                }`}
              >
                {mood.emoji}
                {voted && selectedMood === mood.key && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs"
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-center text-red-700 dark:text-red-300"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Bars */}
          {stats && !loading && (
            <div className="space-y-3">
              {moods.map((mood) => {
                const percentage = stats.percentages[mood.key as keyof typeof stats.percentages]
                const count = stats.stats[mood.key as keyof typeof stats.stats]
                
                return (
                  <div key={mood.key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{mood.emoji}</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {mood.label}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-white/20 dark:bg-black/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full bg-gradient-to-r ${mood.color}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {voted && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6"
            >
              Thanks for sharing! You can vote again in 24 hours.
            </motion.p>
          )}
        </div>
      </div>
    </motion.section>
  )
}
