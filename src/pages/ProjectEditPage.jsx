import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useProjectStore from '../stores/projectStore'
import { Button } from '../components/ui'
import ProjectForm from '../components/projects/ProjectForm'

export default function ProjectEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentProject, fetchProject, loading } = useProjectStore()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProject(id).then(() => {
        setIsLoaded(true)
      })
    }
  }, [id, fetchProject])

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">项目不存在</p>
            <Button variant="primary" onClick={() => navigate('/projects')} className="mt-4">
              返回项目列表
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/projects/${id}`)}>
            返回详情
          </Button>
        </div>
        <ProjectForm
          initialData={currentProject}
          onEdit={(project) => {
            navigate(`/projects/${project.id}`)
          }}
          onCancel={() => navigate(`/projects/${id}`)}
        />
      </div>
    </div>
  )
}
