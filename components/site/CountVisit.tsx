'use client'
import { useEffect } from 'react'

// Counts one home-page visit (the admin dashboard reads it). Same request as components/zine/CountVisit.
export default function CountVisit() {
  useEffect(() => {
    fetch('/api/pageviews', { method: 'POST' }).catch(() => {})
  }, [])
  return null
}
