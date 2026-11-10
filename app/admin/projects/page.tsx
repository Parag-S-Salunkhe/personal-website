'use client'

import { useState, useEffect } from 'react'
import { safeHttpUrl } from '@/lib/url'

interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  projectUrl: string | null
  githubUrl: string | null
  imageUrl: string | null
  createdAt: string
}

interface FormData {
  title: string
  description: string
  techStack: string
  projectUrl: string
  githubUrl: string
  imageUrl: string
}

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    techStack: '',
    projectUrl: '',
    githubUrl: '',
    imageUrl: ''
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      setProjects(data.projects || [])
      applyFilters(searchQuery, data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      alert('Error fetching projects')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = (searchQuery: string, projectsList = projects) => {
    let filtered = [...projectsList]
    
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    setFilteredProjects(filtered)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    applyFilters(query)
  }

  const handleAddNew = () => {
    setEditingProject(null)
    setFormData({
      title: '',
      description: '',
      techStack: '',
      projectUrl: '',
      githubUrl: '',
      imageUrl: ''
    })
    setIsFormOpen(true)
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      description: project.description,
      techStack: project.techStack?.join(', ') || '',
      projectUrl: project.projectUrl || '',
      githubUrl: project.githubUrl || '',
      imageUrl: project.imageUrl || ''
    })
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      title: formData.title,
      description: formData.description,
      techStack: formData.techStack 
        ? formData.techStack.split(',').map(t => t.trim()).filter(Boolean)
        : [],
      projectUrl: formData.projectUrl.trim() || null,
      githubUrl: formData.githubUrl.trim() || null,
      imageUrl: formData.imageUrl.trim() || null
    }
    
    console.log('Submitting payload:', payload)
    
    try {
      if (editingProject) {
        const response = await fetch(`/api/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update project')
        }
        
        alert('Project updated successfully!')
        fetchProjects()
        setIsFormOpen(false)
      } else {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create project')
        }
        
        alert('Project created successfully!')
        fetchProjects()
        setIsFormOpen(false)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Error saving project: ' + (error as Error).message)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          alert('Project deleted successfully!')
          fetchProjects()
        } else {
          alert('Error deleting project')
        }
      } catch (error) {
        alert('Error deleting project: ' + (error as Error).message)
      }
    }
  }

  return (
    <div>
      <div>
        <div className="mb-8">
          <h1 className="t-display mis text-4xl md:text-5xl mb-2">
            Projects
          </h1>
          <p className="text-riso-blue">
            Manage your portfolio projects
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="field"
          />
          <button
            onClick={handleAddNew}
            className="btn"
          >
            <span aria-hidden="true">+</span> Add new project
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-b-2 border-riso-blue mx-auto"></div>
            <p className="mt-4 text-riso-blue">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-slip border-2 border-dashed border-riso-blue/40">
            <p className="text-riso-blue text-lg">
              {searchQuery
                ? `No projects found matching "${searchQuery}".` 
                : 'No projects yet. Add your first project!'}
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
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Tech Stack
                    </th>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Links
                    </th>
                    <th className="px-4 py-3 text-left text-base text-riso-blue t-label">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slip divide-y divide-dashed divide-riso-blue/40">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-riso-yellow transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        {project.imageUrl ? (
                          <img src={project.imageUrl} alt={project.title} className="w-16 h-16 object-cover" />
                        ) : (
                          <div className="w-16 h-16 bg-paper flex items-center justify-center text-2xl">
                            💼
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="t-label text-base text-ink max-w-xs truncate">
                          {project.title}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {project.techStack?.slice(0, 3).map((tech, idx) => (
                            <span key={idx} className="border border-riso-blue px-2 py-0.5 text-sm text-riso-blue">
                              {tech}
                            </span>
                          ))}
                          {project.techStack?.length > 3 && (
                            <span className="border border-riso-blue px-2 py-0.5 text-sm text-ink">
                              +{project.techStack.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {project.projectUrl && (
                            <a href={safeHttpUrl(project.projectUrl) ?? undefined} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center px-3 t-label text-lg text-riso-blue hover:bg-riso-yellow hover:text-ink">
                              🔗
                            </a>
                          )}
                          {project.githubUrl && (
                            <a href={safeHttpUrl(project.githubUrl) ?? undefined} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center px-3 t-label text-lg text-riso-blue hover:bg-riso-yellow hover:text-ink">
                              💻
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(project)}
                          className="inline-flex min-h-[44px] items-center px-3 mr-2 t-label text-lg text-riso-blue hover:bg-riso-yellow hover:text-ink"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project.id, project.title)}
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

        {isFormOpen && (
          <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
            <div className="bg-slip border-2 border-riso-blue max-w-2xl w-full max-h-[90dvh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="t-title text-2xl text-ink">
                    {editingProject ? 'Edit Project' : 'Add New Project'}
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-2xl text-riso-blue hover:bg-riso-yellow hover:text-ink"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="field"
                      placeholder="Project name"
                    />
                  </div>
                  
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="field"
                      placeholder="Describe your project..."
                    />
                  </div>
                  
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Tech Stack * (comma separated)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.techStack}
                      onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                      className="field"
                      placeholder="React, Node.js, PostgreSQL"
                    />
                  </div>
                  
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Project URL (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.projectUrl}
                      onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                      className="field"
                      placeholder="https://project-demo.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      GitHub URL (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      className="field"
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                  
                  <div>
                    <label className="block t-label text-base text-ink mb-1">
                      Image URL (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="field"
                      placeholder="https://example.com/project-screenshot.jpg"
                    />
                    <p className="mt-1 text-sm text-riso-blue">Right-click on any image → Copy Image Address</p>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="btn flex-1"
                    >
                      {editingProject ? 'Update Project' : 'Add Project'}
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
