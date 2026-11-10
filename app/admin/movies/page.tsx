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

  useEffect(() => {
    fetchMovies()
  }, [])

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
    <div>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="t-display mis text-4xl md:text-5xl mb-2">
            Movies
          </h1>
          <p className="text-riso-blue">
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
            className="field"
          />
          <button
            onClick={handleAddNew}
            className="btn"
          >
            <span aria-hidden="true">+</span> Add new movie
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => handleFilter('ALL')}
            className={`t-label min-h-[44px] border-2 border-riso-blue px-4 text-lg transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-riso-yellow text-ink'
                : 'bg-slip text-riso-blue hover:bg-riso-yellow hover:text-ink'
            }`}
          >
            All ({movies.length})
          </button>
          <button
            onClick={() => handleFilter('MOVIE')}
            className={`t-label min-h-[44px] border-2 border-riso-blue px-4 text-lg transition-colors ${
              activeFilter === 'MOVIE'
                ? 'bg-riso-yellow text-ink'
                : 'bg-slip text-riso-blue hover:bg-riso-yellow hover:text-ink'
            }`}
          >
            Movies ({movies.filter(m => m.type === 'MOVIE').length})
          </button>
          <button
            onClick={() => handleFilter('SERIES')}
            className={`t-label min-h-[44px] border-2 border-riso-blue px-4 text-lg transition-colors ${
              activeFilter === 'SERIES'
                ? 'bg-riso-yellow text-ink'
                : 'bg-slip text-riso-blue hover:bg-riso-yellow hover:text-ink'
            }`}
          >
            Series ({movies.filter(m => m.type === 'SERIES').length})
          </button>
        </div>

        {/* Movies Table/Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-b-2 border-riso-blue mx-auto"></div>
            <p className="mt-4 text-riso-blue">Loading movies...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-12 bg-slip border-2 border-dashed border-riso-blue/40">
            <p className="text-riso-blue text-lg">
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
          <div className="bg-slip border-2 border-riso-blue overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dashed divide-riso-blue/40">
                <thead className="bg-paper border-b-2 border-riso-blue">
                  <tr>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Poster
                    </th>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Rating
                    </th>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Watch Date
                    </th>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slip divide-y divide-dashed divide-riso-blue/40">
                  {filteredMovies.map((movie) => (
                    <tr key={movie.id} className="hover:bg-riso-yellow transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        {movie.posterUrl ? (
                          <img src={movie.posterUrl} alt={movie.title} className="w-12 h-16 object-cover" />
                        ) : (
                          <div className="w-12 h-16 bg-paper flex items-center justify-center text-2xl">
                            🎬
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="t-label text-base text-ink">
                          {movie.title}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-sm ${
                          movie.type === 'MOVIE' 
                            ? 'border border-riso-blue text-riso-blue'
                            : 'border border-riso-blue text-riso-blue'
                        }`}>
                          {movie.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-riso-pink">{'★'.repeat(movie.rating)}</span>
                          <span className="text-riso-blue/30">{'★'.repeat(5 - movie.rating)}</span>
                          <span className="ml-2 text-sm text-riso-blue">{movie.rating}/5</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-riso-blue">
                        {new Date(movie.watchDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(movie)}
                          className="inline-flex min-h-[44px] items-center px-3 mr-2 t-label text-lg text-riso-blue hover:bg-riso-yellow hover:text-ink"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(movie.id, movie.title)}
                          className="inline-flex min-h-[44px] items-center px-3 t-label text-lg border-2 border-riso-red text-riso-red hover:bg-riso-red hover:text-paper"
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
          <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
            <div className="bg-slip border-2 border-riso-blue max-w-2xl w-full max-h-[90dvh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="t-title text-2xl text-ink">
                    {editingMovie ? 'Edit Movie' : 'Add New Movie'}
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-2xl text-riso-blue hover:bg-riso-yellow hover:text-ink"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* TMDB Search */}
                  <div className="mb-6 p-4 bg-paper border border-riso-blue">
                    <label className="block t-label text-base text-ink mb-2">
                      🎬 Search TMDB (Optional)
                    </label>
                    <input
                      type="text"
                      value={tmdbSearch}
                      onChange={(e) => searchTMDB(e.target.value)}
                      placeholder="Search for a movie or TV series..."
                      className="field"
                    />
                    
                    {isSearching && (
                      <p className="text-sm text-riso-blue mt-2 flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Searching TMDB...
                      </p>
                    )}
                    
                    {tmdbResults.length > 0 && (
                      <div className="mt-3 max-h-80 overflow-y-auto border border-riso-blue bg-slip">
                        {tmdbResults.map((movie) => (
                          <button
                            key={movie.id}
                            type="button"
                            onClick={() => selectMovie(movie)}
                            className="w-full p-3 hover:bg-riso-yellow 
                                     text-left border-b border-riso-blue 
                                     last:border-b-0 transition-colors flex gap-3"
                          >
                            {movie.posterUrl && (
                              <img 
                                src={movie.posterUrl} 
                                alt={movie.title} 
                                className="w-12 h-16 object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-ink mb-1">
                                {movie.title}
                              </div>
                              <div className="text-sm text-riso-blue mb-1">
                                {movie.type} • {movie.releaseDate?.substring(0, 4) || 'Unknown'}
                                {movie.rating && ` • ⭐ ${movie.rating}/5`}
                              </div>
                              <div className="text-sm text-riso-blue line-clamp-2">
                                {movie.overview}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {tmdbSearch.length >= 2 && !isSearching && tmdbResults.length === 0 && (
                      <p className="text-sm text-riso-blue mt-2">
                        No results found. Try a different search term.
                      </p>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="field"
                      placeholder="Enter movie or series title"
                    />
                  </div>
                  
                  {/* Type */}
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'MOVIE' | 'SERIES' })}
                      className="field"
                    >
                      <option value="MOVIE">Movie</option>
                      <option value="SERIES">Series</option>
                    </select>
                  </div>
                  
                  {/* Rating */}
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Rating: {formData.rating}/5
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className={`text-3xl min-h-[44px] min-w-[44px] transition-colors ${
                            star <= formData.rating ? 'text-riso-pink' : 'text-riso-blue/30'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Review */}
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Review *
                    </label>
                    <textarea
                      required
                      value={formData.review}
                      onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                      rows={4}
                      className="field"
                      placeholder="Share your thoughts about this movie..."
                    />
                  </div>
                  
                  {/* Poster URL */}
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Poster URL (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.posterUrl}
                      onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                      className="field"
                      placeholder="https://example.com/poster.jpg"
                    />
                    <p className="mt-1 text-sm text-riso-blue">
                      Right-click on any image → Copy Image Address → Paste here
                    </p>
                  </div>
                  
                  {/* Watch Date */}
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Watch Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.watchDate}
                      onChange={(e) => setFormData({ ...formData, watchDate: e.target.value })}
                      className="field"
                    />
                  </div>
                  
                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="btn flex-1"
                    >
                      {editingMovie ? 'Update Movie' : 'Add Movie'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-6 py-3 border border-riso-blue hover:bg-riso-yellow
                                 text-ink font-medium transition-colors"
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
