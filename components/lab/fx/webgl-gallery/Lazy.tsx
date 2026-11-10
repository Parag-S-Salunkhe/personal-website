'use client'
import dynamic from 'next/dynamic'

export default dynamic(() => import('./Gallery'), { ssr: false, loading: () => null })
