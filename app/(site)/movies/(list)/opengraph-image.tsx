import { ogContentType, ogSize, zineImage } from '@/lib/og'

export const alt = "Movies in Parag's zine"
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return zineImage({ kicker: "From movie night", title: 'Movies', scribble: "what was on the projector" })
}
