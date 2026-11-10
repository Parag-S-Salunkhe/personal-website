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
    <div>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="t-display mis text-4xl md:text-5xl mb-2">
            Cooking
          </h1>
          <p className="text-riso-blue">
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
            className="field"
          />
          <button
            onClick={handleAddNew}
            className="btn"
          >
            <span aria-hidden="true">+</span> Add new dish
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => handleFilter('ALL')}
            className={`t-label min-h-[44px] border-2 border-riso-blue px-4 text-lg transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-riso-yellow text-ink'
                : 'bg-slip text-riso-blue hover:bg-riso-yellow hover:text-ink'
            }`}
          >
            All ({dishes.length})
          </button>
          {['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks'].map((category) => (
            <button
              key={category}
              onClick={() => handleFilter(category)}
              className={`t-label min-h-[44px] border-2 border-riso-blue px-4 text-lg transition-colors ${
                activeFilter === category
                  ? 'bg-riso-yellow text-ink'
                  : 'bg-slip text-riso-blue hover:bg-riso-yellow hover:text-ink'
              }`}
            >
              {category} ({dishes.filter(d => d.category === category).length})
            </button>
          ))}
        </div>

        {/* Dishes Table/Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-b-2 border-riso-blue mx-auto"></div>
            <p className="mt-4 text-riso-blue">Loading dishes...</p>
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="text-center py-12 bg-slip border-2 border-dashed border-riso-blue/40">
            <p className="text-riso-blue text-lg">
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
          <div className="bg-slip border-2 border-riso-blue overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dashed divide-riso-blue/40">
                <thead className="bg-paper border-b-2 border-riso-blue">
                  <tr>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Image
                    </th>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Dish Name
                    </th>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Rating
                    </th>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Cook Date
                    </th>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slip divide-y divide-dashed divide-riso-blue/40">
                  {filteredDishes.map((dish) => (
                    <tr key={dish.id} className="hover:bg-riso-yellow transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        {dish.imageUrl ? (
                          <img src={dish.imageUrl} alt={dish.dishName} className="w-16 h-16 object-cover" />
                        ) : (
                          <div className="w-16 h-16 bg-paper flex items-center justify-center text-2xl">
                            🍽️
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="t-label text-base text-ink">
                          {dish.dishName}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="border border-riso-blue px-2 py-0.5 text-sm text-riso-blue">
                          {dish.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-riso-pink">{'★'.repeat(dish.rating)}</span>
                          <span className="text-riso-blue/30">{'★'.repeat(5 - dish.rating)}</span>
                          <span className="ml-2 text-sm text-riso-blue">{dish.rating}/5</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-riso-blue">
                        {new Date(dish.cookDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(dish)}
                          className="inline-flex min-h-[44px] items-center px-3 mr-2 t-label text-lg text-riso-blue hover:bg-riso-yellow hover:text-ink"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(dish.id, dish.dishName)}
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
                    {editingDish ? 'Edit Dish' : 'Add New Dish'}
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-2xl text-riso-blue hover:bg-riso-yellow hover:text-ink"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Dish Name */}
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Dish Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.dishName}
                      onChange={(e) => setFormData({ ...formData, dishName: e.target.value })}
                      className="field"
                      placeholder="e.g., Spaghetti Carbonara"
                    />
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="field"
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
                      placeholder="How did it turn out? Any tips?"
                    />
                  </div>
                  
                  {/* Ingredients */}
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Ingredients (optional, comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.ingredients}
                      onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                      className="field"
                      placeholder="e.g., pasta, eggs, bacon (leave empty if you prefer)"
                    />
                  </div>
                  
                  {/* Image URL */}
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Image URL (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="field"
                      placeholder="https://example.com/dish.jpg"
                    />
                    <p className="mt-1 text-sm text-riso-blue">Right-click on any image → Copy Image Address</p>
                  </div>
                  
                  {/* Video URL */}
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Video URL (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      className="field"
                      placeholder="YouTube or Instagram link"
                    />
                  </div>
                  
                  {/* Cook Date */}
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Cook Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.cookDate}
                      onChange={(e) => setFormData({ ...formData, cookDate: e.target.value })}
                      className="field"
                    />
                  </div>
                  
                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="btn flex-1"
                    >
                      {editingDish ? 'Update Dish' : 'Add Dish'}
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
