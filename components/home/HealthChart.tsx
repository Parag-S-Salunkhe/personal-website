'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { Activity, Flame } from 'lucide-react'

interface HealthData {
  id: string
  date: string
  steps: number
  calories: number
}

export default function HealthChart() {
  const [data, setData] = useState<HealthData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching health data:', error)
        setLoading(false)
      })
  }, [])

  const chartData = data.map((item) => ({
    date: format(new Date(item.date), 'MMM dd'),
    steps: item.steps,
    calories: item.calories,
  })).reverse()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <section id="health" className="py-20 bg-elegant-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-elegant-900 mb-12 text-center">
          Health & Fitness
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-indigo-100 rounded-full">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Steps</p>
                <p className="text-3xl font-bold text-elegant-900">
                  {data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.steps, 0) / data.length).toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Calories</p>
                <p className="text-3xl font-bold text-elegant-900">
                  {data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.calories, 0) / data.length).toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-elegant-900 mb-6">30-Day Trend</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis yAxisId="left" stroke="#6366f1" />
                <YAxis yAxisId="right" orientation="right" stroke="#f97316" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="steps"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="calories"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: '#f97316', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  )
}
