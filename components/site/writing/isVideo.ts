import type { Post } from '@/lib/content'

// Copied from components/zine/PostSpread.tsx.
export const isVideo = (p: Pick<Post, 'blogType'>) => p.blogType?.toLowerCase() === 'video'
