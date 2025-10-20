'use client'

import { motion } from 'framer-motion'
import { Star, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface MovieCardProps {
  title: string
  type: string
  rating: number
  review: string
  watchDate: string
  posterUrl?: string
}

export default function MovieCard({ title, type, rating, review, watchDate, posterUrl }: MovieCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-cinema-bg border border-cinema-accent/20 rounded-lg overflow-hidden shadow-2xl hover:shadow-cinema-accent/20 transition-all"
    >
      <div className="relative h-64 bg-gradient-to-br from-cinema-accent/20 to-cinema-bg">
        {posterUrl ? (
          <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl">🎬</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-cinema-accent px-3 py-1 rounded-full">
          <span className="text-white text-sm font-bold">{type}</span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < rating ? 'text-cinema-gold fill-cinema-gold' : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(watchDate), 'MMM dd, yyyy')}</span>
          </div>
        </div>
        
        <p className="text-gray-300 leading-relaxed line-clamp-3">{review}</p>
      </div>
    </motion.div>
  )
}
