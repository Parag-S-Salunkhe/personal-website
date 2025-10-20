const TMDB_API_KEY = process.env.TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

export interface TMDBSearchResult {
  id: number
  title?: string
  name?: string
  media_type: 'movie' | 'tv'
  poster_path?: string
  overview?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
}

export interface MovieData {
  id: number
  title: string
  type: 'MOVIE' | 'SERIES'
  posterUrl: string | null
  overview: string
  releaseDate: string
  rating: number
}

export async function searchMovies(query: string): Promise<MovieData[]> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured')
  }

  const response = await fetch(
    `${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
  )

  if (!response.ok) {
    throw new Error('Failed to search movies')
  }

  const data = await response.json()
  
  return data.results
    .filter((item: TMDBSearchResult) => item.media_type === 'movie' || item.media_type === 'tv')
    .map((item: TMDBSearchResult) => ({
      id: item.id,
      title: item.title || item.name || 'Unknown',
      type: item.media_type === 'tv' ? 'SERIES' : 'MOVIE',
      posterUrl: item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
        : null,
      overview: item.overview || '',
      releaseDate: item.release_date || item.first_air_date || '',
      rating: item.vote_average ? Math.round(item.vote_average / 2) : 0, // Convert to 5-star scale
    }))
}

export async function getMovieDetails(id: number, type: 'movie' | 'tv') {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured')
  }

  const response = await fetch(
    `${BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch movie details')
  }

  return await response.json()
}
