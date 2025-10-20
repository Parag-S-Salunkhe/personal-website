'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface Movie {
  id: string
  title: string
  type: string
  rating: number
  review: string
  watchDate: string
  posterUrl?: string
}

export default function RecentlyWatched() {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/movies')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setMovie(data[0])
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching movie:', error)
        setError(true)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <section className="py-12 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e50914]"></div>
          </div>
        </div>
      </section>
    )
  }

  if (error || !movie) {
    return null
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'fill-[#e50914] text-[#e50914]' : 'text-gray-600'
        }`}
      />
    ))
  }

  const reviewExcerpt = movie.review.length > 100 
    ? movie.review.substring(0, 100) + '...' 
    : movie.review

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-12 bg-[#0a0a0a]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold text-white">Recently Watched</h2>
          <Link
            href="/movies"
            className="text-[#e50914] hover:text-white transition-colors duration-300 font-medium flex items-center gap-2"
          >
            View All Movies →
          </Link>
        </div>

        <div className="bg-[#141414] rounded-2xl overflow-hidden shadow-2xl hover:shadow-[#e50914]/20 transition-all duration-300 border border-gray-800">
          <div className="flex flex-col md:flex-row">
            {/* Movie Poster */}
            <div className="relative w-full md:w-64 h-64 md:h-auto flex-shrink-0 bg-gray-900">
              {movie.posterUrl ? (
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <span className="text-6xl">🎬</span>
                </div>
              )}
            </div>

            {/* Movie Info */}
            <div className="p-8 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">{movie.title}</h3>
                  <span className="inline-block px-3 py-1 bg-[#e50914] text-white text-sm font-medium rounded-full">
                    {movie.type}
                  </span>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {renderStars(movie.rating)}
              </div>

              <p className="text-gray-300 text-lg leading-relaxed">
                {reviewExcerpt}
              </p>

              <div className="mt-6">
                <Link
                  href="/movies"
                  className="inline-block px-6 py-3 bg-[#e50914] text-white font-semibold rounded-lg hover:bg-[#b20710] transition-colors duration-300"
                >
                  Read Full Review
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
