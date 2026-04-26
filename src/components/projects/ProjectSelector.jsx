import { useState, useEffect } from 'react'
import { X, FolderPlus, Building2, Loader2, CheckCircle } from 'lucide-react'
import { Card, Button, Input, Badge } from '../ui'
import { getApi } from '../../services/api'

export default function ProjectSelector({ isOpen, onClose, deal, onSuccess }) {
  const [mode, setMode] = useState('select') // 'select' | 'create'
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // New project form data
  const [newProject, setNewProject] = useState({
    name: '',
    industry: '',
    estimated_value: '',
  })

  // Fetch projects when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProjects()
      // Auto-fill with deal data
      setNewProject({
        name: deal?.company_name || '',
        industry: deal?.industry || '',
        estimated_value: deal?.amount?.replace(/¥|,|亿/g, '') || '',
      })
    }
  }, [isOpen, deal])

  const fetchProjects = async () => {
    setIsLoading(true)
    try {
      const api = getApi()
      const response = await api.get('/projects', { limit: 100 })
      if (response.success !== false) {
        const items = response.data?.items || response.data || []
        setProjects(items)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (mode === 'select' && !selectedProjectId) {
      return
    }
    if (mode === 'create' && !newProject.name) {
      return
    }

    setIsSubmitting(true)
    const api = getApi()

    try {
      let targetProjectId = selectedProjectId

      // If creating new project
      if (mode === 'create') {
        const createResponse = await api.post('/projects', {
          name: newProject.name,
          industry: newProject.industry,
          estimated_value: newProject.estimated_value,
          status: '意向',
          source: '觅售归集',
          company_name: deal?.company,
        })

        if (createResponse.success === false) {
          throw new Error(createResponse.error || '创建项目失败')
        }

        targetProjectId = createResponse.data?.id || createResponse.data
      }

      // Submit finder result
      const submitResponse = await api.post(`/projects/${targetProjectId}/finder-result`, {
        companyName: deal?.company,
        industry: deal?.industry,
        region: deal?.region,
        estimatedValue: deal?.amount,
        finderResult: {
          matchScore: deal?.matchScore,
          matchCount: deal?.matchScore ? 1 : 0,
          topMatches: [deal],
        },
      })

      if (submitResponse.success === false) {
        throw new Error(submitResponse.error || '归集觅售结果失败')
      }

      setSubmitSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
        // Reset state
        setSubmitSuccess(false)
        setMode('select')
        setSelectedProjectId(null)
        setNewProject({ name: '', industry: '', estimated_value: '' })
      }, 1500)
    } catch (error) {
      console.error('Failed to submit:', error)
      alert(error.message || '操作失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card padding="lg" className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">加入项目</h3>
            <p className="text-sm text-gray-500 mt-1">
              将「{deal?.company}」归集到项目中
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success State */}
        {submitSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <p className="text-lg font-medium text-gray-900">归集成功</p>
            <p className="text-sm text-gray-500 mt-1">觅售结果已添加到项目中</p>
          </div>
        ) : (
          <>
            {/* Mode Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMode('select')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  mode === 'select'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                选择已有项目
              </button>
              <button
                onClick={() => setMode('create')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  mode === 'create'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                新建项目
              </button>
            </div>

            {/* Select Existing Project */}
            {mode === 'select' && (
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 size={24} className="animate-spin text-primary mx-auto" />
                    <p className="text-sm text-gray-500 mt-2">加载中...</p>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>暂无项目</p>
                    <p className="text-sm text-gray-400 mt-1">请选择新建项目</p>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedProjectId === project.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedProjectId === project.id
                              ? 'border-primary bg-primary'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedProjectId === project.id && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{project.name}</h4>
                            <Badge
                              variant={
                                project.status === '已完成'
                                  ? 'success'
                                  : project.status === '进行中'
                                  ? 'primary'
                                  : 'warning'
                              }
                              className="text-xs"
                            >
                              {project.status || '意向'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {project.industry && <span>{project.industry}</span>}
                            {project.estimated_value && (
                              <span className="ml-2">估值: ¥{project.estimated_value}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Create New Project */}
            {mode === 'create' && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Building2 size={16} />
                    <span>将从觅售结果自动填充以下信息</span>
                  </div>
                </div>

                <Input
                  label="项目名称"
                  name="name"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  placeholder="输入项目名称"
                />

                <Input
                  label="所属行业"
                  name="industry"
                  value={newProject.industry}
                  onChange={(e) =>
                    setNewProject({ ...newProject, industry: e.target.value })
                  }
                  as="select"
                >
                  <option value="">请选择行业</option>
                  <option value="科技">科技</option>
                  <option value="医疗健康">医疗健康</option>
                  <option value="金融服务">金融服务</option>
                  <option value="制造业">制造业</option>
                  <option value="零售消费">零售消费</option>
                  <option value="能源环保">能源环保</option>
                  <option value="教育培训">教育培训</option>
                  <option value="TIC检测认证">TIC检测认证</option>
                </Input>

                <Input
                  label="估值（万元）"
                  name="estimated_value"
                  value={newProject.estimated_value}
                  onChange={(e) =>
                    setNewProject({ ...newProject, estimated_value: e.target.value })
                  }
                  placeholder="如：5000"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" className="flex-1" onClick={onClose}>
                取消
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  (mode === 'select' && !selectedProjectId) ||
                  (mode === 'create' && !newProject.name)
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <FolderPlus size={16} className="mr-2" />
                    {mode === 'select' ? '确认归集' : '创建并归集'}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}