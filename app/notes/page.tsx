'use client'

import { useState, useEffect } from 'react'

interface Note {
  id: string
  title: string
  content: string
  category: string | null
  createdAt: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notes')
      const data = await response.json()
      console.log('Notes API response:', data)
      setNotes(data.notes || [])
      setFilteredNotes(data.notes || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    applyFilters()
  }, [searchQuery, activeFilter, notes])

  const applyFilters = () => {
    let filtered = [...notes]
    
    if (activeFilter !== 'ALL') {
      filtered = filtered.filter(note => note.category === activeFilter)
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
            📔 Notes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ideas, thoughts, and reminders
          </p>
        </div>
        
        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Category Filters */}
        <div className="flex gap-3 justify-center mb-8 flex-wrap">
          {['ALL', 'Work', 'Personal', 'Ideas', 'Todo', 'Other'].map(cat => (
            <button
              key={cat}
              onClick={() => handleFilter(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors
                          ${activeFilter === cat
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
            >
              {cat === 'ALL' ? `All (${notes.length})` : `${cat} (${notes.filter(n => n.category === cat).length})`}
            </button>
          ))}
        </div>
        
        {/* Debug Info */}
        <div className="text-center mb-4 text-sm text-gray-500">
          Total notes: {notes.length}, Filtered: {filteredNotes.length}
        </div>
        
        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {searchQuery ? `No notes found matching "${searchQuery}"` : 'No notes yet'}
            </p>
          </div>
        ) : (
          /* Notes Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md hover:shadow-xl
                           transform hover:-translate-y-1 transition-all duration-300
                           border-l-4 border-blue-500 cursor-pointer"
              >
                {/* Category Badge */}
                {note.category && (
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3
                                 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {note.category}
                  </span>
                )}
                
                {/* Title */}
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                  {note.title}
                </h3>
                
                {/* Content - with line clamp */}
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3 text-sm line-clamp-6">
                  {note.content}
                </p>
                
                {/* Date */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {new Date(note.createdAt).toLocaleDateString()}
                </p>
                
                {/* Click to expand hint */}
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Click to read full note →
                </p>
              </div>
            ))}
          </div>
        )}
        
        {/* Modal for Full Note */}
        {selectedNote && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedNote(null)}
          >
            <div 
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedNote(null)}
                className="float-right text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
              
              {/* Category Badge */}
              {selectedNote.category && (
                <span className="inline-block px-4 py-2 rounded-full mb-4
                               bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-semibold">
                  {selectedNote.category}
                </span>
              )}
              
              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 clear-both">
                {selectedNote.title}
              </h2>
              
              {/* Date */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {new Date(selectedNote.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              
              {/* Full Content - PRESERVE LINE BREAKS */}
              <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {selectedNote.content}
              </div>
              
              {/* Close Button at Bottom */}
              <button
                onClick={() => setSelectedNote(null)}
                className="mt-8 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg
                           transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
