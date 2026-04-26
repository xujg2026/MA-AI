import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AIDueDiligence from '../components/ai/AIDueDiligence'
import AIValuation from '../components/ai/AIValuation'
import AIMatchmaker from '../components/ai/AIMatchmaker'
import AIProtocolSigning from '../components/ai/AIProtocolSigning'
import DDReportGenerator from '../components/ai/DDReportGenerator'
import BuyerMatchInputPage from './BuyerMatchInputPage'
import useProjectStore from '../stores/projectStore'
import { FileCheck, DollarSign, Users, FileText, Sparkles, FileSignature, ChevronLeft, ChevronRight, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, Badge, Button } from '../components/ui'
// getApi - kept for potential future use

const tabs = [
  { key: 'protocol', label: '协议签署', icon: FileSignature, desc: '签署并购协议' },
  { key: 'due-diligence', label: '尽职调查', icon: FileCheck, desc: '全面风险评估' },
  { key: 'valuation', label: '企业估值', icon: DollarSign, desc: '精准价值评估' },
  { key: 'match', label: '买家匹配', icon: Users, desc: '智能匹配买家' },
  { key: 'report', label: '推荐书生产', icon: FileText, desc: '生成推荐书' },
]

export default function BuyerMatchingPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { projects = [], fetchProjects } = useProjectStore()
  const [activeTab, setActiveTab] = useState('protocol')
  const [completedSteps, setCompletedSteps] = useState({
    'protocol': false,
    'due-diligence': false,
    'valuation': false,
    'match': false,
    'report': false,
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '')

  useEffect(() => {
    setIsLoaded(true)
    if (projects.length === 0) {
      fetchProjects()
    }
  }, [])

  // 当 projectId 变化时更新选中项目
  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId)
    }
  }, [projectId])

  const handleTabChange = (tab) => {
    if (!selectedProjectId) {
      alert('请先选择项目')
      return
    }
    setActiveTab(tab)
  }

  const markComplete = (tab) => {
    setCompletedSteps({ ...completedSteps, [tab]: true })
    // 自动切换到下一个 tab
    const tabOrder = ['protocol', 'due-diligence', 'valuation', 'match', 'report']
    const currentIndex = tabOrder.indexOf(tab)
    if (currentIndex >= 0 && currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1])
    }
  }

  const currentIndex = tabs.findIndex(t => t.key === activeTab)

  const renderContent = () => {
    // 未选择项目时显示提示
    if (!selectedProjectId) {
      return (
        <Card padding="lg" className="text-center">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">请在上方选择项目后再进行交易流程操作</p>
        </Card>
      )
    }
    switch (activeTab) {
      case 'protocol':
        return <AIProtocolSigning projectId={selectedProjectId} onComplete={() => markComplete('protocol')} />
      case 'due-diligence':
        return <AIDueDiligence projectId={selectedProjectId} onComplete={() => markComplete('due-diligence')} />
      case 'valuation':
        return <AIValuation projectId={selectedProjectId} onComplete={() => markComplete('valuation')} />
      case 'match':
        return <AIMatchmaker projectId={selectedProjectId} onComplete={() => markComplete('match')} />
      case 'match-input':
        return <BuyerMatchInputPage />
      case 'report':
        return <DDReportGenerator projectId={selectedProjectId} onComplete={() => markComplete('report')} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-10 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Badge variant="primary" className="mb-4 inline-flex items-center gap-2">
            <Sparkles size={14} />
            <span>AI智能交易</span>
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            一站式完成<span className="gradient-text">并购交易</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            从协议签署到推荐书生产，全流程智能化的并购交易平台
          </p>
        </div>

        {/* 项目选择下拉框 */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white appearance-none cursor-pointer"
            >
              <option value="">-- 请选择项目 --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.company_name || '未指定公司'}
                </option>
              ))}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Users size={18} />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className={`mb-10 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 hidden md:block" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary to-secondary -translate-y-1/2 transition-all duration-500 hidden md:block"
              style={{ width: `${(currentIndex / (tabs.length - 1)) * 100}%` }}
            />

            {/* Tabs */}
            <div className="flex justify-between relative">
              {tabs.map((tab, index) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                const isComplete = completedSteps[tab.key]
                const isPast = currentIndex > index

                return (
                  <div key={tab.key} className="flex flex-col items-center relative z-10">
                    <button
                      onClick={() => handleTabChange(tab.key)}
                      className={`
                        relative flex items-center justify-center w-14 h-14 rounded-2xl font-medium transition-all duration-500 shadow-lg
                        ${isActive
                          ? 'bg-gradient-to-br from-primary to-secondary text-white scale-110'
                          : isPast || isComplete
                            ? 'bg-white text-primary border-2 border-primary hover:bg-primary/5'
                            : 'bg-white text-gray-400 border-2 border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      {isComplete && !isActive ? (
                        <CheckCircle size={24} className="text-green-500" />
                      ) : (
                        <Icon size={24} />
                      )}

                      {/* Active glow */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-2xl bg-primary animate-pulse opacity-20" />
                      )}
                    </button>
                    <div className="mt-3 text-center hidden md:block">
                      <p className={`text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                        {tab.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{tab.desc}</p>
                    </div>
                    <p className="mt-2 text-sm font-medium md:hidden">{tab.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {renderContent()}
        </div>

        {/* Navigation */}
        <div className={`flex justify-between items-center mt-8 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Button
            variant="ghost"
            onClick={() => setActiveTab(tabs[currentIndex - 1].key)}
            disabled={currentIndex === 0}
            className="px-6"
          >
            <ChevronLeft size={20} className="mr-1" />
            上一步
          </Button>

          <div className="hidden md:flex items-center gap-2">
            {tabs.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-6 bg-primary'
                    : index < currentIndex
                      ? 'bg-primary/50'
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            variant="primary"
            onClick={() => setActiveTab(tabs[currentIndex + 1].key)}
            disabled={currentIndex === tabs.length - 1}
            className="px-6 shadow-lg"
          >
            下一步
            <ChevronRight size={20} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
