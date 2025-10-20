'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, X } from 'lucide-react'

interface Message {
  id: string
  message: string
  emoji?: string
  createdAt: string
}

export default function GuestbookBubbles() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/guestbook')
      const data = await res.json()
      
      // Filter messages from last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentMessages = data.filter((msg: Message) => 
        new Date(msg.createdAt) > oneDayAgo
      )
      
      setMessages(recentMessages.slice(0, 5)) // Limit to 5 messages
    } catch (error) {
      console.error('Error fetching guestbook:', error)
    }
  }

  if (messages.length === 0) return null

  return (
    <div 
      className="fixed bottom-6 right-6 z-40 hidden lg:block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Collapsed Widget */}
      {!isExpanded && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsExpanded(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-300"
        >
          <MessageSquare className="w-6 h-6" />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
              {messages.length}
            </span>
          )}
        </motion.button>
      )}

      {/* Expanded Widget */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-80 max-h-96 bg-white/90 dark:bg-black/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 dark:border-white/20 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Recent Messages</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 0.7, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl flex items-start gap-2 hover:opacity-100 transition-opacity"
              >
                {message.emoji && (
                  <span className="text-xl flex-shrink-0">{message.emoji}</span>
                )}
                <p className="text-sm text-gray-800 dark:text-gray-200 flex-1">
                  {message.message}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
