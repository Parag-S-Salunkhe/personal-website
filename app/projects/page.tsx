'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Code, ExternalLink, Github, Terminal } from 'lucide-react'
import Image from 'next/image'
import SearchBar from '@/components/shared/SearchBar'

interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  projectUrl: string | null
  githubUrl: string | null
  imageUrl: string | null
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date')
  const [typedText, setTypedText] = useState('')
  const fullText = '> ls -la ~/projects'

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(timer)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    filterAndSortProjects()
  }, [projects, searchQuery, sortBy])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data.projects || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setLoading(false)
    }
  }

  const filterAndSortProjects = () => {
    let filtered = projects

    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      return 0 // Keep original order for date
    })

    setFilteredProjects(sorted)
  }

  return (
    <div className="min-h-screen bg-[#0d1117] dark:bg-[#0d1117] text-green-400 font-mono transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Terminal Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-black/50 border border-green-500/30 rounded-lg p-6 shadow-2xl">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-4 text-gray-400 text-sm">terminal — projects</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5" />
                <span className="text-xl">{typedText}</span>
                <span className="animate-pulse">_</span>
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="pl-8 text-blue-400"
              >
                <p>Found {filteredProjects.length} projects</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Search & Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <SearchBar
            placeholder="Search projects..."
            onSearch={setSearchQuery}
            theme="default"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 rounded-lg border border-green-500/30 bg-black/50 text-green-400 focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
          >
            <option value="date">Recent First</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </motion.div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-400">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Code className="w-20 h-20 text-green-500/30 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet!'}
            </h3>
            <p className="text-gray-400">
              {searchQuery ? 'Try adjusting your search' : 'Coming soon - projects will appear here!'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-black/50 border border-green-500/30 rounded-lg p-6 hover:border-green-500 hover:shadow-2xl hover:shadow-green-500/20 transition-all"
              >
                {/* Image */}
                {project.imageUrl && (
                  <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Code className="w-5 h-5 text-purple-400" />
                    <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                      {project.title}
                    </h3>
                  </div>
                  
                  <div className="flex space-x-2">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-green-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                    {project.projectUrl && (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-green-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-gray-400 mb-4 leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm hover:bg-green-500/20 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
