'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Linkedin, Github, Mail, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import InteractiveCursor from '@/components/home/InteractiveCursor'
import CompactHealthChart from '@/components/home/CompactHealthChart'
import BentoGrid from '@/components/home/BentoGrid'
import ProjectsCarousel from '@/components/home/ProjectsCarousel'
import MoodGuestbookRow from '@/components/home/MoodGuestbookRow'
import GuestbookBubbles from '@/components/home/GuestbookBubbles'

export default function Home() {
  const [pageViews, setPageViews] = useState<number | null>(null)
  const [todaySteps, setTodaySteps] = useState<number>(0)
  const [todayCalories, setTodayCalories] = useState<number>(0)

  // Add state for recent content
  const [recentContent, setRecentContent] = useState<{
    movie: any
    cooking: any
    blog: any
    project: any
    note: any
  }>({
    movie: null,
    cooking: null,
    blog: null,
    project: null,
    note: null,
  })
  const [isLoadingRecent, setIsLoadingRecent] = useState(true)

  useEffect(() => {
    // Fetch and increment page views
    const updatePageViews = async () => {
      try {
        // Increment
        const res = await fetch('/api/pageviews', { method: 'POST' })
        const data = await res.json()
        setPageViews(data.count)
      } catch (error) {
        console.error('Error updating page views:', error)
      }
    }

    updatePageViews()
  }, [])

  // Fetch today's health data
  useEffect(() => {
    fetchTodayData()
  }, [])

  // Fetch recent content
  useEffect(() => {
    fetchRecentContent()
  }, [])

  const fetchTodayData = async () => {
    try {
      const response = await fetch('/api/health')
      const allData = await response.json()

      // Get today's date (start of day)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString().split('T')[0]

      // Find today's entry
      const todayEntry = allData.find((item: any) => {
        const itemDate = new Date(item.date).toISOString().split('T')[0]
        return itemDate === todayStr
      })

      if (todayEntry) {
        setTodaySteps(todayEntry.steps || 0)
        setTodayCalories(todayEntry.calories || 0)
      }
    } catch (error) {
      console.error('Error fetching today data:', error)
    }
  }

  const fetchRecentContent = async () => {
    setIsLoadingRecent(true)
    try {
      const [moviesRes, cookingRes, blogRes, projectsRes, notesRes] = await Promise.all([
        fetch('/api/movies').then(r => r.json()).catch(() => ({ movies: [] })),
        fetch('/api/cooking').then(r => r.json()).catch(() => ({ dishes: [] })),
        fetch('/api/blog').then(r => r.json()).catch(() => ({ posts: [] })),
        fetch('/api/projects').then(r => r.json()).catch(() => ({ projects: [] })),
        fetch('/api/notes').then(r => r.json()).catch(() => ({ notes: [] })),
      ])

      setRecentContent({
        movie: moviesRes.movies?.[0] || null,
        cooking: cookingRes.dishes?.[0] || null,
        blog: blogRes.posts?.[0] || null,
        project: projectsRes.projects?.[0] || null,
        note: notesRes.notes?.[0] || null,
      })
    } catch (error) {
      console.error('Error fetching recent content:', error)
    } finally {
      setIsLoadingRecent(false)
    }
  }

  const scrollToHealth = () => {
    document.getElementById('health-chart')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F14] transition-colors duration-500">
      {/* Interactive Cursor */}
      <InteractiveCursor />

      {/* Floating Guestbook Bubbles */}
      <GuestbookBubbles />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative py-12 sm:py-16 overflow-hidden bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-950/20 dark:to-[#0F0F14] transition-colors duration-300"
      >
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* LEFT COLUMN - Profile (30%) - Everything Centered */}
            <div className="w-full lg:w-[30%] flex-shrink-0 flex flex-col items-center space-y-4">
              {/* Profile Image - 280px with Glazing Effect */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="relative"
              >
                {/* Animated gradient border (rotating) */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full blur-sm opacity-75 animate-spin-slow"
                  style={{ backgroundSize: '200% 200%' }} />

                {/* Glazing border */}
                <div className="relative rounded-full p-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-gradient"
                  style={{ backgroundSize: '200% 200%' }}>
                  <div className="relative w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] md:w-[280px] md:h-[280px] rounded-full overflow-hidden bg-white dark:bg-gray-900">
                    <Image
                      src="/profile.jpg"
                      alt="Parag Salunkhe"
                      fill
                      className="object-cover relative z-10"
                      priority
                    />
                  </div>
                </div>
              </motion.div>

              {/* Name - Centered, One Line */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl sm:text-2xl font-bold tracking-tight text-center bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent"
              >
                Parag Salunkhe
              </motion.h1>

              {/* Role - Centered, Smaller */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-sm text-center text-gray-600 dark:text-gray-400"
              >
                Cloud Operations Engineer & DevOps Engineer
              </motion.p>

              {/* Social Icons - Centered */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-4 justify-center items-center"
              >
                <Link
                  href="https://www.linkedin.com/in/parag-salunkhe"
                  target="_blank"
                  className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                >
                  <Linkedin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </Link>
                <Link
                  href="https://github.com/Parag-S-Salunkhe"
                  target="_blank"
                  className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                >
                  <Github className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                </Link>
                <Link
                  href="mailto:paragsalunkhe28@gmail.com"
                  className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                >
                  <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </Link>
              </motion.div>

              {/* Visitor Counter - Centered */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-center text-sm text-purple-600 dark:text-purple-400 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span className="font-medium">
                  {pageViews !== null ? pageViews.toLocaleString() : '...'} visitors
                </span>
              </motion.div>
            </div>

            {/* RIGHT COLUMN - Bio Only (70%) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-1"
            >
              {/* Bio - Justified, No Name/Title Duplication */}
              <div className="max-w-2xl space-y-4 text-base leading-loose text-justify text-gray-700 dark:text-gray-300">
                <p>
                  I thrive on solving complex IT challenges and finding innovative, cost-effective solutions that make a real impact. Beyond the technical work, I love connecting with people whether it&apos;s collaborating with executives or helping clients navigate their onboarding journey.
                </p>
                <p>
                  Outside of work, you&apos;ll find me in the kitchen experimenting with new recipes (check out my cooking page to see what I&apos;ve been making!), binge-watching the latest series, or sitting in meditation trying to stay consistent with my practice.
                </p>
                <p>
                  I&apos;m constantly growing in my DevOps journey, carving out time each day to learn something new. But above all, I prioritize my fitness and health because it&apos;s the one thing that truly belongs to me.
                </p>
                <p className="mt-4">
                  Yesterday, I walked <span className="font-semibold text-purple-600 dark:text-purple-400">{todaySteps.toLocaleString()}</span> steps and burned <span className="font-semibold text-orange-600 dark:text-orange-400">{todayCalories.toLocaleString()}</span> calories.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Compact Health Chart */}
      <div id="health-chart" className="py-8">
        <CompactHealthChart />
      </div>

      {/* Bento Grid */}
      <div className="py-8">
        <BentoGrid />
      </div>

      {/* Projects Carousel */}
      <div className="py-8">
        <ProjectsCarousel />
      </div>

      {/* Recent Content Previews */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900 dark:text-white">
            Recent Updates
          </h2>

          {isLoadingRecent ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <RecentMovieCard movie={recentContent.movie} />
              <RecentCookingCard dish={recentContent.cooking} />
              <RecentBlogCard post={recentContent.blog} />
              <RecentProjectCard project={recentContent.project} />
              <RecentNoteCard note={recentContent.note} />
            </div>
          )}
        </div>
      </div>

      {/* Mood + Guestbook Row */}
      <div className="py-12 pb-20">
        <MoodGuestbookRow />
      </div>
    </div>
  )
}

// Recent content card components
function RecentMovieCard({ movie }: { movie: any }) {
  if (!movie) {
    return (
      <div className="bg-[#0a0a0a] dark:bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎬</span>
          <h3 className="text-lg font-bold text-white">Recently Watched</h3>
        </div>
        <p className="text-gray-400 text-sm">No movies yet</p>
      </div>
    )
  }

  return (
    <Link href="/movies" className="block group">
      <div className="bg-[#0a0a0a] dark:bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-red-600 transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20 transform hover:-translate-y-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎬</span>
          <h3 className="text-lg font-bold text-white">Recently Watched</h3>
        </div>

        <div className="flex gap-4">
          {movie.posterUrl && (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-20 h-28 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h4 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-red-500 transition-colors">
              {movie.title}
            </h4>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-1 bg-red-900/30 text-red-400 rounded">
                {movie.type}
              </span>
              <div className="flex text-yellow-400 text-xs">
                {'★'.repeat(movie.rating)}
              </div>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">
              {movie.review}
            </p>
          </div>
        </div>

        <div className="mt-4 text-red-500 text-sm flex items-center justify-end group-hover:translate-x-1 transition-transform">
          View All Movies →
        </div>
      </div>
    </Link>
  )
}

function RecentCookingCard({ dish }: { dish: any }) {
  if (!dish) {
    return (
      <div className="bg-orange-50 dark:bg-gray-900 rounded-xl p-6 border border-orange-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🍳</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recently Cooked</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">No dishes yet</p>
      </div>
    )
  }

  return (
    <Link href="/cooking" className="block group">
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 border border-orange-200 dark:border-gray-700 hover:border-orange-500 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 transform hover:-translate-y-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🍳</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recently Cooked</h3>
        </div>

        <div className="flex gap-4">
          {dish.imageUrl && (
            <img
              src={dish.imageUrl}
              alt={dish.dishName}
              className="w-20 h-20 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {dish.dishName}
            </h4>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-1 bg-orange-200 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded">
                {dish.category}
              </span>
              <div className="flex text-yellow-500 text-xs">
                {'★'.repeat(Math.floor(dish.rating))}
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
              {dish.review}
            </p>
          </div>
        </div>

        <div className="mt-4 text-orange-600 dark:text-orange-400 text-sm flex items-center justify-end group-hover:translate-x-1 transition-transform">
          View All Dishes →
        </div>
      </div>
    </Link>
  )
}

function RecentBlogCard({ post }: { post: any }) {
  if (!post) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📝</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Latest Post</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">No posts yet</p>
      </div>
    )
  }

  return (
    <Link href={`/blog/${post.id}`} className="block group">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 transform hover:-translate-y-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📝</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Latest Post</h3>
        </div>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-32 object-cover rounded-lg mb-4"
          />
        )}

        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {post.title}
          </h4>
          {post.blogType && (
            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded mb-2 inline-block">
              {post.blogType}
            </span>
          )}
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-2">
            {post.content.substring(0, 120)}...
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {new Date(post.publishDate).toLocaleDateString()}
          </p>
        </div>

        <div className="mt-4 text-purple-600 dark:text-purple-400 text-sm flex items-center justify-end group-hover:translate-x-1 transition-transform">
          Read More →
        </div>
      </div>
    </Link>
  )
}

function RecentProjectCard({ project }: { project: any }) {
  if (!project) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-green-900/30">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">💼</span>
          <h3 className="text-lg font-bold text-white">Recent Project</h3>
        </div>
        <p className="text-gray-400 text-sm">No projects yet</p>
      </div>
    )
  }

  return (
    <Link href="/projects" className="block group">
      <div className="bg-[#0d1117] rounded-xl p-6 border border-green-900/30 hover:border-green-500 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 transform hover:-translate-y-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">💼</span>
          <h3 className="text-lg font-bold text-white">Recent Project</h3>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3 line-clamp-2 group-hover:text-green-400 transition-colors">
            {project.title}
          </h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {project.techStack?.slice(0, 3).map((tech: string) => (
              <span key={tech} className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded font-mono">
                {tech}
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-sm line-clamp-3">
            {project.description}
          </p>
        </div>

        <div className="mt-4 text-green-400 text-sm flex items-center justify-end group-hover:translate-x-1 transition-transform">
          View All Projects →
        </div>
      </div>
    </Link>
  )
}

function RecentNoteCard({ note }: { note: any }) {
  if (!note) {
    return (
      <div className="bg-blue-50 dark:bg-gray-900 rounded-xl p-6 border border-blue-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📔</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Note</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">No notes yet</p>
      </div>
    )
  }

  return (
    <Link href="/notes" className="block group">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 border border-blue-200 dark:border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📔</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Note</h3>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {note.title}
          </h4>
          {note.category && (
            <span className="text-xs px-2 py-1 bg-blue-200 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded mb-2 inline-block">
              {note.category}
            </span>
          )}
          <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-4 whitespace-pre-wrap">
            {note.content}
          </p>
        </div>

        <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm flex items-center justify-end group-hover:translate-x-1 transition-transform">
          View All Notes →
        </div>
      </div>
    </Link>
  )
}
