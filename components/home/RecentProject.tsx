'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Terminal } from 'lucide-react'
import { motion } from 'framer-motion'

interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  projectUrl?: string
  githubUrl?: string
  imageUrl?: string
  createdAt: string
}

export default function RecentProject() {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setProject(data[0])
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching project:', error)
        setError(true)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <section className="py-12 bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ff41]"></div>
          </div>
        </div>
      </section>
    )
  }

  if (error || !project) {
    return null
  }

  const descriptionPreview = project.description.length > 120 
    ? project.description.substring(0, 120) + '...' 
    : project.description

  const techColors = [
    'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'bg-green-500/20 text-green-400 border-green-500/30',
    'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="py-12 bg-[#0d1117]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Terminal className="w-8 h-8 text-[#00ff41]" />
            <h2 className="text-4xl font-bold text-white">Recent Project</h2>
          </div>
          <Link
            href="/projects"
            className="text-[#00ff41] hover:text-white transition-colors duration-300 font-medium flex items-center gap-2"
          >
            View All Projects →
          </Link>
        </div>

        <div className="bg-[#161b22] rounded-2xl overflow-hidden shadow-2xl hover:shadow-[#00ff41]/10 transition-all duration-300 border border-[#30363d] p-8">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#30363d]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="ml-4 text-gray-400 font-mono text-sm">~/projects/{project.title.toLowerCase().replace(/\s+/g, '-')}</span>
          </div>

          {/* Project Title */}
          <h3 className="text-3xl font-bold text-white mb-4 font-mono">
            <span className="text-[#00ff41]">$</span> {project.title}
          </h3>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.techStack.map((tech, index) => (
              <span
                key={index}
                className={`px-3 py-1 text-sm font-medium rounded-md border ${
                  techColors[index % techColors.length]
                }`}
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-gray-300 text-lg leading-relaxed mb-6 font-mono">
            <span className="text-[#00ff41]">{'>'}</span> {descriptionPreview}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/projects"
              className="inline-block px-6 py-3 bg-[#00ff41] text-[#0d1117] font-semibold rounded-lg hover:bg-[#00cc33] transition-colors duration-300 font-mono"
            >
              View Details
            </Link>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-[#30363d] text-white font-semibold rounded-lg hover:bg-[#484f58] transition-colors duration-300 font-mono"
              >
                View on GitHub
              </a>
            )}
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-[#30363d] text-white font-semibold rounded-lg hover:bg-[#484f58] transition-colors duration-300 font-mono"
              >
                Live Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
