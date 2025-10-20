'use client'

import { useState, useEffect } from 'react'

interface Dish {
  id: string
  dishName: string
  category: string
  rating: number
  review: string
  imageUrl: string | null
  videoUrl: string | null
  ingredients: string[]
  cookDate: string
  createdAt: string
}

interface FormData {
  dishName: string
  category: string
  rating: number
  review: string
  imageUrl: string
  videoUrl: string
  ingredients: string
  cookDate: string
}

export default function CookingAdminPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [formData, setFormData] = useState<FormData>({
    dishName: '',
    category: 'Dinner',
    rating: 5,
    review: '',
    imageUrl: '',
    videoUrl: '',
    ingredients: '',
    cookDate: new Date().toISOString().split('T')[0]
  })

  // Fetch all dishes on page load
  useEffect(() => {
    fetchDishes()
  }, [])

  const fetchDishes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/cooking')
      const data = await response.json()
      setDishes(data.dishes || [])
      applyFilters(searchQuery, activeFilter, data.dishes || [])
    } catch (error) {
      console.error('Error fetching dishes:', error)
      alert('Error fetching dishes')
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters (search + category)
  const applyFilters = (searchQuery: string, filterType: string, dishesList = dishes) => {
    let filtered = [...dishesList]
    
    // Apply category filter
    if (filterType !== 'ALL') {
      filtered = filtered.filter(dish => dish.category === filterType)
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(dish =>
        dish.dishName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    setFilteredDishes(filtered)
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

  // Add new dish
  const handleAddNew = () => {
    setEditingDish(null)
    setFormData({
      dishName: '',
      category: 'Dinner',
      rating: 5,
      review: '',
      imageUrl: '',
      videoUrl: '',
      ingredients: '',
      cookDate: new Date().toISOString().split('T')[0]
    })
    setIsFormOpen(true)
  }

  // Edit dish
  const handleEdit = (dish: Dish) => {
    setEditingDish(dish)
    setFormData({
      dishName: dish.dishName,
      category: dish.category,
      rating: dish.rating,
      review: dish.review,
      imageUrl: dish.imageUrl || '',
      videoUrl: dish.videoUrl || '',
      ingredients: dish.ingredients?.join(', ') || '',
      cookDate: new Date(dish.cookDate).toISOString().split('T')[0]
    })
    setIsFormOpen(true)
  }

  // Submit form (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prepare payload
    const payload = {
      dishName: formData.dishName,
      category: formData.category,
      rating: formData.rating,
      review: formData.review,
      imageUrl: formData.imageUrl.trim() || null,
      videoUrl: formData.videoUrl.trim() || null,
      ingredients: formData.ingredients 
        ? formData.ingredients.split(',').map(i => i.trim()).filter(Boolean)
        : [],
      cookDate: formData.cookDate
    }
    
    try {
      if (editingDish) {
        // UPDATE
        const response = await fetch(`/api/cooking/${editingDish.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update dish')
        }
        
        alert('Dish updated successfully!')
        fetchDishes()
        setIsFormOpen(false)
      } else {
        // CREATE
        const response = await fetch('/api/cooking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to add dish')
        }
        
        alert('Dish added successfully!')
        fetchDishes()
        setIsFormOpen(false)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Error saving dish: ' + (error as Error).message)
    }
  }

  // Delete dish
  const handleDelete = async (id: string, dishName: string) => {
    if (confirm(`Are you sure you want to delete "${dishName}"?`)) {
      try {
        const response = await fetch(`/api/cooking/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          alert('Dish deleted successfully!')
          fetchDishes()
        } else {
          alert('Error deleting dish')
        }
      } catch (error) {
        alert('Error deleting dish: ' + (error as Error).message)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F14] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🍳 Cooking Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your culinary creations
          </p>
        </div>

        {/* Search Bar + Add Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg
                       transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>+</span> Add New Dish
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => handleFilter('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All ({dishes.length})
          </button>
          {['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks'].map((category) => (
            <button
              key={category}
              onClick={() => handleFilter(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === category
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category} ({dishes.filter(d => d.category === category).length})
            </button>
          ))}
        </div>

        {/* Dishes Table/Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dishes...</p>
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {searchQuery && activeFilter !== 'ALL' 
                ? `No ${activeFilter.toLowerCase()} dishes found matching "${searchQuery}".` 
                : searchQuery
                ? `No dishes found matching "${searchQuery}".` 
                : activeFilter !== 'ALL'
                ? `No ${activeFilter.toLowerCase()} dishes yet.` 
                : 'No dishes yet. Add your first dish!'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Dish Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cook Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredDishes.map((dish) => (
                    <tr key={dish.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {dish.imageUrl ? (
                          <img src={dish.imageUrl} alt={dish.dishName} className="w-16 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded flex items-center justify-center text-2xl">
                            🍽️
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {dish.dishName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                          {dish.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-yellow-400">{'★'.repeat(dish.rating)}</span>
                          <span className="text-gray-300 dark:text-gray-600">{'★'.repeat(5 - dish.rating)}</span>
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{dish.rating}/5</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(dish.cookDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(dish)}
                          className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(dish.id, dish.dishName)}
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
                    {editingDish ? 'Edit Dish' : 'Add New Dish'}
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Dish Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dish Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.dishName}
                      onChange={(e) => setFormData({ ...formData, dishName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., Spaghetti Carbonara"
                    />
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Snacks">Snacks</option>
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
                                 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="How did it turn out? Any tips?"
                    />
                  </div>
                  
                  {/* Ingredients */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ingredients (optional, comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.ingredients}
                      onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., pasta, eggs, bacon (leave empty if you prefer)"
                    />
                  </div>
                  
                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Image URL (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="https://example.com/dish.jpg"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Right-click on any image → Copy Image Address</p>
                  </div>
                  
                  {/* Video URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Video URL (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="YouTube or Instagram link"
                    />
                  </div>
                  
                  {/* Cook Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cook Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.cookDate}
                      onChange={(e) => setFormData({ ...formData, cookDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg
                                 transition-colors"
                    >
                      {editingDish ? 'Update Dish' : 'Add Dish'}
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
