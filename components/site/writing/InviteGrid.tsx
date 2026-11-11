'use client'
import { useRef } from 'react'
import type { Post } from '@/lib/content'
import InviteCard from './InviteCard'
import { useEntrance } from './useEntrance'
import './writing.css'

export default function InviteGrid({ posts }: { posts: Post[] }) {
  const ref = useRef<HTMLUListElement>(null)
  const pre = useEntrance(ref, 'deal')
  return (
    <>
      <noscript><style>{'.wr-pre-deal{opacity:1!important;transform:none!important}'}</style></noscript>
      <ul ref={ref} className="grid gap-x-10 gap-y-12 md:grid-cols-2">
        {posts.map((p) => (
          <li key={p.id} data-enter className={`pt-14 ${pre ? 'wr-pre-deal' : ''}`}>
            <InviteCard post={p} />
          </li>
        ))}
      </ul>
    </>
  )
}
