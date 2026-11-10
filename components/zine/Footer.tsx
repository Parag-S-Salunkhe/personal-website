import Link from 'next/link'
import { Github, Linkedin } from '@/components/icons/Brand'
import { NAV, socials } from '@/lib/site'

export default function Footer() {
  return (
    <footer className="mt-16 bg-riso-blue text-paper">
      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="t-display text-[clamp(2rem,6vw,3rem)]">That&rsquo;s the zine.</p>
          <p className="t-hand mt-2 -rotate-1 text-3xl text-riso-yellow">take one for the road</p>
        </div>
        <div className="grid gap-4">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-4">
              <li><Link href="/" className="t-label inline-flex min-h-[44px] items-center text-lg underline decoration-riso-pink decoration-2 underline-offset-4 hover:text-riso-yellow">Home</Link></li>
              {NAV.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="t-label inline-flex min-h-[44px] items-center text-lg underline decoration-riso-pink decoration-2 underline-offset-4 hover:text-riso-yellow">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="flex flex-wrap gap-x-4">
            <li>
              <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="t-label inline-flex min-h-[44px] items-center gap-2 text-lg hover:text-riso-yellow">
                <Linkedin className="h-5 w-5" /> LinkedIn
              </a>
            </li>
            <li>
              <a href={socials.github} target="_blank" rel="noopener noreferrer" className="t-label inline-flex min-h-[44px] items-center gap-2 text-lg hover:text-riso-yellow">
                <Github className="h-5 w-5" /> GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
