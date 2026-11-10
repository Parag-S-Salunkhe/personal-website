'use client'
import { useEffect } from 'react'

// Counts one home-page visit (the old homepage did this too; the admin dashboard reads it).
export default function CountVisit() {
  useEffect(() => {
    fetch('/api/pageviews', { method: 'POST' }).catch(() => {})
  }, [])
  return null
}
