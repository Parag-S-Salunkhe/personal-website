'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar, Activity, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import TodayActivities from '@/components/home/TodayActivities'

interface HealthEntry {
  id: string
  date: string
  steps: number
  calories: number
  createdAt: string
}

export default function HealthAdmin() {
  const [entries, setEntries] = useState<HealthEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    steps: '',
    calories: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Google Fit integration state
  const [isGoogleFitConnected, setIsGoogleFitConnected] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    fetchEntries()
  }, [])

  // Check if Google Fit is connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health/sync')
        setIsGoogleFitConnected(response.ok)
      } catch {
        setIsGoogleFitConnected(false)
      }
    }
    checkConnection()
  }, [])

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/health')
      if (!response.ok) {
        throw new Error('Failed to fetch health data')
      }
      const data = await response.json()
      console.log('Fetched health data:', data) // Debug log
      // API returns array directly, not wrapped in data property
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a: HealthEntry, b: HealthEntry) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setEntries(sorted)
    } catch (error) {
      console.error('Error fetching health data:', error)
      setError('Failed to load health data')
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          steps: parseInt(formData.steps),
          calories: parseInt(formData.calories),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add health data')
      }

      setFormData({
        date: new Date().toISOString().split('T')[0],
        steps: '',
        calories: '',
      })
      setShowForm(false)
      fetchEntries()
    } catch (err: any) {
      setError(err.message || 'Failed to add health data. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const response = await fetch(`/api/health?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchEntries()
      } else {
        const data = await response.json()
        alert(`Failed to delete entry: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete entry')
    }
  }

  // Sync health data from Google Fit
  const syncGoogleFit = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/health/sync')
      if (response.ok) {
        alert('✅ Health data synced successfully! Refresh to see updated data.')
        window.location.reload()
      } else {
        const data = await response.json()
        alert(`❌ Failed to sync: ${data.error || 'Please try reconnecting Google Fit.'}`)
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert('❌ Sync failed. Please try again.')
    } finally {
      setIsSyncing(false)
    }
  }

  // Connect to Google Fit
  const connectGoogleFit = () => {
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Data</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your daily fitness metrics</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Entry
        </button>
      </div>

      {/* Google Fit Integration Section */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🏃‍♂️ Google Fit Integration
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Automatically sync your daily steps and calories from Google Fit
            </p>
          </div>

          {isGoogleFitConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                ✓ Connected
              </span>
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Not connected
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {isGoogleFitConnected ? (
            <>
              <button
                onClick={syncGoogleFit}
                disabled={isSyncing}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Syncing...
                  </>
                ) : (
                  <>
                    🔄 Sync Now
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  if (confirm('Disconnect Google Fit? You can reconnect anytime.')) {
                    document.cookie = 'google_access_token=; Max-Age=0; path=/'
                    document.cookie = 'google_refresh_token=; Max-Age=0; path=/'
                    setIsGoogleFitConnected(false)
                    alert('✅ Disconnected from Google Fit')
                  }
                }}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={connectGoogleFit}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              🔗 Connect Google Fit
            </button>
          )}
        </div>

        {isGoogleFitConnected && (
          <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Tip:</strong> Click &quot;Sync Now&quot; to fetch today&apos;s data from Google Fit and automatically save it to your dashboard.
            </p>
          </div>
        )}
      </div>

      {/* Add Entry Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Health Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Steps */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Steps *
                </label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.steps}
                    onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 10000"
                  />
                </div>
              </div>

              {/* Calories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Calories Burned *
                </label>
                <div className="relative">
                  <Flame className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 500"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Entry'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries List */}
      {loading ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400">No health data yet. Add your first entry!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Steps */}
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-lg">
                    <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {entry.steps.toLocaleString()} steps
                    </span>
                  </div>

                  {/* Calories */}
                  <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 rounded-lg">
                    <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      {entry.calories} cal
                    </span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-2 text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Activity Tracking - Admin Only */}
      <div className="mt-8">
        <TodayActivities />
      </div>
    </div>
  )
}
