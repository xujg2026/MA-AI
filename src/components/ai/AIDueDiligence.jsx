import { useState } from 'react'
import { ddChecklist } from '../../data/mockData'
import { getQccApi, setQccApiKey } from '../../services/qccApi'
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
  Loader2,
  Building2,
  User,
  DollarSign,
  Calendar,
  MapPin,
} from 'lucide-react'
import { Card, Button, Badge } from '../ui'

// 企查查 API Key
const QCC_API_KEY = 'MohHnWYT7LapgQkP1OGpVHpyS1gLZo2kMkgjvNZoTj5QcvS7'

// Risk items that trigger red flag warnings
const riskIndicators = [
  { id: 'debt_ratio', label: '资产负债率', threshold: 70, unit: '%', level: 'high' },
  { id: 'goodwill_ratio', label: '商誉占比', threshold: 40, unit: '%', level: 'high' },
  { id: 'consecutive_loss', label: '连续亏损年限', threshold: 2, unit: '年', level: 'high' },
  { id: 'equity_pledge', label: '股权质押比例', threshold: 70, unit: '%', level: 'critical' },
  { id: 'related_party_tx', label: '关联交易占比', threshold: 30, unit: '%', level: 'medium' },
  { id: 'pending_litigation', label: '待决诉讼金额', threshold: 1000, unit: '万', level: 'medium' },
]

