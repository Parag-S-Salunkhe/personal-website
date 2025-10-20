import Link from 'next/link'

// Fetch and display latest movie
async function RecentMoviePreview() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/movies`, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    })
    const data = await response.json()
    const movies = data.movies || []
    const movie = movies[0]

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
  } catch (error) {
    return null
  }
}

// Fetch and display latest dish
async function RecentCookingPreview() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/cooking`, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    })
    const data = await response.json()
    const dishes = data.dishes || []
    const dish = dishes[0]

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
  } catch (error) {
    return null
  }
}

// Fetch and display latest blog post
async function RecentBlogPreview() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/blog`, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    })
    const data = await response.json()
    const posts = data.posts || []
    const post = posts[0]

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
  } catch (error) {
    return null
  }
}

// Fetch and display latest project
async function RecentProjectPreview() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/projects`, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    })
    const data = await response.json()
    const projects = data.projects || []
    const project = projects[0]

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
                <span 
                  key={tech} 
                  className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded font-mono"
                >
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
  } catch (error) {
    return null
  }
}

// Fetch and display latest note
async function RecentNotePreview() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notes`, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    })
    const data = await response.json()
    const notes = data.notes || []
    const note = notes[0]

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
  } catch (error) {
    return null
  }
}

// Main component that renders all previews
export default async function RecentContentPreviews() {
  return (
    <div className="max-w-7xl mx-auto px-6 mb-20">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
        Recent Updates
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RecentMoviePreview />
        <RecentCookingPreview />
        <RecentBlogPreview />
        <RecentProjectPreview />
        <RecentNotePreview />
      </div>
    </div>
  )
}
