import type { Metadata } from 'next'
import NotFoundBody from '@/components/zine/NotFoundBody'

export const metadata: Metadata = { title: 'Page not found', robots: { index: false, follow: true } }

// notFound() from a (site) page (a bad movie, dish, post or note slug) lands here, inside the site layout.
export default function NotFound() {
  return <NotFoundBody />
}
