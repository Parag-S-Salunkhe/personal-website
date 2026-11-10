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

  useEffect(() => {
    fetchNotes()
  }, [])

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
    <div>
      <div>
        <div className="mb-8">
          <h1 className="t-display mis text-4xl md:text-5xl mb-2">
            Notes
          </h1>
          <p className="text-riso-blue">
            Manage your personal notes and ideas
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="field"
          />
          <button
            onClick={handleAddNew}
            className="btn"
          >
            <span>+</span> Quick Add Note
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
            All ({notes.length})
          </button>
          {['Work', 'Personal', 'Ideas', 'Todo', 'Other'].map((category) => (
            <button
              key={category}
              onClick={() => handleFilter(category)}
              className={`t-label min-h-[44px] border-2 border-riso-blue px-4 text-lg transition-colors ${
                activeFilter === category
                  ? 'bg-riso-yellow text-ink'
                  : 'bg-slip text-riso-blue hover:bg-riso-yellow hover:text-ink'
              }`}
            >
              {category} ({notes.filter(n => n.category === category).length})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-b-2 border-riso-blue mx-auto"></div>
            <p className="mt-4 text-riso-blue">Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12 bg-slip border-2 border-dashed border-riso-blue/40">
            <p className="text-riso-blue text-lg">
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
                className="bg-slip p-5 border-2 border-riso-blue"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="t-title text-lg text-ink line-clamp-1">
                    {note.title}
                  </h3>
                  <span className="border border-riso-blue px-2 py-0.5 text-sm text-riso-blue whitespace-nowrap ml-2">
                    {note.category || 'Other'}
                  </span>
                </div>
                
                <p className="text-sm text-riso-blue line-clamp-3 mb-4">
                  {note.content}
                </p>
                
                <div className="flex justify-between items-center pt-3 border-t border-riso-blue">
                  <span className="text-sm text-riso-blue">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(note)}
                      className="inline-flex min-h-[44px] items-center px-3 t-label text-lg text-riso-blue hover:bg-riso-yellow hover:text-ink"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note.id, note.title)}
                      className="inline-flex min-h-[44px] items-center px-3 t-label text-lg border-2 border-riso-red text-riso-red hover:bg-riso-red hover:text-paper"
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
          <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
            <div className="bg-slip border-2 border-riso-blue max-w-2xl w-full max-h-[90dvh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="t-title text-2xl text-ink">
                    {editingNote ? 'Edit Note' : 'Add New Note'}
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
                      placeholder="Note title"
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
                      rows={8}
                      className="field"
                      placeholder="Write your note here..."
                    />
                  </div>
                  
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="field"
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
                      className="btn flex-1"
                    >
                      {editingNote ? 'Update Note' : 'Save Note'}
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
