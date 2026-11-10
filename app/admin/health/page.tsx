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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="t-display mis text-4xl md:text-5xl mb-2">Health data</h1>
          <p className="text-riso-blue mt-1">Track your daily fitness metrics</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn"
        >
          <Plus className="w-5 h-5" />
          Add Entry
        </button>
      </div>

      {/* Google Fit Integration Section */}
      <div className="bg-slip p-6 border-2 border-riso-blue">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="t-title text-2xl text-ink mb-2">
              Google Fit integration
            </h2>
            <p className="text-riso-blue text-sm">
              Automatically sync your daily steps and calories from Google Fit
            </p>
          </div>

          {isGoogleFitConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-riso-blue text-sm font-medium">
                ✓ Connected
              </span>
            </div>
          ) : (
            <span className="text-riso-blue text-sm font-medium">
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
                className="btn"
              >
                {isSyncing ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Syncing...
                  </>
                ) : (
                  <>
                    Sync now
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
                className="btn btn-line"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={connectGoogleFit}
              className="btn"
            >
              Connect Google Fit
            </button>
          )}
        </div>

        {isGoogleFitConnected && (
          <div className="mt-4 p-4 border border-dashed border-riso-blue/40">
            <p className="text-sm text-riso-blue">
              <strong>Tip:</strong> Click &quot;Sync Now&quot; to fetch today&apos;s data from Google Fit and automatically save it to your dashboard.
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
            className="bg-slip p-6 border-2 border-riso-blue"
          >
            <h2 className="t-title text-xl text-ink mb-4">Add Health Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date */}
              <div>
                <label className="block t-label text-base text-ink mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="field"
                />
              </div>

              {/* Steps */}
              <div>
                <label className="block t-label text-base text-ink mb-2">
                  Steps *
                </label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-riso-blue/70" />
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.steps}
                    onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                    className="field pl-10 pr-4"
                    placeholder="e.g., 10000"
                  />
                </div>
              </div>

              {/* Calories */}
              <div>
                <label className="block t-label text-base text-ink mb-2">
                  Calories Burned *
                </label>
                <div className="relative">
                  <Flame className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-riso-blue/70" />
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    className="field pl-10 pr-4"
                    placeholder="e.g., 500"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-slip border border-riso-red text-riso-red text-sm">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn flex-1"
                >
                  {submitting ? 'Adding...' : 'Add Entry'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-line"
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
        <div className="text-center py-12 text-riso-blue">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 bg-slip border border-riso-blue">
          <p className="text-riso-blue">No health data yet. Add your first entry!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slip p-4 border-2 border-riso-blue hover:border-riso-pink"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-riso-blue/70" />
                    <span className="font-medium text-ink">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Steps */}
                  <div className="flex items-center gap-2 border border-riso-blue px-3 py-1">
                    <Activity className="w-4 h-4 text-riso-blue" />
                    <span className="text-sm font-medium text-riso-blue">
                      {entry.steps.toLocaleString()} steps
                    </span>
                  </div>

                  {/* Calories */}
                  <div className="flex items-center gap-2 border border-riso-blue px-3 py-1">
                    <Flame className="w-4 h-4 text-riso-blue" />
                    <span className="text-sm font-medium text-riso-blue">
                      {entry.calories} cal
                    </span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center border-2 border-riso-red text-riso-red hover:bg-riso-red hover:text-paper transition-colors"
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
