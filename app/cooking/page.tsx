'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChefHat, Star, X, Calendar, Tag } from 'lucide-react'
import Image from 'next/image'
import SearchBar from '@/components/shared/SearchBar'
import FilterButtons from '@/components/shared/FilterButtons'

interface Dish {
  id: string
  dishName: string
  category: string
  rating: number
  review: string
  imageUrl: string | null
  ingredients: string[]
  cookDate: string
}

const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Other']

export default function CookingPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)

  useEffect(() => {
    fetchDishes()
  }, [])

  useEffect(() => {
    filterDishes()
  }, [dishes, searchQuery, activeCategory])

  const fetchDishes = async () => {
    try {
      const res = await fetch('/api/cooking')
      const data = await res.json()
      setDishes(data.dishes || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dishes:', error)
      setLoading(false)
    }
  }

  const filterDishes = () => {
    let filtered = dishes

    // Filter by category
    if (activeCategory !== 'All') {
      filtered = filtered.filter(dish => dish.category === activeCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(dish =>
        dish.dishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.review.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredDishes(filtered)
  }

  // Calculate counts for each category
  const getCategoryCounts = () => {
    const counts: { [key: string]: number } = {
      'All': dishes.length
    }
    
    categories.forEach(category => {
      if (category !== 'All') {
        counts[category] = dishes.filter(dish => dish.category === category).length
      }
    })
    
    return counts
  }

  const categoryCounts = getCategoryCounts()

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-white dark:from-orange-950/10 dark:to-[#0F0F14] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="w-12 h-12 text-orange-600 dark:text-orange-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
              My Cooking Journey
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Dishes I've made and loved
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <div className="flex justify-center">
            <SearchBar
              placeholder="Search dishes..."
              onSearch={setSearchQuery}
              theme="cooking"
            />
          </div>
          <div className="flex justify-center">
            <FilterButtons
              options={categories}
              active={activeCategory}
              onSelect={setActiveCategory}
              theme="cooking"
              counts={categoryCounts}
            />
          </div>
        </motion.div>

        {/* Dishes Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading delicious dishes...</p>
          </div>
        ) : filteredDishes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <ChefHat className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {searchQuery || activeCategory !== 'All' ? 'No dishes found' : 'No dishes yet!'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || activeCategory !== 'All' 
                ? 'Try adjusting your search or filters' 
                : 'Check back soon for delicious recipes and cooking adventures!'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredDishes.map((dish, index) => (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedDish(dish)}
                className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-orange-200/50 dark:border-orange-800/30 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  {dish.imageUrl ? (
                    <Image
                      src={dish.imageUrl}
                      alt={dish.dishName}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <span className="text-8xl">🍽️</span>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Category badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-orange-600/90 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                      {dish.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {dish.dishName}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= dish.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {dish.rating}/5
                    </span>
                  </div>

                  {/* Review preview */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {dish.review}
                  </p>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-800">
                    <Calendar className="w-3 h-3" />
                    {new Date(dish.cookDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedDish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDish(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedDish(null)}
                className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-900 dark:text-white" />
              </button>

              {/* Image */}
              {selectedDish.imageUrl && (
                <div className="relative h-80 w-full">
                  <Image
                    src={selectedDish.imageUrl}
                    alt={selectedDish.dishName}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-8 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {selectedDish.dishName}
                    </h2>
                    <span className="px-3 py-1 bg-orange-500/10 text-orange-700 dark:text-orange-300 text-sm font-medium rounded-full">
                      {selectedDish.category}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 ${
                            star <= selectedDish.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {selectedDish.rating}/5
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Cooked on {new Date(selectedDish.cookDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                {/* Review */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Review</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedDish.review}
                  </p>
                </div>

                {/* Ingredients */}
                {selectedDish.ingredients.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Ingredients</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedDish.ingredients.map((ingredient, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 px-3 py-1 bg-orange-500/10 text-orange-700 dark:text-orange-300 text-sm rounded-full"
                        >
                          <Tag className="w-3 h-3" />
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
