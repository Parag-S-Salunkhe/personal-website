'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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

  useEffect(() => {
    fetchDashboardData()
  }, [])

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
          color: 'bg-red-500',
          link: '/admin/movies',
        })),
        ...(cooking.dishes || []).map((c: any) => ({
          id: c.id,
          type: 'cooking' as const,
          title: c.dishName,
          createdAt: c.createdAt,
          icon: '🍳',
          color: 'bg-orange-500',
          link: '/admin/cooking',
        })),
        ...(blog.posts || []).map((b: any) => ({
          id: b.id,
          type: 'blog' as const,
          title: b.title,
          createdAt: b.createdAt,
          icon: '📝',
          color: 'bg-purple-500',
          link: '/admin/blog',
        })),
        ...(projects.projects || []).map((p: any) => ({
          id: p.id,
          type: 'project' as const,
          title: p.title,
          createdAt: p.createdAt,
          icon: '💼',
          color: 'bg-green-500',
          link: '/admin/projects',
        })),
        ...(notes.notes || []).map((n: any) => ({
          id: n.id,
          type: 'note' as const,
          title: n.title,
          createdAt: n.createdAt,
          icon: '📔',
          color: 'bg-blue-500',
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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your content
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            {/* Movies */}
            <Link href="/admin/movies">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer border-l-4 border-red-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">🎬</span>
                  <span className="text-xs font-semibold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                    Movies
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.movies}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Total watched
                </div>
              </div>
            </Link>

            {/* Cooking */}
            <Link href="/admin/cooking">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer border-l-4 border-orange-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">🍳</span>
                  <span className="text-xs font-semibold text-orange-500 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                    Cooking
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.cooking}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Dishes made
                </div>
              </div>
            </Link>

            {/* Blog */}
            <Link href="/admin/blog">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">📝</span>
                  <span className="text-xs font-semibold text-purple-500 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                    Blog
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.blog}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Posts written
                </div>
              </div>
            </Link>

            {/* Projects */}
            <Link href="/admin/projects">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">💼</span>
                  <span className="text-xs font-semibold text-green-500 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                    Projects
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.projects}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Total projects
                </div>
              </div>
            </Link>

            {/* Notes */}
            <Link href="/admin/notes">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">📔</span>
                  <span className="text-xs font-semibold text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                    Notes
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.notes}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Quick notes
                </div>
              </div>
            </Link>

            {/* Health */}
            <Link href="/admin/health">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer border-l-4 border-pink-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">❤️</span>
                  <span className="text-xs font-semibold text-pink-500 bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded-full">
                    Health
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.health}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Data entries
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
              <button
                onClick={fetchDashboardData}
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                Refresh
              </button>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-5xl mb-4">📭</div>
                <p>No activity yet. Start creating content!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <Link key={activity.id} href={activity.link}>
                    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                      {/* Icon */}
                      <div
                        className={`${activity.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform`}
                      >
                        {activity.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                            {activity.type}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {getTimeAgo(activity.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {activity.title}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all">
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
