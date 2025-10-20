'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

interface Blog {
  id: string
  title: string
  content: string
  imageUrl?: string
  publishDate: string
}

export default function LatestBlog() {
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/blog')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setBlog(data[0])
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching blog:', error)
        setError(true)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elegant-600"></div>
          </div>
        </div>
      </section>
    )
  }

  if (error || !blog) {
    return null
  }

  const contentPreview = blog.content.length > 150 
    ? blog.content.substring(0, 150) + '...' 
    : blog.content

  const formattedDate = format(new Date(blog.publishDate), 'MMMM dd, yyyy')

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="py-12 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold text-elegant-900">Latest from Blog</h2>
          <Link
            href="/blog"
            className="text-elegant-600 hover:text-elegant-900 transition-colors duration-300 font-medium flex items-center gap-2"
          >
            Read All Posts →
          </Link>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200">
          <div className="flex flex-col md:flex-row">
            {/* Blog Image */}
            <div className="relative w-full md:w-80 h-64 md:h-auto flex-shrink-0 bg-elegant-100">
              {blog.imageUrl ? (
                <Image
                  src={blog.imageUrl}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-elegant-400">
                  <span className="text-6xl">📝</span>
                </div>
              )}
            </div>

            {/* Blog Info */}
            <div className="p-8 flex-1">
              <div className="flex items-center gap-2 text-elegant-600 mb-4">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">{formattedDate}</span>
              </div>

              <h3 className="text-3xl font-bold text-elegant-900 mb-4 leading-tight">
                {blog.title}
              </h3>

              <p className="text-elegant-700 text-lg leading-relaxed mb-6">
                {contentPreview}
              </p>

              <Link
                href="/blog"
                className="inline-block px-6 py-3 bg-elegant-900 text-white font-semibold rounded-lg hover:bg-elegant-800 transition-colors duration-300"
              >
                Continue Reading
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
