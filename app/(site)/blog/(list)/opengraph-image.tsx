import { ogContentType, ogSize, zineImage } from '@/lib/og'

export const alt = "Blog in Parag's zine"
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return zineImage({ kicker: "Things I wrote down", title: 'Blog', scribble: "the longer pieces" })
}
