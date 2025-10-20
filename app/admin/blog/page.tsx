'use client'

import { useState, useEffect } from 'react'

interface BlogPost {
  id: string
  title: string
  content: string
  imageUrl: string | null
  blogType: string | null
  publishDate: string
  createdAt: string
  updatedAt: string
}

interface FormData {
  title: string
  content: string
  imageUrl: string
  blogType: string
  publishDate: string
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    imageUrl: '',
    blogType: 'Personal',
    publishDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/blog')
      const data = await response.json()
      setPosts(data.posts || [])
      applyFilters(searchQuery, activeFilter, data.posts || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      alert('Error fetching blog posts')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = (searchQuery: string, filterType: string, postsList = posts) => {
    let filtered = [...postsList]
    
    if (filterType !== 'ALL') {
      filtered = filtered.filter(post => post.blogType === filterType)
    }
    
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    setFilteredPosts(filtered)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    applyFilters(query, activeFilter)
  }

  const handleFilter = (filterType: string) => {
    setActiveFilter(filterType)
    applyFilters(searchQuery, filterType)
  }

  const handleAddNew = () => {
    setEditingPost(null)
    setFormData({
      title: '',
      content: '',
      imageUrl: '',
      blogType: 'Personal',
      publishDate: new Date().toISOString().split('T')[0]
    })
    setIsFormOpen(true)
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl || '',
      blogType: post.blogType || 'Personal',
      publishDate: new Date(post.publishDate).toISOString().split('T')[0]
    })
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      title: formData.title,
      content: formData.content,
      imageUrl: formData.imageUrl.trim() || null,
      blogType: formData.blogType,
      publishDate: formData.publishDate
    }
    
    console.log('Submitting payload:', payload)
    
    try {
      if (editingPost) {
        const response = await fetch(`/api/blog/${editingPost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update post')
        }
        
        alert('Post updated successfully!')
        fetchPosts()
        setIsFormOpen(false)
      } else {
        const response = await fetch('/api/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create post')
        }
        
        alert('Post created successfully!')
        fetchPosts()
        setIsFormOpen(false)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Error saving post: ' + (error as Error).message)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const response = await fetch(`/api/blog/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          alert('Post deleted successfully!')
          fetchPosts()
        } else {
          alert('Error deleting post')
        }
      } catch (error) {
        alert('Error deleting post: ' + (error as Error).message)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F14] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📝 Blog Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your blog posts and articles
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search blog posts..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg
                       transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>+</span> Write New Post
          </button>
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => handleFilter('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All ({posts.length})
          </button>
          {['Tutorial', 'Personal', 'Tech', 'Travel', 'Review', 'Other'].map((type) => (
            <button
              key={type}
              onClick={() => handleFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {type} ({posts.filter(p => p.blogType === type).length})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {searchQuery && activeFilter !== 'ALL' 
                ? `No ${activeFilter.toLowerCase()} posts found matching "${searchQuery}".` 
                : searchQuery
                ? `No posts found matching "${searchQuery}".` 
                : activeFilter !== 'ALL'
                ? `No ${activeFilter.toLowerCase()} posts yet.` 
                : 'No blog posts yet. Write your first post!'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Featured Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Publish Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {post.imageUrl ? (
                          <img src={post.imageUrl} alt={post.title} className="w-16 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded flex items-center justify-center text-2xl">
                            📝
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white max-w-md truncate">
                          {post.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          {post.blogType || 'Other'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(post.publishDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(post)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
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

        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingPost ? 'Edit Post' : 'Write New Post'}
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
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
                                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter post title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content *
                    </label>
                    <textarea
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={12}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Write your blog post content here..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Blog Type *
                    </label>
                    <select
                      value={formData.blogType}
                      onChange={(e) => setFormData({ ...formData, blogType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Tutorial">Tutorial</option>
                      <option value="Personal">Personal</option>
                      <option value="Tech">Tech</option>
                      <option value="Travel">Travel</option>
                      <option value="Review">Review</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Featured Image URL (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Right-click on any image → Copy Image Address</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Publish Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.publishDate}
                      onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg
                                 transition-colors"
                    >
                      {editingPost ? 'Update Post' : 'Publish Post'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300
                                 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
