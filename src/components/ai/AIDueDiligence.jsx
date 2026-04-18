import { useState } from 'react'
import { ddChecklist } from '../../data/mockData'
import {
  FileText,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronRight,
  Download,
  Search,
  AlertTriangle,
  Shield,
  TrendingUp,
  AlertCircle,
  Eye,
} from 'lucide-react'
import { Card, Button, Badge } from '../ui'

// Risk items that trigger red flag warnings
const riskIndicators = [
  { id: 'debt_ratio', label: '资产负债率', threshold: 70, unit: '%', level: 'high' },
  { id: 'goodwill_ratio', label: '商誉占比', threshold: 40, unit: '%', level: 'high' },
  { id: 'consecutive_loss', label: '连续亏损年限', threshold: 2, unit: '年', level: 'high' },
  { id: 'equity_pledge', label: '股权质押比例', threshold: 70, unit: '%', level: 'critical' },
  { id: 'related_party_tx', label: '关联交易占比', threshold: 30, unit: '%', level: 'medium' },
  { id: 'pending_litigation', label: '待决诉讼金额', threshold: 1000, unit: '万', level: 'medium' },
]

// Simulated risk analysis data
const riskAnalysisData = {
  overall: 72,
  financial: { score: 75, risks: ['应收账款周转率下降', '存货占比偏高'] },
  legal: { score: 68, risks: ['股权质押比例过高', '存在未披露担保'] },
  business: { score: 80, risks: ['客户集中度偏高', '供应商依赖度较高'] },
  compliance: { score: 85, risks: ['环评资质待续期'] },
}

const riskHeatMap = [
  { area: '财务健康', score: 85, status: 'low', trend: '+5%' },
  { area: '业务协同', score: 72, status: 'medium', trend: '+12%' },
  { area: '地域匹配', score: 90, status: 'low', trend: '+0%' },
  { area: '行业前景', score: 78, status: 'medium', trend: '+8%' },
  { area: '团队稳定性', score: 65, status: 'high', trend: '-3%' },
  { area: '合规风险', score: 88, status: 'low', trend: '+2%' },
]

