'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, ChefHat, Code, Film, HeartPulse, StickyNote, type LucideIcon } from 'lucide-react'

const TYPE_ICON: Record<string, LucideIcon> = { movie: Film, cooking: ChefHat, blog: BookOpen, project: Code, note: StickyNote }

interface ActivityItem {
  id: string
  type: 'movie' | 'cooking' | 'blog' | 'project' | 'note'
  title: string
  createdAt: string
  icon: string
  color: string
  link: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    movies: 0,
    cooking: 0,
    blog: 0,
    projects: 0,
    notes: 0,
    health: 0,
  })
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)


  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Fetch all content types
      const [moviesRes, cookingRes, blogRes, projectsRes, notesRes, healthRes] = await Promise.all([
        fetch('/api/movies'),
        fetch('/api/cooking'),
        fetch('/api/blog'),
        fetch('/api/projects'),
        fetch('/api/notes'),
        fetch('/api/health').catch(() => ({ ok: false })), // Health might not exist yet
      ])

      const movies = moviesRes.ok ? await moviesRes.json() : { movies: [] }
      const cooking = cookingRes.ok ? await cookingRes.json() : { dishes: [] }
      const blog = blogRes.ok ? await blogRes.json() : { posts: [] }
      const projects = projectsRes.ok ? await projectsRes.json() : { projects: [] }
      const notes = notesRes.ok ? await notesRes.json() : { notes: [] }
      const health = (healthRes as Response).ok ? await (healthRes as Response).json() : { data: [] }

      // Update stats
      setStats({
        movies: movies.movies?.length || 0,
        cooking: cooking.dishes?.length || 0,
        blog: blog.posts?.length || 0,
        projects: projects.projects?.length || 0,
        notes: notes.notes?.length || 0,
        health: health.data?.length || 0,
      })

      // Combine all activities
      const activities: ActivityItem[] = [
        ...(movies.movies || []).map((m: any) => ({
          id: m.id,
          type: 'movie' as const,
          title: m.title,
          createdAt: m.createdAt,
          icon: '🎬',
          color: 'border border-riso-blue bg-paper',
          link: '/admin/movies',
        })),
        ...(cooking.dishes || []).map((c: any) => ({
          id: c.id,
          type: 'cooking' as const,
          title: c.dishName,
          createdAt: c.createdAt,
          icon: '🍳',
          color: 'border border-riso-blue bg-paper',
          link: '/admin/cooking',
        })),
        ...(blog.posts || []).map((b: any) => ({
          id: b.id,
          type: 'blog' as const,
          title: b.title,
          createdAt: b.createdAt,
          icon: '📝',
          color: 'border border-riso-blue bg-paper',
          link: '/admin/blog',
        })),
        ...(projects.projects || []).map((p: any) => ({
          id: p.id,
          type: 'project' as const,
          title: p.title,
          createdAt: p.createdAt,
          icon: '💼',
          color: 'border border-riso-blue bg-paper',
          link: '/admin/projects',
        })),
        ...(notes.notes || []).map((n: any) => ({
          id: n.id,
          type: 'note' as const,
          title: n.title,
          createdAt: n.createdAt,
          icon: '📔',
          color: 'border border-riso-blue bg-paper',
          link: '/admin/notes',
        })),
      ]

      // Sort by most recent and take top 10
      const sorted = activities
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)

      setRecentActivity(sorted)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="t-display mis text-4xl md:text-5xl mb-2">
          Dashboard
        </h1>
        <p className="text-riso-blue">
          Overview of your content
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-12 w-12 border-b-2 border-riso-blue"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {/* Movies */}
            <Link href="/admin/movies">
              <div className="bg-slip p-4 sm:p-6 cursor-pointer border-2 border-riso-blue hover:bg-riso-yellow transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Film className="h-8 w-8" aria-hidden="true" />
                  <span className="t-label text-sm text-riso-blue">
                    Movies
                  </span>
                </div>
                <div className="t-display nums text-4xl text-ink">
                  {stats.movies}
                </div>
                <div className="text-sm text-riso-blue mt-1">
                  Total watched
                </div>
              </div>
            </Link>

            {/* Cooking */}
            <Link href="/admin/cooking">
              <div className="bg-slip p-4 sm:p-6 cursor-pointer border-2 border-riso-blue hover:bg-riso-yellow transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <ChefHat className="h-8 w-8" aria-hidden="true" />
                  <span className="t-label text-sm text-riso-blue">
                    Cooking
                  </span>
                </div>
                <div className="t-display nums text-4xl text-ink">
                  {stats.cooking}
                </div>
                <div className="text-sm text-riso-blue mt-1">
                  Dishes made
                </div>
              </div>
            </Link>

            {/* Blog */}
            <Link href="/admin/blog">
              <div className="bg-slip p-4 sm:p-6 cursor-pointer border-2 border-riso-blue hover:bg-riso-yellow transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="h-8 w-8" aria-hidden="true" />
                  <span className="t-label text-sm text-riso-blue">
                    Blog
                  </span>
                </div>
                <div className="t-display nums text-4xl text-ink">
                  {stats.blog}
                </div>
                <div className="text-sm text-riso-blue mt-1">
                  Posts written
                </div>
              </div>
            </Link>

            {/* Projects */}
            <Link href="/admin/projects">
              <div className="bg-slip p-4 sm:p-6 cursor-pointer border-2 border-riso-blue hover:bg-riso-yellow transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Code className="h-8 w-8" aria-hidden="true" />
                  <span className="t-label text-sm text-riso-blue">
                    Projects
                  </span>
                </div>
                <div className="t-display nums text-4xl text-ink">
                  {stats.projects}
                </div>
                <div className="text-sm text-riso-blue mt-1">
                  Total projects
                </div>
              </div>
            </Link>

            {/* Notes */}
            <Link href="/admin/notes">
              <div className="bg-slip p-4 sm:p-6 cursor-pointer border-2 border-riso-blue hover:bg-riso-yellow transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <StickyNote className="h-8 w-8" aria-hidden="true" />
                  <span className="t-label text-sm text-riso-blue">
                    Notes
                  </span>
                </div>
                <div className="t-display nums text-4xl text-ink">
                  {stats.notes}
                </div>
                <div className="text-sm text-riso-blue mt-1">
                  Quick notes
                </div>
              </div>
            </Link>

            {/* Health */}
            <Link href="/admin/health">
              <div className="bg-slip p-4 sm:p-6 cursor-pointer border-2 border-riso-blue hover:bg-riso-yellow transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <HeartPulse className="h-8 w-8" aria-hidden="true" />
                  <span className="t-label text-sm text-riso-blue">
                    Health
                  </span>
                </div>
                <div className="t-display nums text-4xl text-ink">
                  {stats.health}
                </div>
                <div className="text-sm text-riso-blue mt-1">
                  Data entries
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-slip border-2 border-riso-blue p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="t-title text-2xl text-ink">
                Recent Activity
              </h2>
              <button
                onClick={fetchDashboardData}
                className="t-label text-sm ink-link min-h-[44px] px-2"
              >
                Refresh
              </button>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-12 text-riso-blue">
                <div className="text-5xl mb-4">📭</div>
                <p>No activity yet. Start creating content!</p>
              </div>
            ) : (
              <div className="divide-y divide-dashed divide-riso-blue/40">
                {recentActivity.map((activity) => (
                  <Link key={activity.id} href={activity.link}>
                    <div className="flex items-start gap-4 p-4 min-h-[44px] hover:bg-riso-yellow transition-colors cursor-pointer group">
                      {/* Icon */}
                      <div
                        className={`${activity.color} w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0`}
                      >
                        {(() => { const Icon = TYPE_ICON[activity.type]; return Icon ? <Icon className="h-6 w-6" aria-hidden="true" /> : null })()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="t-label text-sm text-riso-blue">
                            {activity.type}
                          </span>
                          <span className="nums text-sm text-riso-blue">
                            {getTimeAgo(activity.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-ink truncate group-hover:text-ink transition-colors">
                          {activity.title}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="text-riso-blue/70 group-hover:text-ink">
                        →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
