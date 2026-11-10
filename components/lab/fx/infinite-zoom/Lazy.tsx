'use client'
import dynamic from 'next/dynamic'
export default dynamic(() => import('./Scene'), { ssr: false, loading: () => null })
