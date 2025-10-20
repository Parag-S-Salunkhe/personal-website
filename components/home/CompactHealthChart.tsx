'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { format } from 'date-fns'
import { Activity, Flame, TrendingUp, TrendingDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface HealthData {
  id: string
  date: string
  steps: number
  calories: number
}

type DateRange = 7 | 30 | 90 | 'all'

export default function CompactHealthChart() {
  const [data, setData] = useState<HealthData[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>(7)

  const fetchData = async (days: DateRange) => {
    setLoading(true)
    try {
      const url = days === 'all' ? '/api/health' : `/api/health?days=${days}`
      const res = await fetch(url)
      const fetchedData = await res.json()
      setData(fetchedData)
    } catch (error) {
      console.error('Error fetching health data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(dateRange)
  }, [dateRange])

  const chartData = data.map((item) => ({
    date: dateRange === 7 ? format(new Date(item.date), 'EEE') : format(new Date(item.date), 'MMM dd'),
    steps: item.steps,
    calories: item.calories,
  }))

  // Calculate trends
  const avgSteps = data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.steps, 0) / data.length) : 0
  const avgCalories = data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.calories, 0) / data.length) : 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
            Health & Fitness
          </h2>

          {/* Date Range Filter */}
          <div className="flex gap-2 bg-white/50 dark:bg-black/50 backdrop-blur-lg border border-white/30 dark:border-white/20 rounded-full p-1">
            {[
              { label: 'Last 7 Days', value: 7 as DateRange },
              { label: 'Last 30 Days', value: 30 as DateRange },
              { label: 'Last 90 Days', value: 90 as DateRange },
              { label: 'All Time', value: 'all' as DateRange },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  dateRange === option.value
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-black/30'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full p-6 rounded-3xl bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 dark:border-white/10"
            >
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
          {/* Steps Chart */}
          <div className="p-6 rounded-3xl bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Steps</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="steps" fill="url(#purpleGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Calories Chart */}
          <div className="p-6 rounded-3xl bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Flame className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Calories</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
