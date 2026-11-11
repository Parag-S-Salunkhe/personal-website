import Skeleton from '@/components/site/Skeleton'

export default function Loading() {
  return (
    <div className="min-h-[100dvh] bg-[var(--night)]">
      <Skeleton shape="poster" />
    </div>
  )
}
