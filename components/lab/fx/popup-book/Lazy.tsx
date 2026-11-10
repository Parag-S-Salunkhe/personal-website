'use client'
import dynamic from 'next/dynamic'

export default dynamic(() => import('./PopupBook'), { ssr: false, loading: () => null })
