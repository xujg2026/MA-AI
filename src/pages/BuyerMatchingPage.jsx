import { useState, useEffect } from 'react'
import AIDueDiligence from '../components/ai/AIDueDiligence'
import AIValuation from '../components/ai/AIValuation'
import AIMatchmaker from '../components/ai/AIMatchmaker'
import DDReportGenerator from '../components/ai/DDReportGenerator'
import BuyerMatchInputPage from './BuyerMatchInputPage'
import { FileCheck, DollarSign, Users, FileText, Sparkles, FileSignature, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { Card, Badge, Button } from '../components/ui'

const tabs = [
  { key: 'protocol', label: '协议签署', icon: FileSignature, desc: '签署并购协议' },
  { key: 'due-diligence', label: '尽职调查', icon: FileCheck, desc: '全面风险评估' },
  { key: 'valuation', label: '企业估值', icon: DollarSign, desc: '精准价值评估' },
  { key: 'match', label: '买家匹配', icon: Users, desc: '智能匹配买家' },
  { key: 'report', label: '推荐书生产', icon: FileText, desc: '生成推荐书' },
]

export default function BuyerMatchingPage() {
  const [activeTab, setActiveTab] = useState('protocol')
  const [completedSteps, setCompletedSteps] = useState({
    'protocol': false,
    'due-diligence': false,
    'valuation': false,
    'match': false,
    'report': false,
  })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const markComplete = (tab) => {
    setCompletedSteps({ ...completedSteps, [tab]: true })
  }

  const currentIndex = tabs.findIndex(t => t.key === activeTab)

  const renderContent = () => {
    switch (activeTab) {
      case 'protocol':
        return (
          <Card padding="lg" className="text-center">
            <div className="py-12">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                  <FileSignature size={48} className="text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">协议签署</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                并购协议签署功能开发中，敬请期待...
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-500">
                <Sparkles size={14} className="text-primary" />
                <span>功能即将上线</span>
              </div>
            </div>
          </Card>
        )
      case 'due-diligence':
        return <AIDueDiligence onComplete={() => markComplete('due-diligence')} />
      case 'valuation':
        return <AIValuation onComplete={() => markComplete('valuation')} />
      case 'match':
        return <BuyerMatchInputPage />
      case 'match-input':
        return <BuyerMatchInputPage />
      case 'report':
        return <DDReportGenerator onComplete={() => markComplete('report')} />
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
