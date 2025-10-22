'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { format } from 'date-fns'
import { Activity, Flame, TrendingUp, TrendingDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface HealthData {
  id: string
  date: string
  steps: number
  calories: number
}

type TabType = 'Last 7 Days' | 'Last 30 Days' | 'Select Month' | 'Custom Range'

// Custom Tooltip Component for Steps
const StepsTooltip = ({ active, payload, label, healthData }: any) => {
  if (!active || !payload || !payload[0]) return null
  
  const steps = payload[0].value
  const entry = healthData.find((d: any) => d.date === label)
  if (!entry) return null
  
  const date = new Date(entry.rawDate)
  
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  
  const dataIndex = healthData.findIndex((item: any) => item.date === label)
  const yesterdayData = dataIndex > 0 ? healthData[dataIndex - 1] : null
  const change = yesterdayData ? steps - yesterdayData.steps : 0
  const percentChange = yesterdayData ? ((change / yesterdayData.steps) * 100).toFixed(1) : null
  
  const dailyGoal = 10000
  const goalProgress = Math.min((steps / dailyGoal) * 100, 100)
  
  return (
    <div className="animate-fadeIn" style={{
      background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.97) 0%, rgba(31, 41, 55, 0.97) 100%)',
      backdropFilter: 'blur(12px)',
      border: '2px solid rgba(139, 92, 246, 0.3)',
      borderRadius: '16px',
      padding: '16px 20px',
      minWidth: '220px',
      boxShadow: '0 20px 60px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {date.toLocaleDateString('en-US', { weekday: 'short' })}
        </div>
        {isToday && (
          <span style={{ padding: '2px 8px', background: 'rgba(139, 92, 246, 0.2)', color: '#C4B5FD', fontSize: '11px', fontWeight: 700, borderRadius: '9999px' }}>
            TODAY
          </span>
        )}
      </div>
      
      <div style={{ fontSize: '13px', fontWeight: 500, color: '#D1D5DB', marginBottom: '16px' }}>
        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '28px', fontWeight: 900, background: 'linear-gradient(to right, #C4B5FD, #F9A8D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {steps.toLocaleString()}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#9CA3AF' }}>steps</span>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Daily Goal</span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#C4B5FD' }}>{goalProgress.toFixed(0)}%</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(55, 65, 81, 0.5)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              background: 'linear-gradient(to right, #8B5CF6, #EC4899)', 
              borderRadius: '9999px',
              width: `${goalProgress}%`,
              transition: 'width 0.5s ease-out'
            }}
          />
        </div>
      </div>
      
      {percentChange !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid rgba(55, 65, 81, 0.5)' }}>
          {change > 0 ? (
            <>
              <span style={{ color: '#4ADE80' }}>↗</span>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                <span style={{ color: '#4ADE80', fontWeight: 600 }}>+{Math.abs(change).toLocaleString()}</span> vs yesterday
              </span>
              <span style={{ fontSize: '11px', color: '#4ADE80', fontWeight: 700, marginLeft: 'auto' }}>+{percentChange}%</span>
            </>
          ) : change < 0 ? (
            <>
              <span style={{ color: '#F87171' }}>↘</span>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                <span style={{ color: '#F87171', fontWeight: 600 }}>-{Math.abs(change).toLocaleString()}</span> vs yesterday
              </span>
              <span style={{ fontSize: '11px', color: '#F87171', fontWeight: 700, marginLeft: 'auto' }}>{percentChange}%</span>
            </>
          ) : (
            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Same as yesterday</span>
          )}
        </div>
      )}
      
      {steps >= dailyGoal && (
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'linear-gradient(to right, rgba(234, 179, 8, 0.2), rgba(249, 115, 22, 0.2))', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
          <span style={{ fontSize: '16px' }}>🏆</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#FCD34D' }}>Goal Achieved!</span>
        </div>
      )}
    </div>
  )
}

