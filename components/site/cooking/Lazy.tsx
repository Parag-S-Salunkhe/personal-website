'use client'
// Ported from components/lab/fx/popup-book/Lazy.tsx
import dynamic from 'next/dynamic'

export default dynamic(() => import('./PopupBook'), { ssr: false, loading: () => null })
