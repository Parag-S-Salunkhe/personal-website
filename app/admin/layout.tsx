'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Film, 
  ChefHat, 
  BookOpen, 
  Code, 
  StickyNote, 
  Activity,
  ArrowLeft,
  LogOut
} from 'lucide-react'

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/movies', label: 'Movies', icon: Film },
  { href: '/admin/cooking', label: 'Cooking', icon: ChefHat },
  { href: '/admin/blog', label: 'Blog', icon: BookOpen },
  { href: '/admin/projects', label: 'Projects', icon: Code },
  { href: '/admin/notes', label: 'Notes', icon: StickyNote },
  { href: '/admin/health', label: 'Health data', icon: Activity },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    }
  }

  const linkClass = (isActive: boolean) =>
    `t-label flex min-h-[44px] shrink-0 items-center gap-2 px-3 text-lg whitespace-nowrap transition-colors ${
      isActive
        ? 'bg-riso-yellow text-ink underline decoration-riso-pink decoration-[3px] underline-offset-[6px]'
        : 'text-riso-blue hover:bg-riso-yellow hover:text-ink'
    }`

  const logoutClass =
    't-label flex min-h-[44px] shrink-0 items-center gap-2 border-2 border-riso-red px-3 text-lg text-riso-red transition-colors hover:bg-riso-red hover:text-paper'

  return (
    <div className="zine flex min-h-[100dvh] flex-col md:flex-row">
      {/* Top bar (mobile) and sidebar (md and up) */}
      <aside className="flex flex-col border-b-2 border-riso-blue bg-slip md:sticky md:top-0 md:h-[100dvh] md:w-60 md:shrink-0 md:border-b-0 md:border-r-2">
        {/* Title */}
        <div className="flex items-center justify-between gap-3 px-4 pt-3 md:block md:border-b-2 md:border-riso-blue md:p-6">
          <p className="t-title whitespace-nowrap text-xl text-riso-blue md:text-2xl">Office copy</p>
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/" className={linkClass(false)}>
              <ArrowLeft className="h-4 w-4" />
              <span>View site</span>
            </Link>
            <button onClick={handleLogout} className={logoutClass}>
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Admin"
          className="scroller flex gap-1 overflow-x-auto p-2 md:flex-1 md:flex-col md:overflow-visible md:p-4"
        >
          {adminLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={linkClass(isActive)}
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Back to site and log out (md and up) */}
        <div className="hidden space-y-2 border-t-2 border-riso-blue p-4 md:block">
          <Link href="/" className={linkClass(false)}>
            <ArrowLeft className="h-4 w-4" />
            <span>View site</span>
          </Link>

          <button onClick={handleLogout} className={`${logoutClass} w-full`}>
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
