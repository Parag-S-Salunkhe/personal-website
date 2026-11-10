'use client'
import dynamic from 'next/dynamic'

export default dynamic(() => import('./TableOrbit'), { ssr: false, loading: () => null })
