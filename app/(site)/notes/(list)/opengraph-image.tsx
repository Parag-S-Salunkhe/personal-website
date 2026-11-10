import { ogContentType, ogSize, zineImage } from '@/lib/og'

export const alt = "Notes in Parag's zine"
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return zineImage({ kicker: "Scraps from my pockets", title: 'Notes', scribble: "short notes and lists" })
}