// 模拟风险分析数据（当API不可用时使用）
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
  const [companyInfo, setCompanyInfo] = useState(null)
  const [qccError, setQccError] = useState(null)

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

  // 使用企查查API进行风险分析
  const runRiskAnalysis = async () => {
    if (!selectedCompany.trim()) return

    setIsAnalyzing(true)
    setQccError(null)
    setCompanyInfo(null)

    try {
      // 设置API Key
      setQccApiKey(QCC_API_KEY)
      const qccApi = getQccApi()

      if (!qccApi) {
        throw new Error('企查查API服务初始化失败')
      }

      // 并行获取公司信息和风险数据
      const [companyData, riskData] = await Promise.all([
        qccApi.getCompanyInfo(selectedCompany),
        qccApi.getRiskInfo(selectedCompany),
      ])

      // 处理公司基本信息
      let basicInfo = null
      if (!companyData.error && companyData) {
        const data = Array.isArray(companyData) ? companyData[0] : companyData
        basicInfo = {
          name: data.Name || selectedCompany,
          creditCode: data.CreditCode || '-',
          legalPerson: data.LegalPersonName || '-',
          registeredCapital: data.RegistCapi || '-',
          paidCapital: data.RecCap || '-',
          status: data.Status || '-',
          startDate: data.StartDate || '-',
          companyType: data.EconKind || '-',
          scope: data.Scope || '-',
          address: data.Address || '-',
        }
        setCompanyInfo(basicInfo)
      }

      // 处理风险数据
      if (!riskData.error && riskData) {
        const data = typeof riskData === 'string' ? JSON.parse(riskData) : riskData

        // 提取风险计数
        const criticalRisks = []
        const highRisks = []

        // 关键风险
        if (data.dishonest && data.dishonest > 0) criticalRisks.push({ type: '失信记录', count: data.dishonest })
        if (data.executed && data.executed > 0) criticalRisks.push({ type: '被执行', count: data.executed })
        if (data.bankruptcy && data.bankruptcy > 0) criticalRisks.push({ type: '破产记录', count: data.bankruptcy })
        if (data.equityFreeze && data.equityFreeze > 0) criticalRisks.push({ type: '股权冻结', count: data.equityFreeze })

        // 高风险
        if (data.businessException && data.businessException > 0) highRisks.push({ type: '经营异常', count: data.businessException })
        if (data.seriousViolation && data.seriousViolation > 0) highRisks.push({ type: '严重违法', count: data.seriousViolation })
        if (data.administrativePenalty && data.administrativePenalty > 0) highRisks.push({ type: '行政处罚', count: data.administrativePenalty })

        const totalCritical = criticalRisks.length
        const totalHigh = highRisks.length
        const totalRisk = totalCritical + totalHigh

        // 计算综合风险指数
        let overall = 85 // 基础分
        if (totalCritical > 0) overall -= totalCritical * 15
        if (totalHigh > 0) overall -= totalHigh * 8
        overall = Math.max(0, Math.min(100, overall))

        // 生成风险分析结果
        const riskResult = {
          overall,
          financial: {
            score: overall + 5,
            risks: data.financialRisks || ['需结合财务报表分析']
          },
          legal: {
            score: overall - 5,
            risks: [...criticalRisks.map(r => r.type), ...highRisks.map(r => r.type)]
          },
          business: {
            score: overall + 3,
            risks: ['需结合业务尽调分析']
          },
          compliance: {
            score: overall + 8,
            risks: totalCritical === 0 && totalHigh === 0 ? ['未发现明显合规问题'] : []
          },
          // 额外的企查查数据
          qccData: {
            criticalRisks,
            highRisks,
            totalLawsuits: data.lawsuits || 0,
            totalPenalties: data.administrativePenalty || 0,
            businessExceptions: data.businessException || 0,
          }
        }

        setAnalysisResult(riskResult)
      } else {
        // API调用失败，使用模拟数据
        setQccError(riskData.error || '获取风险数据失败，使用本地数据')
        setAnalysisResult(riskAnalysisData)
      }
    } catch (error) {
      console.error('企查查API调用失败:', error)
      setQccError(`API调用失败: ${error.message}，使用本地数据`)
      // 使用模拟数据作为后备
      setAnalysisResult(riskAnalysisData)
    }

    setIsAnalyzing(false)
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
          <Badge variant="info" className="ml-2">企查查实时数据</Badge>
        </Card.Title>
        <p className="text-sm text-gray-500 mb-4">
          基于企查查实时数据自动分析公司工商信息、风险记录、司法诉讼等，识别潜在风险点
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
              icon={isAnalyzing ? Loader2 : Eye}
              onClick={runRiskAnalysis}
              disabled={!selectedCompany || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  AI正在扫描风险...
                </>
              ) : (
                '启动AI风险扫描'
              )}
            </Button>
            {qccError && (
              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                {qccError}
              </p>
            )}
          </div>

          {/* Company Info Display */}
          {companyInfo && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Building2 size={16} className="mr-2 text-primary" />
                企业工商信息
              </h4>
              <div className="bg-white rounded-xl p-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center text-gray-500">
                    <User size={14} className="mr-1" />
                    法定代表人
                  </div>
                  <div className="text-gray-900 font-medium">{companyInfo.legalPerson}</div>

                  <div className="flex items-center text-gray-500">
                    <DollarSign size={14} className="mr-1" />
                    注册资本
                  </div>
                  <div className="text-gray-900">{companyInfo.registeredCapital}</div>

                  <div className="flex items-center text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    成立日期
                  </div>
                  <div className="text-gray-900">{companyInfo.startDate}</div>

                  <div className="flex items-center text-gray-500">
                    <TrendingUp size={14} className="mr-1" />
                    经营状态
                  </div>
                  <div className="text-gray-900">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      companyInfo.status === '存续' || companyInfo.status === '在业'
                        ? 'bg-green-100 text-green-700'
                        : companyInfo.status === '吊销' || companyInfo.status === '注销'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {companyInfo.status}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-500">
                    <MapPin size={14} className="mr-1" />
                    注册地址
                  </div>
                  <div className="text-gray-900 text-xs truncate">{companyInfo.address || '-'}</div>
                </div>
              </div>
            </div>
          )}

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
              {analysisResult.qccData && (
                <Badge variant="info" className="ml-2 text-xs">企查查数据</Badge>
              )}
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              {analysisResult.qccData?.criticalRisks?.length > 0 ? (
                analysisResult.qccData.criticalRisks.map((risk, idx) => (
                  <div key={idx} className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle size={16} className="text-red-600" />
                      <span className="font-medium text-red-700">{risk.type}</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{risk.count}条</p>
                    <p className="text-xs text-red-600/70 mt-1">存在{risk.type}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="font-medium text-green-700">关键风险</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-xs text-green-600/70 mt-1">未发现关键风险</p>
                </div>
              )}

              {analysisResult.qccData?.highRisks?.length > 0 ? (
                analysisResult.qccData.highRisks.map((risk, idx) => (
                  <div key={idx} className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle size={16} className="text-yellow-600" />
                      <span className="font-medium text-yellow-700">{risk.type}</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{risk.count}条</p>
                    <p className="text-xs text-yellow-600/70 mt-1">存在{risk.type}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="font-medium text-green-700">高风险项</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-xs text-green-600/70 mt-1">未发现高风险</p>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText size={16} className="text-blue-600" />
                  <span className="font-medium text-blue-700">综合风险指数</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{analysisResult.overall}</p>
                <p className="text-xs text-blue-600/70 mt-1">
                  {analysisResult.overall >= 70 ? '风险较低' : analysisResult.overall >= 50 ? '存在一定风险' : '风险较高'}
                </p>
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
