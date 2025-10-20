'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Film, BookOpen, StickyNote, Star, Calendar, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

interface Movie {
  id: string
  title: string
  type: string
  rating: number
  review: string
  posterUrl?: string
  watchDate: string
}

interface Blog {
  id: string
  title: string
  content: string
  imageUrl?: string
  publishDate: string
}

interface Note {
  id: string
  title: string
  content: string
  category?: string
  createdAt: string
}

export default function BentoGrid() {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [blog, setBlog] = useState<Blog | null>(null)
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/movies').then(res => res.json()),
      fetch('/api/blog').then(res => res.json()),
      fetch('/api/notes').then(res => res.json()),
    ])
      .then(([movies, blogs, notes]) => {
        setMovie(movies[0] || null)
        setBlog(blogs[0] || null)
        setNote(notes[0] || null)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching bento data:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
          <div className="rounded-3xl bg-white/10 dark:bg-black/10 backdrop-blur-lg animate-pulse" />
          <div className="grid grid-rows-2 gap-6">
            <div className="rounded-3xl bg-white/10 dark:bg-black/10 backdrop-blur-lg animate-pulse" />
            <div className="rounded-3xl bg-white/10 dark:bg-black/10 backdrop-blur-lg animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
        }`}
      />
    ))
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Featured Movie - Large Card */}
          {movie && (
            <Link href="/movies" className="block">
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="relative h-full min-h-[400px] lg:min-h-[500px] p-8 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 dark:from-purple-900/20 dark:to-blue-900/20 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-xl hover:shadow-purple-500/30 hover:border-purple-500/40 transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                {/* View More Arrow */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                {/* Background Image */}
                {movie.posterUrl && (
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Image
                      src={movie.posterUrl}
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Film className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      Recently Watched
                    </span>
                  </div>

                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    {movie.title}
                  </h3>

                  <div className="flex items-center gap-1 mb-4">
                    {renderStars(movie.rating)}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4 flex-grow line-clamp-6">
                    {movie.review}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(movie.watchDate), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          )}

          {/* Right Column - Note & Blog */}
          <div className="grid grid-rows-2 gap-6">
            {/* Recent Note - Compact */}
            {note && (
              <Link href="/notes" className="block">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="relative p-6 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 dark:from-yellow-900/20 dark:to-orange-900/20 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-xl hover:shadow-yellow-500/30 hover:border-yellow-500/40 transition-all duration-300 cursor-pointer group"
                >
                  {/* View More Arrow */}
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <StickyNote className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      Recent Note
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {note.title}
                  </h3>

                  <p className="text-gray-700 dark:text-gray-300 line-clamp-3 text-sm">
                    {note.content}
                  </p>

                  {note.category && (
                    <span className="inline-block mt-3 px-3 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 rounded-full">
                      {note.category}
                    </span>
                  )}
                </motion.div>
              </Link>
            )}

            {/* Latest Blog - Medium */}
            {blog && (
              <Link href="/blog" className="block">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="relative p-6 rounded-3xl bg-gradient-to-br from-green-500/20 to-teal-500/20 dark:from-green-900/20 dark:to-teal-900/20 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-xl hover:shadow-green-500/30 hover:border-green-500/40 transition-all duration-300 overflow-hidden cursor-pointer group"
                >
                  {/* View More Arrow */}
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <ArrowRight className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  {blog.imageUrl && (
                    <div className="absolute inset-0 opacity-10">
                      <Image
                        src={blog.imageUrl}
                        alt={blog.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        Latest Blog
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {blog.title}
                    </h3>

                    <p className="text-gray-700 dark:text-gray-300 line-clamp-3 text-sm mb-3">
                      {blog.content}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(blog.publishDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