// Custom Tooltip Component for Calories
const CaloriesTooltip = ({ active, payload, label, healthData }: any) => {
  if (!active || !payload || !payload[0]) return null
  
  const calories = payload[0].value
  const entry = healthData.find((d: any) => d.date === label)
  if (!entry) return null
  
  const date = new Date(entry.rawDate)
  
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  
  const dataIndex = healthData.findIndex((item: any) => item.date === label)
  const yesterdayData = dataIndex > 0 ? healthData[dataIndex - 1] : null
  const change = yesterdayData ? calories - yesterdayData.calories : 0
  const percentChange = yesterdayData ? ((change / yesterdayData.calories) * 100).toFixed(1) : null
  
  const dailyGoal = 2500
  const goalProgress = Math.min((calories / dailyGoal) * 100, 100)
  
  return (
    <div className="animate-fadeIn" style={{
      background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.97) 0%, rgba(31, 41, 55, 0.97) 100%)',
      backdropFilter: 'blur(12px)',
      border: '2px solid rgba(245, 158, 11, 0.3)',
      borderRadius: '16px',
      padding: '16px 20px',
      minWidth: '220px',
      boxShadow: '0 20px 60px rgba(245, 158, 11, 0.4), 0 0 0 1px rgba(245, 158, 11, 0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {date.toLocaleDateString('en-US', { weekday: 'short' })}
        </div>
        {isToday && (
          <span style={{ padding: '2px 8px', background: 'rgba(245, 158, 11, 0.2)', color: '#FCD34D', fontSize: '11px', fontWeight: 700, borderRadius: '9999px' }}>
            TODAY
          </span>
        )}
      </div>
      
      <div style={{ fontSize: '13px', fontWeight: 500, color: '#D1D5DB', marginBottom: '16px' }}>
        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '28px', fontWeight: 900, background: 'linear-gradient(to right, #FB923C, #FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {calories.toLocaleString()}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#9CA3AF' }}>cal</span>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Daily Burn</span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#FB923C' }}>{goalProgress.toFixed(0)}%</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(55, 65, 81, 0.5)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              background: 'linear-gradient(to right, #F59E0B, #FCD34D)', 
              borderRadius: '9999px',
              width: `${goalProgress}%`,
              transition: 'width 0.5s ease-out'
            }}
          />
        </div>
      </div>
      
      {percentChange !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid rgba(55, 65, 81, 0.5)' }}>
          {change > 0 ? (
            <>
              <span style={{ color: '#4ADE80' }}>↗</span>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                <span style={{ color: '#4ADE80', fontWeight: 600 }}>+{Math.abs(change).toLocaleString()}</span> vs yesterday
              </span>
              <span style={{ fontSize: '11px', color: '#4ADE80', fontWeight: 700, marginLeft: 'auto' }}>+{percentChange}%</span>
            </>
          ) : change < 0 ? (
            <>
              <span style={{ color: '#F87171' }}>↘</span>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                <span style={{ color: '#F87171', fontWeight: 600 }}>-{Math.abs(change).toLocaleString()}</span> vs yesterday
              </span>
              <span style={{ fontSize: '11px', color: '#F87171', fontWeight: 700, marginLeft: 'auto' }}>{percentChange}%</span>
            </>
          ) : (
            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Same as yesterday</span>
          )}
        </div>
      )}
      
      {calories >= dailyGoal && (
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'linear-gradient(to right, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          <span style={{ fontSize: '16px' }}>🔥</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#4ADE80' }}>Great Burn!</span>
        </div>
      )}
    </div>
  )
}

