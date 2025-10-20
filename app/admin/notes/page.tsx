'use client'

import { useState, useEffect } from 'react'

interface Note {
  id: string
  title: string
  content: string
  category: string | null
  createdAt: string
  updatedAt: string
}

interface FormData {
  title: string
  content: string
  category: string
}

export default function NotesAdminPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    category: 'Personal'
  })

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notes')
      const data = await response.json()
      setNotes(data.notes || [])
      applyFilters(searchQuery, activeFilter, data.notes || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
      alert('Error fetching notes')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = (searchQuery: string, filterType: string, notesList = notes) => {
    let filtered = [...notesList]
    
    if (filterType !== 'ALL') {
      filtered = filtered.filter(note => note.category === filterType)
    }
    
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    setFilteredNotes(filtered)
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
    setEditingNote(null)
    setFormData({
      title: '',
      content: '',
      category: 'Personal'
    })
    setIsFormOpen(true)
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category || 'Personal'
    })
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      title: formData.title,
      content: formData.content,
      category: formData.category
    }
    
    console.log('Submitting payload:', payload)
    
    try {
      if (editingNote) {
        const response = await fetch(`/api/notes/${editingNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update note')
        }
        
        alert('Note updated successfully!')
        fetchNotes()
        setIsFormOpen(false)
      } else {
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create note')
        }
        
        alert('Note created successfully!')
        fetchNotes()
        setIsFormOpen(false)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Error saving note: ' + (error as Error).message)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const response = await fetch(`/api/notes/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          alert('Note deleted successfully!')
          fetchNotes()
        } else {
          alert('Error deleting note')
        }
      } catch (error) {
        alert('Error deleting note: ' + (error as Error).message)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F14] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📔 Notes Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your personal notes and ideas
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg
                       transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>+</span> Quick Add Note
          </button>
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => handleFilter('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All ({notes.length})
          </button>
          {['Work', 'Personal', 'Ideas', 'Todo', 'Other'].map((category) => (
            <button
              key={category}
              onClick={() => handleFilter(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category} ({notes.filter(n => n.category === category).length})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {searchQuery && activeFilter !== 'ALL' 
                ? `No ${activeFilter.toLowerCase()} notes found matching "${searchQuery}".` 
                : searchQuery
                ? `No notes found matching "${searchQuery}".` 
                : activeFilter !== 'ALL'
                ? `No ${activeFilter.toLowerCase()} notes yet.` 
                : 'No notes yet. Add your first note!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {note.title}
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 whitespace-nowrap ml-2">
                    {note.category || 'Other'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                  {note.content}
                </p>
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(note)}
                      className="text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note.id, note.title)}
                      className="text-sm text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingNote ? 'Edit Note' : 'Add New Note'}
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
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Note title"
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
                      rows={8}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Write your note here..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Ideas">Ideas</option>
                      <option value="Todo">Todo</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg
                                 transition-colors"
                    >
                      {editingNote ? 'Update Note' : 'Save Note'}
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
