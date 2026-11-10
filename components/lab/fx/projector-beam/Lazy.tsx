'use client'
import dynamic from 'next/dynamic'

export default dynamic(() => import('./Story'), { ssr: false, loading: () => null })
