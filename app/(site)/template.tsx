import Dim from '@/components/site/Dim'

// Page transition: the room lights come back up over the new page (an overlay fades; the page itself
// never moves, so position: fixed and ScrollTrigger measurements stay correct).
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Dim />
      {children}
    </>
  )
}
