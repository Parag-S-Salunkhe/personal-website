'use client'
import dynamic from 'next/dynamic'
export default dynamic(() => import('./Reel'), { ssr: false, loading: () => null })
