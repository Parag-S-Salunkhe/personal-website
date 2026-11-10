import Link from 'next/link'
import { prisma } from '@/lib/prisma'

interface BlogPost {
  id: string
  title: string
  content: string
  imageUrl: string | null
  blogType: string | null
  publishDate: string
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const blog = await prisma.blog.findUnique({
  where: { id: params.id }
})

if (!blog) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0F0F14]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Blog Post Not Found</h1>
        <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to Blog
        </Link>
      </div>
    </div>
  )
}
  
  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F14] py-16">
      <article className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-8"
          >
            ← Back to all posts
          </Link>
          
          {blog.blogType && (
            <span className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 
                           text-blue-800 dark:text-blue-300 text-sm font-semibold mb-4">
              {blog.blogType}
            </span>
          )}
          
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {blog.title}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400">
            {new Date(blog.publishDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        
        {/* Featured Image */}
        {blog.imageUrl && (
          <img
            src={blog.imageUrl}
            alt={blog.title}
            className="w-full h-96 object-cover rounded-2xl mb-12"
          />
        )}
        
        {/* Content - Preserve line breaks */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap text-lg">
            {blog.content}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            ← Back to all posts
          </Link>
        </div>
      </article>
    </div>
  )
}
