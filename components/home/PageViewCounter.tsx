'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

export default function PageViewCounter() {
  const [pageViews, setPageViews] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/pageviews', { method: 'POST' })
      .then(r => r.json())
      .then(data => setPageViews(data.count ?? 0))
      .catch(() => {})
  }, [])

  return (
    <div className="text-center text-sm text-ember-600 dark:text-ember-400 flex items-center gap-2">
      <Eye className="w-4 h-4" />
      <span className="font-medium">
        {pageViews !== null ? pageViews.toLocaleString() : '...'} visitors
      </span>
    </div>
  )
}
