export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.paragsalunkhe.me').replace(/\/+$/, '')
export const siteName = 'Parag Salunkhe'
export const socials = {
  linkedin: 'https://www.linkedin.com/in/parag-salunkhe',
  github: 'https://github.com/Parag-S-Salunkhe',
}

export const NAV = [
  { label: 'Movies', href: '/movies' },
  { label: 'Cooking', href: '/cooking' },
  { label: 'Blog', href: '/blog' },
  { label: 'Notes', href: '/notes' },
  { label: 'Projects', href: '/projects' },
] as const
