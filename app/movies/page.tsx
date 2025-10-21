'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, Star, Calendar, X, Tv } from 'lucide-react'
import Image from 'next/image'
import SearchBar from '@/components/shared/SearchBar'
import FilterButtons from '@/components/shared/FilterButtons'

interface Movie {
  id: string
  title: string
  type: string
  rating: number
  review: string
  watchDate: string
  posterUrl: string | null
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'title'>('date')

  useEffect(() => {
    fetchMovies()
  }, [])

  useEffect(() => {
    filterAndSortMovies()
  }, [movies, searchQuery, activeFilter, sortBy])

  const fetchMovies = async () => {
    try {
      const res = await fetch('/api/movies')
      const data = await res.json()
      setMovies(data.movies || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching movies:', error)
      setLoading(false)
    }
  }

  const filterAndSortMovies = () => {
    let filtered = movies

    // Filter by type
    if (activeFilter !== 'All') {
      // Map filter button labels to database enum values
      const filterMap: { [key: string]: string } = {
        'Movies': 'MOVIE',
        'Series': 'SERIES'
      }
      const dbFilterValue = filterMap[activeFilter] || activeFilter.toUpperCase()
      
      filtered = filtered.filter(movie => movie.type === dbFilterValue)
      
      // Debug logging
      console.log('Active filter:', activeFilter)
      console.log('DB filter value:', dbFilterValue)
      console.log('All movies:', movies.map(m => ({ title: m.title, type: m.type })))
      console.log('Filtered movies:', filtered.map(m => ({ title: m.title, type: m.type })))
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.review.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.watchDate).getTime() - new Date(a.watchDate).getTime()
      } else if (sortBy === 'rating') {
        return b.rating - a.rating
      } else {
        return a.title.localeCompare(b.title)
      }
    })

    setFilteredMovies(sorted)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Film className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Cinema <span className="text-red-600">Collection</span>
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-400">
            My personal reviews and ratings of movies and series
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <SearchBar
              placeholder="Search movies & series..."
              onSearch={setSearchQuery}
              theme="default"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 rounded-lg border border-gray-700 bg-gray-900 text-white focus:ring-2 focus:ring-red-600 focus:border-transparent"
            >
              <option value="date">Date Watched</option>
              <option value="rating">Rating</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
          <div className="flex justify-center">
            <FilterButtons
              options={['All', 'Movies', 'Series']}
              active={activeFilter}
              onSelect={setActiveFilter}
              theme="movies"
            />
          </div>
        </motion.div>

        {/* Movies Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-400">Loading cinema collection...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Film className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              {searchQuery || activeFilter !== 'All' ? 'No results found' : 'No movies yet!'}
            </h3>
            <p className="text-gray-400">
              {searchQuery || activeFilter !== 'All' 
                ? 'Try adjusting your search or filters' 
                : 'Check back soon for movie reviews and ratings!'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredMovies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedMovie(movie)}
                className="group cursor-pointer bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-red-600 hover:shadow-2xl hover:shadow-red-600/20 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Poster */}
                <div className="relative h-96 overflow-hidden">
                  {movie.posterUrl ? (
                    <Image
                      src={movie.posterUrl}
                      alt={movie.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <Film className="w-20 h-20 text-gray-700" />
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  
                  {/* Type badge */}
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 px-3 py-1 bg-red-600/90 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                      {movie.type === 'MOVIE' ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                      {movie.type === 'MOVIE' ? 'Movie' : 'Series'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-red-600 transition-colors line-clamp-1">
                    {movie.title}
                  </h3>

                  {/* Rating */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= movie.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review preview */}
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {movie.review}
                  </p>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-800">
                    <Calendar className="w-3 h-3" />
                    {new Date(movie.watchDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMovie(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedMovie(null)}
                className="absolute top-4 right-4 p-2 bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-gray-700 transition-colors z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Poster */}
              {selectedMovie.posterUrl && (
                <div className="relative h-96 w-full">
                  <Image
                    src={selectedMovie.posterUrl}
                    alt={selectedMovie.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className="p-8 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-white">
                      {selectedMovie.title}
                    </h2>
                    <span className="flex items-center gap-1 px-3 py-1 bg-red-600/20 text-red-400 text-sm font-medium rounded-full">
                      {selectedMovie.type === 'MOVIE' ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                      {selectedMovie.type === 'MOVIE' ? 'Movie' : 'Series'}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= selectedMovie.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Watched on {new Date(selectedMovie.watchDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                {/* Review */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">My Review</h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedMovie.review}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