export default function AIDueDiligence({ onComplete }) {
  const [expandedSections, setExpandedSections] = useState(['财务', '法务'])
  const [checkedItems, setCheckedItems] = useState({})
  const [customItem, setCustomItem] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)

  const toggleSection = (section) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    )
  }

  const toggleItem = (section, item) => {
    const key = `${section}-${item}`
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const addCustomItem = (section) => {
    if (!customItem.trim()) return
    const key = `${section}-${customItem}`
    setCheckedItems((prev) => ({ ...prev, [key]: true }))
    setCustomItem('')
  }

  const getProgress = (section) => {
    const items = ddChecklist[section] || []
    const checked = items.filter((item) => checkedItems[`${section}-${item}`]).length
    return { checked, total: items.length }
  }

  const getOverallProgress = () => {
    const totalItems = Object.values(ddChecklist).flat().length
    const checkedCount = Object.values(checkedItems).filter(Boolean).length
    return { checked: checkedCount, total: totalItems }
  }

  const filteredSections = Object.keys(ddChecklist).filter((section) =>
    section.includes(searchTerm) ||
    ddChecklist[section].some((item) => item.includes(searchTerm))
  )

  const overall = getOverallProgress()
  const progressPercent = overall.total > 0 ? Math.round((overall.checked / overall.total) * 100) : 0

  // Simulate AI risk analysis
  const runRiskAnalysis = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setAnalysisResult(riskAnalysisData)
      setIsAnalyzing(false)
    }, 2000)
  }

  const getRiskStatusColor = (status) => {
    switch (status) {
      case 'low': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'high': return 'bg-red-100 text-red-700'
      case 'critical': return 'bg-red-200 text-red-800'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card padding="md" className="bg-gradient-to-br from-primary/5 to-transparent">
          <p className="text-sm text-gray-500 mb-1">完成进度</p>
          <p className="text-2xl font-bold text-primary">{progressPercent}%</p>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </Card>
        <Card padding="md" className="bg-gradient-to-br from-green-50 to-transparent">
          <p className="text-sm text-gray-500 mb-1">已完成</p>
          <p className="text-2xl font-bold text-green-600">{overall.checked}</p>
        </Card>
        <Card padding="md" className="bg-gradient-to-br from-orange-50 to-transparent">
          <p className="text-sm text-gray-500 mb-1">待完成</p>
          <p className="text-2xl font-bold text-orange-600">{overall.total - overall.checked}</p>
        </Card>
        <Card padding="md" className="bg-gradient-to-br from-red-50 to-transparent">
          <p className="text-sm text-gray-500 mb-1">风险提示</p>
          <p className="text-2xl font-bold text-red-600 flex items-center gap-1">
            <AlertTriangle size={20} />
            {Math.floor((overall.total - overall.checked) * 0.2)}
          </p>
        </Card>
      </div>

      {/* AI Risk Analysis Section */}
      <Card padding="lg" className="bg-gradient-to-r from-slate-50 to-blue-50">
        <Card.Title className="flex items-center mb-4">
          <Shield size={24} className="mr-2 text-primary" />
          AI风险扫描
        </Card.Title>
        <p className="text-sm text-gray-500 mb-4">
          基于NLP技术自动分析财报、合同、诉讼、税务等文档，识别潜在风险点
        </p>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Company Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                输入目标公司名称
              </label>
              <input
                type="text"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                placeholder="例如：北京智云科技有限公司"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              />
            </div>
            <Button
              variant="primary"
              icon={Eye}
              onClick={runRiskAnalysis}
              disabled={!selectedCompany || isAnalyzing}
            >
              {isAnalyzing ? 'AI正在扫描风险...' : '启动AI风险扫描'}
            </Button>
          </div>

          {/* Risk Heat Map */}
          {analysisResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">风险热力图</h4>
                <Badge variant={analysisResult.overall >= 70 ? 'success' : analysisResult.overall >= 50 ? 'warning' : 'danger'}>
                  综合风险指数: {analysisResult.overall}
                </Badge>
              </div>
              <div className="space-y-2">
                {riskHeatMap.map((item) => (
                  <div key={item.area} className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <span className="text-sm text-gray-700">{item.area}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            item.status === 'low' ? 'bg-green-500' :
                            item.status === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${getRiskStatusColor(item.status)}`}>
                        {item.score}%
                      </span>
                      <span className={`text-xs ${item.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {item.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Red Flags Section */}
        {analysisResult && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle size={18} className="mr-2 text-red-500" />
              红线预警（需重点关注）
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle size={16} className="text-red-600" />
                  <span className="font-medium text-red-700">股权质押比例</span>
                </div>
                <p className="text-2xl font-bold text-red-600">72%</p>
                <p className="text-xs text-red-600/70 mt-1">超过70%预警线</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle size={16} className="text-yellow-600" />
                  <span className="font-medium text-yellow-700">商誉占比</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">35%</p>
                <p className="text-xs text-yellow-600/70 mt-1">接近40%预警线</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="font-medium text-green-700">连续亏损</span>
                </div>
                <p className="text-2xl font-bold text-green-600">0年</p>
                <p className="text-xs text-green-600/70 mt-1">经营正常</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Search */}
      <Card padding="md">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索DD清单项目..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-gray-50/50"
          />
        </div>
      </Card>

      {/* Checklist Sections */}
      <div className="space-y-4">
        {(searchTerm ? filteredSections : Object.keys(ddChecklist)).map((section) => {
          const items = ddChecklist[section] || []
          const progress = getProgress(section)
          const isExpanded = expandedSections.includes(section)

          return (
            <Card key={section} padding="none">
              <button
                onClick={() => toggleSection(section)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {isExpanded ? (
                    <ChevronDown size={20} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-400" />
                  )}
                  <span className="font-semibold text-gray-900">{section}</span>
                  <span className="text-sm text-gray-500">
                    ({progress.checked}/{progress.total})
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(progress.checked / progress.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-green-600 font-medium">
                    {Math.round((progress.checked / progress.total) * 100)}%
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100">
                  <div className="p-4 space-y-2">
                    {items.map((item) => {
                      const key = `${section}-${item}`
                      const isChecked = checkedItems[key]
                      return (
                        <label
                          key={item}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked || false}
                            onChange={() => toggleItem(section, item)}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          {isChecked ? (
                            <CheckCircle size={18} className="text-green-500" />
                          ) : (
                            <Circle size={18} className="text-gray-300" />
                          )}
                          <span className={`text-sm ${isChecked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {item}
                          </span>
                        </label>
                      )
                    })}

                    {/* Add Custom Item */}
                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                      <input
                        type="text"
                        value={customItem}
                        onChange={(e) => setCustomItem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomItem(section)}
                        placeholder="添加自定义清单项..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-gray-50/50"
                      />
                      <Button variant="primary" size="sm" onClick={() => addCustomItem(section)}>
                        添加
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <Button variant="primary" icon={Download}>
          导出DD清单
        </Button>
      </div>
    </div>
  )
}
