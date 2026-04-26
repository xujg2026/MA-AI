import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Eye, Edit2, Trash2, Folder, Upload, X } from 'lucide-react'
import useProjectStore from '../stores/projectStore'
import { Card, Button, Badge } from '../components/ui'
import ExcelImporter from '../components/ai/ExcelImporter'

// 项目状态配置
const STATUS_CONFIG = {
  draft: { label: '草稿', variant: 'default', color: 'text-gray-600' },
  researching: { label: '觅售中', variant: 'info', color: 'text-blue-600' },
  matching: { label: '交易中', variant: 'success', color: 'text-green-600' },
  closed: { label: '已关闭', variant: 'default', color: 'text-gray-500' },
  archived: { label: '已归档', variant: 'secondary', color: 'text-gray-400' },
}

// 项目来源配置
const SOURCE_CONFIG = {
  manual: '手动建项',
  excel_import: 'Excel导入',
  ai_finder: 'AI觅售',
  ai_matching: 'AI交易',
}

// 筛选标签
const FILTER_TABS = [
  { key: null, label: '全部' },
  { key: 'draft', label: '草稿' },
  { key: 'researching', label: '觅售中' },
  { key: 'matching', label: '交易中' },
  { key: 'closed', label: '已关闭' },
]

export default function ProjectListPage() {
  const navigate = useNavigate()
  const [isLoaded] = useState(true) // 动画加载状态
  const [showImportModal, setShowImportModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const {
    projects,
    loading,
    filterStatus,
    fetchProjects,
    deleteProject,
    setFilterStatus,
  } = useProjectStore()

  // 初始加载
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // 过滤后的项目列表
  const filteredProjects = useMemo(() => {
    let result = projects

    // 按状态筛选
    if (filterStatus) {
      result = result.filter((p) => p.status === filterStatus)
    }

    // 按搜索词筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.company_name?.toLowerCase().includes(term)
      )
    }

    return result
  }, [projects, filterStatus, searchTerm])

  // 处理删除
  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('确定要删除该项目吗？')) return

    const success = await deleteProject(id)
    if (success) {
      // 删除成功，无需额外操作，store已更新
    }
  }

  // 跳转到详情页
  const handleViewDetail = (id) => {
    navigate(`/projects/${id}`)
  }

  // 跳转到编辑页
  const handleEdit = (id) => {
    navigate(`/projects/${id}/edit`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`mb-8 transition-all duration-700 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">项目管理</h1>
              <p className="text-gray-500 mt-1">管理所有M&A交易项目</p>
            </div>
            <div className="flex gap-3">
              <Button icon={Upload} variant="outline" onClick={() => setShowImportModal(true)}>
                导入项目
              </Button>
              <Button icon={Plus} onClick={() => navigate('/projects/new')}>
                新建项目
              </Button>
            </div>
          </div>

          {/* 筛选标签 */}
          <div className="flex items-center gap-2 mb-6">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key ?? 'all'}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filterStatus === tab.key
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="搜索项目名称或公司名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* 项目列表 */}
        <div
          className={`transition-all duration-700 delay-200 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* 结果统计 */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">
              共找到{' '}
              <span className="font-semibold text-primary">
                {filteredProjects.length}
              </span>{' '}
              个项目
            </p>
          </div>

          {/* 加载状态 */}
          {loading && projects.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500">加载中...</p>
            </div>
          )}

          {/* 项目卡片列表 */}
          {!loading && filteredProjects.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft
                const sourceLabel = SOURCE_CONFIG[project.source] || project.source || '未知'

                return (
                  <Card
                    key={project.id}
                    padding="md"
                    hover
                    className="cursor-pointer"
                    onClick={() => handleViewDetail(project.id)}
                  >
                    {/* 项目名称和状态 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate mb-1">
                          {project.name || '未命名项目'}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {project.company_name || '未指定公司'}
                        </p>
                      </div>
                      <Badge variant={statusConfig.variant} size="sm">
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {/* 项目信息 */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">行业</span>
                        <span className="text-gray-700">
                          {project.industry || '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">地区</span>
                        <span className="text-gray-700">
                          {project.region || '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">估值</span>
                        <span className="font-semibold text-primary">
                          {project.valuation
                            ? `¥${Number(project.valuation).toLocaleString()}`
                            : '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">创建时间</span>
                        <span className="text-gray-700">
                          {project.createdAt
                            ? new Date(project.createdAt).toLocaleDateString('zh-CN')
                            : '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">来源</span>
                        <span className="text-gray-700">{sourceLabel}</span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetail(project.id)
                        }}
                        className="flex-1"
                      >
                        详情
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit2}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(project.id)
                        }}
                        className="flex-1"
                      >
                        编辑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={(e) => handleDelete(e, project.id)}
                        className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        删除
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* 空状态 */}
          {!loading && filteredProjects.length === 0 && (
            <Card padding="lg" className="text-center">
              <Folder size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                {searchTerm || filterStatus
                  ? '没有找到匹配的项目'
                  : '暂无项目'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {searchTerm || filterStatus
                  ? '尝试调整筛选条件'
                  : '点击"新建项目"开始创建'}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* 导入项目Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowImportModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden m-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">导入项目</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <ExcelImporter
                onImportComplete={() => {
                  // 记录导入成功，但用户还需要创建项目
                }}
                onProjectsCreated={() => {
                  setShowImportModal(false)
                  // 刷新项目列表
                  const { fetchProjects } = useProjectStore.getState()
                  fetchProjects()
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
