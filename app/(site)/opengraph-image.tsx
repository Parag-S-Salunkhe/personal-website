import { ogContentType, ogSize, zineImage } from '@/lib/og'

export const alt = "Parag's zine: supper clubs, movie nights and home cooking"
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return zineImage({ kicker: 'Supper clubs, movie nights, home cooking', title: 'Pull up a chair.', scribble: 'the zine I hand people at the door' })
}
