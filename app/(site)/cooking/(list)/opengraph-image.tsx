import { ogContentType, ogSize, zineImage } from '@/lib/og'

export const alt = "Cooking in Parag's zine"
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return zineImage({ kicker: "From the kitchen", title: 'Cooking', scribble: "clippings, grease spots and all" })
}
