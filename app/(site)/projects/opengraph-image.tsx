import { ogContentType, ogSize, zineImage } from '@/lib/og'

export const alt = "Projects in Parag's zine"
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return zineImage({ kicker: "On the workbench", title: 'Projects', scribble: "what I'm building between dinners" })
}