export default function CompactHealthChart() {
  const [data, setData] = useState<HealthData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('Last 7 Days')
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [summaryStats, setSummaryStats] = useState({
    todaySteps: 0,
    weekAvgSteps: 0,
    bestDaySteps: 0,
    streak: 0,
    todayCalories: 0,
    weekAvgCalories: 0,
    bestDayCalories: 0,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/health')
      const allData = await res.json()
      
      let filtered = allData
      const now = new Date()
      
      if (activeTab === 'Last 7 Days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filtered = allData.filter((item: HealthData) => new Date(item.date) >= sevenDaysAgo)
      } else if (activeTab === 'Last 30 Days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filtered = allData.filter((item: HealthData) => new Date(item.date) >= thirtyDaysAgo)
      } else if (activeTab === 'Select Month') {
        const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1)
        const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)
        filtered = allData.filter((item: HealthData) => {
          const date = new Date(item.date)
          return date >= monthStart && date <= monthEnd
        })
      } else if (activeTab === 'Custom Range') {
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate)
          const end = new Date(customEndDate)
          filtered = allData.filter((item: HealthData) => {
            const date = new Date(item.date)
            return date >= start && date <= end
          })
        }
      }
      
      setData(filtered)
    } catch (error) {
      console.error('Error fetching health data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedMonth])

  // Calculate summary stats when data changes
  useEffect(() => {
    const calculateStats = async () => {
      try {
        const res = await fetch('/api/health')
        const allData = await res.json()
        
        if (allData.length > 0) {
          // Sort by date descending
          const sorted = allData.sort((a: HealthData, b: HealthData) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          
          const today = sorted[0]
          const last7Days = sorted.slice(0, 7)
          
          // Calculate averages
          const avgSteps = Math.round(
            last7Days.reduce((sum: number, d: HealthData) => sum + d.steps, 0) / last7Days.length
          )
          const avgCalories = Math.round(
            last7Days.reduce((sum: number, d: HealthData) => sum + d.calories, 0) / last7Days.length
          )
          
          // Find best days
          const bestSteps = Math.max(...last7Days.map((d: HealthData) => d.steps))
          const bestCalories = Math.max(...last7Days.map((d: HealthData) => d.calories))
          
          // Calculate streak (days with >= 5000 steps)
          let currentStreak = 0
          for (const day of sorted) {
            if (day.steps >= 5000) currentStreak++
            else break
          }
          
          setSummaryStats({
            todaySteps: today.steps,
            weekAvgSteps: avgSteps,
            bestDaySteps: bestSteps,
            streak: currentStreak,
            todayCalories: today.calories,
            weekAvgCalories: avgCalories,
            bestDayCalories: bestCalories,
          })
        }
      } catch (error) {
        console.error('Error calculating stats:', error)
      }
    }
    
    calculateStats()
  }, [])

  const chartData = data.map((item) => ({
    date: activeTab === 'Last 7 Days' ? format(new Date(item.date), 'EEE') : format(new Date(item.date), 'MMM dd'),
    rawDate: item.date,
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
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            📊 Health & Fitness
          </h2>

          {/* Combined Summary Stats - Steps & Calories in one row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 mb-8">
            {/* Steps Stats */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-4">
              <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-2">
                <span>👟</span>
                <span>STEPS</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Today */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700/50">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Today</div>
                  <div className="text-xl font-black text-purple-600 dark:text-purple-400">
                    {summaryStats.todaySteps.toLocaleString()}
                  </div>
                </div>
                
                {/* 7-Day Avg */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">7-Day</div>
                  <div className="text-xl font-black text-gray-900 dark:text-white">
                    {summaryStats.weekAvgSteps.toLocaleString()}
                  </div>
                </div>
                
                {/* Best */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Best</div>
                  <div className="text-xl font-black text-green-600 dark:text-green-400">
                    {summaryStats.bestDaySteps.toLocaleString()}
                  </div>
                </div>
                
                {/* Streak */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700/50">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Streak</div>
                  <div className="text-xl font-black text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                    <span>🔥</span>
                    <span>{summaryStats.streak}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Calories Stats */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-4">
              <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2">
                <span>🔥</span>
                <span>CALORIES</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Today */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-3 border border-orange-200 dark:border-orange-700/50">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Today</div>
                  <div className="text-xl font-black text-orange-600 dark:text-orange-400">
                    {summaryStats.todayCalories.toLocaleString()}
                  </div>
                </div>
                
                {/* 7-Day Avg */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">7-Day</div>
                  <div className="text-xl font-black text-gray-900 dark:text-white">
                    {summaryStats.weekAvgCalories.toLocaleString()}
                  </div>
                </div>
                
                {/* Best */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Best</div>
                  <div className="text-xl font-black text-green-600 dark:text-green-400">
                    {summaryStats.bestDayCalories.toLocaleString()}
                  </div>
                </div>
                
                {/* Weekly Total */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700/50">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Week</div>
                  <div className="text-xl font-black text-yellow-600 dark:text-yellow-400">
                    {(summaryStats.weekAvgCalories * 7).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(['Last 7 Days', 'Last 30 Days', 'Select Month', 'Custom Range'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Month Selector */}
          {activeTab === 'Select Month' && (
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Month:
              </label>
              <input
                type="month"
                value={`${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`}
                onChange={(e) => {
                  const [year, month] = e.target.value.split('-')
                  setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1, 1))
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
              />
            </div>
          )}

          {/* Custom Date Range Picker */}
          {activeTab === 'Custom Range' && (
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  From:
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  To:
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Apply
              </button>
            </div>
          )}
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
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Steps Trend
            </h3>
            <div className="p-6 rounded-3xl bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A78BFA" stopOpacity={1} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  content={<StepsTooltip healthData={chartData} />}
                  cursor={{ 
                    fill: 'rgba(139, 92, 246, 0.08)',
                    radius: 8
                  }}
                />
                <Bar 
                  dataKey="steps" 
                  fill="url(#stepsGradient)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Calories Chart */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Calories Trend
            </h3>
            <div className="p-6 rounded-3xl bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FCD34D" stopOpacity={1} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  content={<CaloriesTooltip healthData={chartData} />}
                  cursor={{ 
                    fill: 'rgba(245, 158, 11, 0.08)',
                    radius: 8
                  }}
                />
                <Bar 
                  dataKey="calories" 
                  fill="url(#caloriesGradient)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
