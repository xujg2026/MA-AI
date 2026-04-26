import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Archive, Trash2, Building2, Globe, DollarSign, Clock, AlertTriangle, User, Sparkles, TrendingUp, Users, Target, ChevronRight, FileSignature, FileCheck, FileText, CheckCircle, Calendar, Wallet, Percent, BarChart3 } from 'lucide-react'
import useProjectStore from '../stores/projectStore'
import { Card, Button, Badge } from '../components/ui'
import { getApi } from '../services/api'
import ProjectForm from '../components/projects/ProjectForm'

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

// 风险等级配置
const RISK_LEVEL_CONFIG = {
  low: { label: '低风险', variant: 'success', color: 'text-green-600' },
  medium: { label: '中风险', variant: 'warning', color: 'text-yellow-600' },
  high: { label: '高风险', variant: 'danger', color: 'text-red-600' },
}

// 格式化东八区时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date)
  } catch {
    return dateStr
  }
}

// 阶段配置
const PHASE_CONFIG = {
  1: { label: '项目创建', desc: '基本信息录入' },
  2: { label: '觅售报告', desc: 'AI生成觅售报告' },
  3: { label: '交易流程', desc: '协议签署、尽调、估值' },
  4: { label: '交易完成', desc: '交割完成' },
}

// 交易流程阶段配置
const TRADING_PHASES = [
  { key: 'protocol', label: '协议签署', icon: FileSignature, desc: '签署并购协议' },
  { key: 'due-diligence', label: '尽职调查', icon: FileCheck, desc: '全面风险评估' },
  { key: 'valuation', label: '企业估值', icon: DollarSign, desc: '精准价值评估' },
  { key: 'match', label: '买家匹配', icon: Users, desc: '智能匹配买家' },
  { key: 'report', label: '推荐书', icon: FileText, desc: '生成推荐书' },
]

