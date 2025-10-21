'use client'

import { useState, useEffect } from 'react'

interface Movie {
  id: string
  title: string
  type: 'MOVIE' | 'SERIES'
  rating: number
  review: string
  posterUrl: string | null
  watchDate: string
  createdAt: string
}

interface FormData {
  title: string
  type: 'MOVIE' | 'SERIES'
  rating: number
  review: string
  posterUrl: string
  watchDate: string
}

export default function MoviesAdminPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    type: 'MOVIE',
    rating: 5,
    review: '',
    posterUrl: '',
    watchDate: new Date().toISOString().split('T')[0]
  })
  
  // TMDB Search states
  const [tmdbSearch, setTmdbSearch] = useState('')
  const [tmdbResults, setTmdbResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Fetch all movies on page load
  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/movies')
      const data = await response.json()
      setMovies(data.movies || [])
      applyFilters(searchQuery, activeFilter, data.movies || [])
    } catch (error) {
      console.error('Error fetching movies:', error)
      alert('Error fetching movies')
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters (search + type)
  const applyFilters = (searchQuery: string, filterType: string, moviesList = movies) => {
    let filtered = [...moviesList]
    
    // Apply type filter
    if (filterType !== 'ALL') {
      filtered = filtered.filter(movie => movie.type === filterType)
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    setFilteredMovies(filtered)
  }

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    applyFilters(query, activeFilter)
  }

  // Filter functionality
  const handleFilter = (filterType: string) => {
    setActiveFilter(filterType)
    applyFilters(searchQuery, filterType)
  }

  // Add new movie
  const handleAddNew = () => {
    setEditingMovie(null)
    setFormData({
      title: '',
      type: 'MOVIE',
      rating: 5,
      review: '',
      posterUrl: '',
      watchDate: new Date().toISOString().split('T')[0]
    })
    setIsFormOpen(true)
  }

  // Edit movie
  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie)
    setFormData({
      title: movie.title,
      type: movie.type,
      rating: movie.rating,
      review: movie.review,
      posterUrl: movie.posterUrl || '',
      watchDate: new Date(movie.watchDate).toISOString().split('T')[0]
    })
    setIsFormOpen(true)
  }

  // Save movie (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingMovie) {
        // UPDATE existing movie
        const response = await fetch(`/api/movies/${editingMovie.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        if (response.ok) {
          alert('Movie updated successfully!')
          fetchMovies()
          setIsFormOpen(false)
        } else {
          alert('Error updating movie')
        }
      } else {
        // CREATE new movie
        const response = await fetch('/api/movies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        if (response.ok) {
          alert('Movie added successfully!')
          fetchMovies()
          setIsFormOpen(false)
        } else {
          alert('Error adding movie')
        }
      }
    } catch (error) {
      alert('Error saving movie: ' + (error as Error).message)
    }
  }

  // TMDB Search with debouncing
  const searchTMDB = async (query: string) => {
    setTmdbSearch(query)
    
    if (query.length < 2) {
      setTmdbResults([])
      return
    }
    
    setIsSearching(true)
    try {
      const response = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setTmdbResults(data)
    } catch (error) {
      console.error('Search error:', error)
      setTmdbResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const selectMovie = (movie: any) => {
    setFormData({
      ...formData,
      title: movie.title,
      type: movie.type,
      posterUrl: movie.posterUrl || '',
      rating: movie.rating || 5,
    })
    setTmdbSearch('')
    setTmdbResults([])
  }

  // Delete movie
  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const response = await fetch(`/api/movies/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          alert('Movie deleted successfully!')
          fetchMovies()
        } else {
          alert('Error deleting movie')
        }
      } catch (error) {
        alert('Error deleting movie: ' + (error as Error).message)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F14] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🎬 Movies Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your movie and series collection
          </p>
        </div>

        {/* Search Bar + Add Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg
                       transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>+</span> Add New Movie
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => handleFilter('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All ({movies.length})
          </button>
          <button
            onClick={() => handleFilter('MOVIE')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'MOVIE'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Movies ({movies.filter(m => m.type === 'MOVIE').length})
          </button>
          <button
            onClick={() => handleFilter('SERIES')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'SERIES'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Series ({movies.filter(m => m.type === 'SERIES').length})
          </button>
        </div>

        {/* Movies Table/Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading movies...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {searchQuery && activeFilter !== 'ALL' 
                ? `No ${activeFilter === 'MOVIE' ? 'movies' : 'series'} found matching "${searchQuery}".` 
                : searchQuery
                ? `No movies found matching "${searchQuery}".` 
                : activeFilter !== 'ALL'
                ? `No ${activeFilter === 'MOVIE' ? 'movies' : 'series'} yet.` 
                : 'No movies yet. Add your first movie!'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Poster
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Watch Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredMovies.map((movie) => (
                    <tr key={movie.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {movie.posterUrl ? (
                          <img src={movie.posterUrl} alt={movie.title} className="w-12 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-2xl">
                            🎬
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {movie.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          movie.type === 'MOVIE' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {movie.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-yellow-400">{'★'.repeat(movie.rating)}</span>
                          <span className="text-gray-300 dark:text-gray-600">{'★'.repeat(5 - movie.rating)}</span>
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{movie.rating}/5</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(movie.watchDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(movie)}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(movie.id, movie.title)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingMovie ? 'Edit Movie' : 'Add New Movie'}
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* TMDB Search */}
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      🎬 Search TMDB (Optional)
                    </label>
                    <input
                      type="text"
                      value={tmdbSearch}
                      onChange={(e) => searchTMDB(e.target.value)}
                      placeholder="Search for a movie or TV series..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    {isSearching && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Searching TMDB...
                      </p>
                    )}
                    
                    {tmdbResults.length > 0 && (
                      <div className="mt-3 max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        {tmdbResults.map((movie) => (
                          <button
                            key={movie.id}
                            type="button"
                            onClick={() => selectMovie(movie)}
                            className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 
                                     text-left border-b border-gray-200 dark:border-gray-700 
                                     last:border-b-0 transition-colors flex gap-3"
                          >
                            {movie.posterUrl && (
                              <img 
                                src={movie.posterUrl} 
                                alt={movie.title} 
                                className="w-12 h-16 object-cover rounded flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 dark:text-white mb-1">
                                {movie.title}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                {movie.type} • {movie.releaseDate?.substring(0, 4) || 'Unknown'}
                                {movie.rating && ` • ⭐ ${movie.rating}/5`}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {movie.overview}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {tmdbSearch.length >= 2 && !isSearching && tmdbResults.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        No results found. Try a different search term.
                      </p>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter movie or series title"
                    />
                  </div>
                  
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'MOVIE' | 'SERIES' })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="MOVIE">Movie</option>
                      <option value="SERIES">Series</option>
                    </select>
                  </div>
                  
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rating: {formData.rating}/5
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className={`text-3xl transition-colors ${
                            star <= formData.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Review */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Review *
                    </label>
                    <textarea
                      required
                      value={formData.review}
                      onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Share your thoughts about this movie..."
                    />
                  </div>
                  
                  {/* Poster URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Poster URL (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.posterUrl}
                      onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com/poster.jpg"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Right-click on any image → Copy Image Address → Paste here
                    </p>
                  </div>
                  
                  {/* Watch Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Watch Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.watchDate}
                      onChange={(e) => setFormData({ ...formData, watchDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg
                                 transition-colors"
                    >
                      {editingMovie ? 'Update Movie' : 'Add Movie'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800
                                 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
