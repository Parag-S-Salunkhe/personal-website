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
    <div>
      <div>
        <div className="mb-8">
          <h1 className="t-display mis text-4xl md:text-5xl mb-2">
            Blog
          </h1>
          <p className="text-riso-blue">
            Manage your blog posts and articles
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search blog posts..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="field"
          />
          <button
            onClick={handleAddNew}
            className="btn"
          >
            <span>+</span> Write New Post
          </button>
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => handleFilter('ALL')}
            className={`t-label min-h-[44px] border-2 border-riso-blue px-4 text-lg transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-riso-yellow text-ink'
                : 'bg-slip text-riso-blue hover:bg-riso-yellow hover:text-ink'
            }`}
          >
            All ({posts.length})
          </button>
          {['Tutorial', 'Personal', 'Tech', 'Travel', 'Review', 'Other'].map((type) => (
            <button
              key={type}
              onClick={() => handleFilter(type)}
              className={`t-label min-h-[44px] border-2 border-riso-blue px-4 text-lg transition-colors ${
                activeFilter === type
                  ? 'bg-riso-yellow text-ink'
                  : 'bg-slip text-riso-blue hover:bg-riso-yellow hover:text-ink'
              }`}
            >
              {type} ({posts.filter(p => p.blogType === type).length})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-b-2 border-riso-blue mx-auto"></div>
            <p className="mt-4 text-riso-blue">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-slip border-2 border-dashed border-riso-blue/40">
            <p className="text-riso-blue text-lg">
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
          <div className="bg-slip border-2 border-riso-blue overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dashed divide-riso-blue/40">
                <thead className="bg-paper border-b-2 border-riso-blue">
                  <tr>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Featured Image
                    </th>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Publish Date
                    </th>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slip divide-y divide-dashed divide-riso-blue/40">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-riso-yellow transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        {post.imageUrl ? (
                          <img src={post.imageUrl} alt={post.title} className="w-16 h-16 object-cover" />
                        ) : (
                          <div className="w-16 h-16 bg-paper flex items-center justify-center text-2xl">
                            📝
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="t-label text-base text-ink max-w-md truncate">
                          {post.title}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="border border-riso-blue px-2 py-0.5 text-sm text-riso-blue">
                          {post.blogType || 'Other'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-riso-blue">
                        {new Date(post.publishDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(post)}
                          className="inline-flex min-h-[44px] items-center px-3 mr-2 t-label text-lg text-riso-blue hover:bg-riso-yellow hover:text-ink"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
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

        {isFormOpen && (
          <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
            <div className="bg-slip border-2 border-riso-blue max-w-3xl w-full max-h-[90dvh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="t-title text-2xl text-ink">
                    {editingPost ? 'Edit Post' : 'Write New Post'}
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-2xl text-riso-blue hover:bg-riso-yellow hover:text-ink"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder="Enter post title"
                    />
                  </div>
                  
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Content *
                    </label>
                    <textarea
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={12}
                      className="field"
                      placeholder="Write your blog post content here..."
                    />
                  </div>
                  
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Blog Type *
                    </label>
                    <select
                      value={formData.blogType}
                      onChange={(e) => setFormData({ ...formData, blogType: e.target.value })}
                      className="field"
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
                    <label className="block t-label text-base text-ink mb-1">
                      Featured Image URL (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="field"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="mt-1 text-sm text-riso-blue">Right-click on any image → Copy Image Address</p>
                  </div>
                  
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Publish Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.publishDate}
                      onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                      className="field"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="btn flex-1"
                    >
                      {editingPost ? 'Update Post' : 'Publish Post'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-6 py-3 border border-riso-blue text-ink
                                 hover:bg-riso-yellow transition-colors"
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
