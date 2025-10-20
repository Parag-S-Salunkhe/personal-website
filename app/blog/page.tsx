'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface BlogPost {
  id: string
  title: string
  content: string
  imageUrl: string | null
  blogType: string | null
  publishDate: string
}

export default function BlogPage() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/blog')
      const data = await response.json()
      console.log('Blog API response:', data)
      setBlogs(data.posts || [])
      setFilteredBlogs(data.posts || [])
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    applyFilters()
  }, [searchQuery, activeFilter, blogs])

  const applyFilters = () => {
    let filtered = [...blogs]
    
    if (activeFilter !== 'ALL') {
      filtered = filtered.filter(blog => blog.blogType === activeFilter)
    }
    
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    setFilteredBlogs(filtered)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilter = (filterType: string) => {
    setActiveFilter(filterType)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F14] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            📝 Blog
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Thoughts, experiences, and lessons learned
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-3 justify-center mb-8 flex-wrap">
          {['ALL', 'Tutorial', 'Personal', 'Tech', 'Travel', 'Review', 'Other'].map(type => (
            <button
              key={type}
              onClick={() => handleFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors
                          ${activeFilter === type 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
            >
              {type === 'ALL' ? `All (${blogs.length})` : `${type} (${blogs.filter(b => b.blogType === type).length})`}
            </button>
          ))}
        </div>
        
        {/* Debug Info */}
        <div className="text-center mb-4 text-sm text-gray-500">
          Total blogs: {blogs.length}, Filtered: {filteredBlogs.length}
        </div>
        
        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading articles...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No posts found' : 'No blog posts yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? `No results for "${searchQuery}". Try a different search.` 
                : 'Start writing your first blog post!'}
            </p>
          </div>
        ) : (
          /* Blog Grid - Narrower cards with 3D effect */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1400px] mx-auto">
            {filteredBlogs.map((blog, index) => {
              // Calculate reading time (rough estimate: 200 words per minute)
              const wordCount = blog.content.split(' ').length
              const readingTime = Math.ceil(wordCount / 200)
              
              return (
                <article
                  key={blog.id}
                  onClick={() => router.push(`/blog/${blog.id}`)}
                  className="group cursor-pointer relative"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards',
                    perspective: '1000px'
                  }}
                >
                  {/* 3D Card Container */}
                  <div
                    className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
                               rounded-xl overflow-hidden shadow-lg
                               border border-amber-100/50 dark:border-amber-900/20
                               flex flex-col h-full"
                    style={{
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.320, 1), box-shadow 0.3s ease'
                    }}
                    onMouseMove={(e) => {
                      const card = e.currentTarget
                      const rect = card.getBoundingClientRect()
                      const x = e.clientX - rect.left
                      const y = e.clientY - rect.top
                      const centerX = rect.width / 2
                      const centerY = rect.height / 2
                      const rotateX = (y - centerY) / 20
                      const rotateY = (centerX - x) / 20

                      card.style.transform = `
                        perspective(1000px) 
                        rotateX(${rotateX}deg) 
                        rotateY(${rotateY}deg) 
                        scale3d(1.05, 1.05, 1.05)
                      `
                      card.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'
                      e.currentTarget.style.boxShadow = ''
                    }}
                  >
                    {/* Shine Effect Overlay */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none group-hover:translate-x-[200%]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
                        transform: 'translateX(-100%)',
                        transition: 'transform 0.6s ease',
                      }}
                    />
                    
                    {/* Image Section */}
                    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20">
                      {blog.imageUrl ? (
                        <>
                          <img
                            src={blog.imageUrl}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-5xl opacity-30">📝</span>
                        </div>
                      )}
                      
                      {/* Blog Type Badge */}
                      {blog.blogType && (
                        <span className="absolute top-2 left-2 px-2.5 py-1 text-xs font-bold rounded-full
                                       bg-amber-500/90 backdrop-blur-sm text-white shadow-lg">
                          {blog.blogType}
                        </span>
                      )}
                      
                      {/* Reading Time */}
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full
                                    bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                        <span>📖</span>
                        <span>{readingTime} min</span>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-4 flex flex-col flex-grow">
                      {/* Date */}
                      <div className="flex items-center gap-1 mb-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>📅</span>
                        <time>
                          {new Date(blog.publishDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </time>
                      </div>
                      
                      {/* Title */}
                      <h2 className="text-base font-bold mb-2 text-gray-900 dark:text-white line-clamp-2
                                   group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors
                                   leading-tight">
                        {blog.title}
                      </h2>
                      
                      {/* Excerpt */}
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-3 flex-grow leading-relaxed">
                        {blog.content.substring(0, 100)}...
                      </p>
                      
                      {/* Read More CTA */}
                      <div className="flex items-center justify-end text-amber-600 dark:text-amber-400 text-sm font-semibold
                                    transform group-hover:translate-x-1 transition-transform duration-300">
                        Read More
                        <span className="ml-1">→</span>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