const tabs = [
  { key: 'basic', label: '基本信息' },
  { key: 'report', label: '觅售报告', desc: 'Phase 2' },
  { key: 'process', label: '交易流程', desc: 'Phase 3-4' },
]

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('basic')
  const [isLoaded, setIsLoaded] = useState(false)
  const [finderReport, setFinderReport] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [projectPhases, setProjectPhases] = useState([])
  const [phasesLoading, setPhasesLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(id === 'new')

  // 如果是新建项目
  if (isCreating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/projects')}>
              返回列表
            </Button>
          </div>
          <ProjectForm
            onSuccess={(project) => {
              navigate(`/projects/${project.id}`)
            }}
            onCancel={() => navigate('/projects')}
          />
        </div>
      </div>
    )
  }

  const {
    currentProject,
    loading,
    error,
    fetchProject,
    deleteProject,
  } = useProjectStore()

  // 获取项目阶段数据
  const fetchProjectPhases = async () => {
    setPhasesLoading(true)
    try {
      const api = getApi()
      const response = await api.getProjectPhases(id)
      if (response.success !== false) {
        const phases = response.data || []
        setProjectPhases(phases)
      } else {
        setProjectPhases([])
      }
    } catch (error) {
      console.error('Failed to fetch project phases:', error)
      setProjectPhases([])
    } finally {
      setPhasesLoading(false)
    }
  }

  // 获取觅售报告
  const fetchFinderReport = async () => {
    setReportLoading(true)
    try {
      const api = getApi()
      const response = await api.get(`/projects/${id}/phases`)
      if (response.success !== false) {
        const phases = response.data || []
        // 查找 finder 阶段的报告数据
        const finderPhase = phases.find(p => p.phase === 'finder')
        if (finderPhase && finderPhase.output_data) {
          const outputData = typeof finderPhase.output_data === 'string'
            ? JSON.parse(finderPhase.output_data)
            : finderPhase.output_data
          setFinderReport(outputData)
        } else {
          setFinderReport(null)
        }
      }
    } catch (error) {
      console.error('Failed to fetch finder report:', error)
      setFinderReport(null)
    } finally {
      setReportLoading(false)
    }
  }

  // 加载项目数据
  useEffect(() => {
    if (id) {
      fetchProject(id)
    }
    setIsLoaded(true)
  }, [id, fetchProject])

  // 加载觅售报告数据
  useEffect(() => {
    if (activeTab === 'report' && id) {
      fetchFinderReport()
    }
  }, [activeTab, id])

  // 加载项目阶段数据
  useEffect(() => {
    if (activeTab === 'process' && id) {
      fetchProjectPhases()
    }
  }, [activeTab, id])

  // 处理删除
  const handleDelete = async () => {
    if (!window.confirm('确定要删除该项目吗？此操作不可撤销。')) return

    const success = await deleteProject(id)
    if (success) {
      navigate('/projects')
    }
  }

  // 处理归档
  const handleArchive = () => {
    // Phase 3 实现
    console.log('Archive project:', id)
  }

  // 跳转到编辑页
  const handleEdit = () => {
    navigate(`/projects/${id}/edit`)
  }

  // 返回列表
  const handleBack = () => {
    navigate('/projects')
  }

  const statusConfig = currentProject ? (STATUS_CONFIG[currentProject.status] || STATUS_CONFIG.draft) : null
  const riskConfig = currentProject?.riskLevel ? (RISK_LEVEL_CONFIG[currentProject.riskLevel] || RISK_LEVEL_CONFIG.low) : null
  const sourceLabel = currentProject?.source ? (SOURCE_CONFIG[currentProject.source] || currentProject.source) : '未知'

  // 计算当前阶段
  const currentPhase = currentProject?.phase || 1

  // 解析 change_records
  const changeRecords = (() => {
    if (!currentProject?.change_records) return {}
    try {
      return typeof currentProject.change_records === 'string'
        ? JSON.parse(currentProject.change_records)
        : currentProject.change_records
    } catch {
      return {}
    }
  })()

  // 解析出售动机
  const sellMotivationList = (() => {
    if (!currentProject?.sell_motivation) return []
    try {
      return typeof currentProject.sell_motivation === 'string'
        ? JSON.parse(currentProject.sell_motivation)
        : currentProject.sell_motivation
    } catch {
      return []
    }
  })()

  // 检查是否有财务数据
  const hasFinancialData = (() => {
    const fd = changeRecords.financial_data
    if (!fd) return false
    const hasRevenue = fd.revenue?.some(r => r && r.trim() !== '')
    const hasProfit = fd.net_profit?.some(p => p && p.trim() !== '')
    const hasNetAssets = fd.net_assets && fd.net_assets.trim() !== ''
    const hasTotalAssets = fd.total_assets && fd.total_assets.trim() !== ''
    return hasRevenue || hasProfit || hasNetAssets || hasTotalAssets
  })()

  // 出售动机标签映射
  const motivationLabels = {
    succession: '个人与传承因素',
    strategy: '战略聚焦与止损',
    financial: '财务困境与压力',
    capital: '资本退出与环境',
    external: '外部与突发驱动',
    other: '其他原因',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* 返回按钮和标题 */}
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={handleBack}>
              返回列表
            </Button>
          </div>

          {/* 项目名称和状态 */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentProject?.name || '加载中...'}
              </h1>
              {currentProject && (
                <p className="text-gray-500">
                  {currentProject.company_name || '未指定公司'}
                </p>
              )}
            </div>
            {statusConfig && (
              <Badge variant={statusConfig.variant} size="lg">
                {statusConfig.label}
              </Badge>
            )}
          </div>

          {/* 操作按钮 */}
          {currentProject && (
            <div className="flex items-center gap-3 mt-6">
              <Button variant="outline" size="sm" icon={Edit2} onClick={handleEdit}>
                编辑
              </Button>
              <Button variant="ghost" size="sm" icon={Archive} onClick={handleArchive}>
                归档
              </Button>
              <Button variant="ghost" size="sm" icon={Trash2} onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                删除
              </Button>
            </div>
          )}
        </div>

        {/* Tab 导航 */}
        <div className={`mb-6 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-2 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => !tab.disabled && setActiveTab(tab.key)}
                disabled={tab.disabled}
                className={`
                  relative px-6 py-3 text-sm font-medium transition-all duration-200
                  ${activeTab === tab.key
                    ? 'text-primary'
                    : tab.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-primary'
                  }
                `}
              >
                {tab.label}
                {tab.disabled && (
                  <span className="ml-1 text-xs text-gray-400">({tab.desc})</span>
                )}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={`transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {activeTab === 'basic' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* 左侧 - 基本信息 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 加载状态 */}
                {loading && (
                  <Card padding="lg" className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-500">加载中...</p>
                  </Card>
                )}

                {/* 错误状态 */}
                {error && (
                  <Card padding="lg" className="text-center">
                    <p className="text-red-500">{error}</p>
                  </Card>
                )}

                {/* 基本信息 */}
                {currentProject && !loading && (
                  <>
                    <Card padding="lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">项目信息</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* 项目名称 */}
                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Sparkles size={14} />
                            项目名称
                          </label>
                          <p className="text-gray-900 font-medium">
                            {currentProject.name || '-'}
                          </p>
                        </div>

                        {/* 公司名称 */}
                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Building2 size={14} />
                            公司名称
                          </label>
                          <p className="text-gray-900 font-medium">
                            {currentProject.company_name || '-'}
                          </p>
                        </div>

                        {/* 公司类型 */}
                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Building2 size={14} />
                            公司类型
                          </label>
                          <p className="text-gray-900 font-medium">
                            {currentProject.company_type || '-'}
                          </p>
                        </div>

                        {/* 所属行业 */}
                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Globe size={14} />
                            所属行业
                          </label>
                          <p className="text-gray-900 font-medium">
                            {currentProject.industry || '-'}
                          </p>
                        </div>

                        {/* 所属地区 */}
                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Globe size={14} />
                            所属地区
                          </label>
                          <p className="text-gray-900 font-medium">
                            {currentProject.region || '-'}
                          </p>
                        </div>

                        {/* 成立日期 */}
                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Calendar size={14} />
                            成立日期
                          </label>
                          <p className="text-gray-900 font-medium">
                            {currentProject.establishment_date || '-'}
                          </p>
                        </div>

                        {/* 注册资本 */}
                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Wallet size={14} />
                            注册资本（万元）
                          </label>
                          <p className="text-gray-900 font-medium">
                            {currentProject.registration_capital
                              ? `${Number(currentProject.registration_capital).toLocaleString()}`
                              : '-'}
                          </p>
                        </div>

                        {/* 人员规模 */}
                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Users size={14} />
                            人员规模
                          </label>
                          <p className="text-gray-900 font-medium">
                            {currentProject.employee_count || '-'}
                          </p>
                        </div>

                        {/* 预估估值 */}
                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <DollarSign size={14} />
                            预估估值
                          </label>
                          <p className="text-gray-900 font-medium">
                            {currentProject.estimated_value
                              ? `¥${Number(currentProject.estimated_value).toLocaleString()}`
                              : '-'}
                          </p>
                        </div>

                        {/* 项目来源 */}
                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <User size={14} />
                            项目来源
                          </label>
                          <p className="text-gray-900 font-medium">
                            {sourceLabel}
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card padding="lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">详细信息</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* 创建时间 */}
                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Clock size={14} />
                            创建时间
                          </label>
                          <p className="text-gray-900 font-medium">
                            {formatDateTime(currentProject.created_at)}
                          </p>
                        </div>

                        {/* 更新时间 */}
                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Clock size={14} />
                            更新时间
                          </label>
                          <p className="text-gray-900 font-medium">
                            {formatDateTime(currentProject.updated_at)}
                          </p>
                        </div>

                        {/* 风险等级 */}
                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <AlertTriangle size={14} />
                            风险等级
                          </label>
                          <p className={`font-medium ${riskConfig?.color || 'text-gray-900'}`}>
                            {riskConfig?.label || '-'}
                          </p>
                        </div>
                      </div>

                      {/* 出售动机 */}
                      <div className="mt-6">
                        <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <User size={14} />
                          出售动机
                        </label>
                        {sellMotivationList.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {sellMotivationList.map((motivation) => (
                              <span
                                key={motivation}
                                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                              >
                                {motivationLabels[motivation] || motivation}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400">未填写</p>
                        )}
                      </div>
                    </Card>

                    {/* 财务信息 */}
                    {hasFinancialData && (
                      <Card padding="lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">财务信息</h3>
                        <div className="space-y-6">
                          {/* 营业收入 */}
                          {changeRecords.financial_data?.revenue?.[0] && (
                            <div>
                              <label className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                <TrendingUp size={14} />
                                营业收入（万元）
                              </label>
                              <div className="grid grid-cols-3 gap-4">
                                {changeRecords.financial_data.revenue.map((rev, idx) => (
                                  <div key={idx} className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500 mb-1">{['2025年', '2024年', '2023年'][idx]}</p>
                                    <p className="text-gray-900 font-medium">
                                      {rev ? Number(rev).toLocaleString() : '-'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 净利润 */}
                          {changeRecords.financial_data?.net_profit?.[0] && (
                            <div>
                              <label className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                <Percent size={14} />
                                净利润（万元）
                              </label>
                              <div className="grid grid-cols-3 gap-4">
                                {changeRecords.financial_data.net_profit.map((profit, idx) => (
                                  <div key={idx} className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500 mb-1">{['2025年', '2024年', '2023年'][idx]}</p>
                                    <p className="text-gray-900 font-medium">
                                      {profit ? Number(profit).toLocaleString() : '-'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 资产信息 */}
                          {(changeRecords.financial_data?.net_assets || changeRecords.financial_data?.total_assets) && (
                            <div className="grid md:grid-cols-2 gap-4">
                              {changeRecords.financial_data?.net_assets && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <BarChart3 size={14} />
                                    净资产（万元）
                                  </label>
                                  <p className="text-gray-900 font-medium text-lg">
                                    {Number(changeRecords.financial_data.net_assets).toLocaleString()}
                                  </p>
                                  {changeRecords.financial_data?.net_assets_date && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      截止 {changeRecords.financial_data.net_assets_date}
                                    </p>
                                  )}
                                </div>
                              )}
                              {changeRecords.financial_data?.total_assets && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <BarChart3 size={14} />
                                    总资产（万元）
                                  </label>
                                  <p className="text-gray-900 font-medium text-lg">
                                    {Number(changeRecords.financial_data.total_assets).toLocaleString()}
                                  </p>
                                  {changeRecords.financial_data?.total_assets_date && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      截止 {changeRecords.financial_data.total_assets_date}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    )}
                  </>
                )}
              </div>

              {/* 右侧 - 项目阶段 */}
              <div className="space-y-6">
                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">项目阶段</h3>
                  <div className="space-y-4">
                    {Object.entries(PHASE_CONFIG).map(([phase, config]) => {
                      const phaseNum = parseInt(phase)
                      const isActive = phaseNum === currentPhase
                      const isComplete = phaseNum < currentPhase

                      return (
                        <div key={phase} className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`
                                w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                                transition-all duration-300
                                ${isActive
                                  ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lg scale-110'
                                  : isComplete
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }
                              `}
                            >
                              {isComplete ? '✓' : phase}
                            </div>
                            {phaseNum < 4 && (
                              <div
                                className={`w-0.5 h-8 ${isComplete ? 'bg-green-500' : 'bg-gray-200'}`}
                              />
                            )}
                          </div>
                          <div className="flex-1 pt-1">
                            <p className={`font-medium ${isActive ? 'text-primary' : 'text-gray-700'}`}>
                              {config.label}
                            </p>
                            <p className="text-sm text-gray-500">
                              {config.desc}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>

                {/* 当前状态指示 */}
                {currentProject && (
                  <Card padding="lg" variant="gradient" gradient="from-primary/5 to-secondary/5">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">当前状态</p>
                      <Badge variant={statusConfig?.variant} size="lg">
                        {statusConfig?.label}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-4">
                        项目ID: {currentProject.id}
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === 'report' && (
            <div className="space-y-6">
              {reportLoading && (
                <Card padding="lg" className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-500">加载觅售报告...</p>
                </Card>
              )}

              {!reportLoading && finderReport && (
                <>
                  {/* 报告头部信息 */}
                  <Card padding="lg">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">觅售分析报告</h3>
                        {finderReport.analyzedAt && (
                          <p className="text-sm text-gray-500">
                            分析时间: {new Date(finderReport.analyzedAt).toLocaleString('zh-CN')}
                          </p>
                        )}
                      </div>
                      {finderReport.matchScore && (
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${
                            finderReport.matchScore >= 80 ? 'text-green-600' :
                            finderReport.matchScore >= 60 ? 'text-blue-600' :
                            finderReport.matchScore >= 40 ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>
                            {finderReport.matchScore}
                          </div>
                          <div className="text-xs text-gray-500">匹配度分数</div>
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building2 size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">目标公司</p>
                          <p className="font-medium text-gray-900">{finderReport.companyName || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Globe size={20} className="text-secondary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">所属行业</p>
                          <p className="font-medium text-gray-900">{finderReport.industry || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Users size={20} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">匹配买家数</p>
                          <p className="font-medium text-gray-900">{finderReport.matchCount || 0}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* 最佳匹配列表 */}
                  {finderReport.topMatches && finderReport.topMatches.length > 0 && (
                    <Card padding="lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Target size={20} className="text-primary" />
                        最佳匹配
                      </h3>
                      <div className="space-y-4">
                        {finderReport.topMatches.slice(0, 5).map((match, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-primary/30 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900">{match.company}</h4>
                                <p className="text-sm text-gray-500">{match.industry || '未知行业'}</p>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                match.matchScore >= 80 ? 'bg-green-100 text-green-700' :
                                match.matchScore >= 60 ? 'bg-blue-100 text-blue-700' :
                                match.matchScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {match.matchScore}分
                              </div>
                            </div>
                            {match.matchReasons && match.matchReasons.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {match.matchReasons.map((reason, rIndex) => (
                                  <span key={rIndex} className="px-2 py-1 bg-primary/5 text-primary text-xs rounded-full">
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* 估值信息 */}
                  {finderReport.estimatedValue && (
                    <Card padding="lg" variant="gradient" gradient="from-green-50 to-emerald-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                          <DollarSign size={24} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">预估价值</p>
                          <p className="text-2xl font-bold text-green-700">{finderReport.estimatedValue}</p>
                        </div>
                      </div>
                    </Card>
                  )}
                </>
              )}

              {!reportLoading && !finderReport && (
                <Card padding="lg">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">暂无觅售报告</p>
                    <Button
                      variant="primary"
                      onClick={() => navigate('/ai-finder')}
                      icon={ChevronRight}
                    >
                      前往觅售
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'process' && (
            <div className="space-y-6">
              {phasesLoading && (
                <Card padding="lg" className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-500">加载交易流程数据...</p>
                </Card>
              )}

              {!phasesLoading && (
                <>
                  {/* 阶段概览 */}
                  <Card padding="lg">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">交易流程进度</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          共 {projectPhases.length} 个阶段已完成
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        icon={ChevronRight}
                        onClick={() => navigate(`/buyer-matching/${id}`)}
                      >
                        进入交易
                      </Button>
                    </div>

                    {/* 阶段列表 */}
                    <div className="space-y-4">
                      {TRADING_PHASES.map((phase, index) => {
                        const phaseData = projectPhases.find(p => p.phase === phase.key)
                        const isCompleted = !!phaseData
                        const isInProgress = !isCompleted && projectPhases.length === index
                        const Icon = phase.icon

                        return (
                          <div key={phase.key} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div
                                className={`
                                  w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm
                                  transition-all duration-300
                                  ${isCompleted
                                    ? 'bg-green-500 text-white'
                                    : isInProgress
                                      ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lg'
                                      : 'bg-gray-200 text-gray-500'
                                  }
                                `}
                              >
                                {isCompleted ? (
                                  <CheckCircle size={24} />
                                ) : (
                                  <Icon size={24} />
                                )}
                              </div>
                              {index < TRADING_PHASES.length - 1 && (
                                <div
                                  className={`w-0.5 h-12 ${
                                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                  }`}
                                />
                              )}
                            </div>
                            <div className="flex-1 pt-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className={`font-medium ${isCompleted ? 'text-green-700' : isInProgress ? 'text-primary' : 'text-gray-700'}`}>
                                    {phase.label}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {phase.desc}
                                  </p>
                                </div>
                                {isCompleted && phaseData?.output_data && (
                                  <div className="text-right">
                                    <Badge variant="success" className="flex items-center gap-1">
                                      <CheckCircle size={12} />
                                      已完成
                                    </Badge>
                                    {phaseData.output_data.completedAt && (
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(phaseData.output_data.completedAt).toLocaleString('zh-CN')}
                                      </p>
                                    )}
                                  </div>
                                )}
                                {isInProgress && (
                                  <Badge variant="primary" className="flex items-center gap-1">
                                    <Clock size={12} />
                                    进行中
                                  </Badge>
                                )}
                                {!isCompleted && !isInProgress && (
                                  <Badge variant="default" className="flex items-center gap-1">
                                    <Clock size={12} />
                                    待开始
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Card>

                  {/* 阶段详情卡片 */}
                  {projectPhases.length > 0 && (
                    <Card padding="lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">阶段产出物</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projectPhases.map((phase) => {
                          const phaseConfig = TRADING_PHASES.find(p => p.key === phase.phase)
                          const Icon = phaseConfig?.icon || FileText
                          return (
                            <div
                              key={phase.phase}
                              className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <Icon size={20} className="text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {phaseConfig?.label || phase.phase}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {phaseConfig?.desc}
                                  </p>
                                </div>
                              </div>
                              {phase.output_data?.completedAt && (
                                <p className="text-xs text-gray-400 mt-2">
                                  完成时间: {new Date(phase.output_data.completedAt).toLocaleString('zh-CN')}
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  )}

                  {/* 无阶段数据提示 */}
                  {projectPhases.length === 0 && (
                    <Card padding="lg">
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Sparkles size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 mb-2">暂无交易流程数据</p>
                        <p className="text-sm text-gray-400 mb-4">
                          开始交易流程后，这里将显示各阶段进度
                        </p>
                        <Button
                          variant="primary"
                          onClick={() => navigate(`/buyer-matching/${id}`)}
                          icon={ChevronRight}
                        >
                          开始交易流程
                        </Button>
                      </div>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}