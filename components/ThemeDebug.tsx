'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeDebug() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg text-xs">
      <div className="font-bold mb-2">Theme Debug:</div>
      <div>Current theme: <span className="font-mono">{theme}</span></div>
      <div>Resolved theme: <span className="font-mono">{resolvedTheme}</span></div>
      <div>HTML class: <span className="font-mono">{document.documentElement.className}</span></div>
      <div className="mt-2 flex gap-2">
        <button 
          onClick={() => setTheme('light')}
          className="px-2 py-1 bg-yellow-200 rounded text-black"
        >
          Light
        </button>
        <button 
          onClick={() => setTheme('dark')}
          className="px-2 py-1 bg-gray-700 rounded text-white"
        >
          Dark
        </button>
      </div>
    </div>
  )
}
