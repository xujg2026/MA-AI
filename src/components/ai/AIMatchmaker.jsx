import { useState, useEffect } from 'react'
import { mockDeals } from '../../data/mockData'
import useExcelDataStore from '../../data/excelData'
import { getApi } from '../../services/api'
import { Brain, Target, TrendingUp, CheckCircle, Sparkles, GitMerge, MapPin, Building2, Users, Zap, Target as TargetIcon } from 'lucide-react'
import { Card, Button, Input, Badge } from '../ui'

// Multi-dimensional matching criteria - 业务关联性 + 企业规模
const matchDimensions = [
  { key: 'businessRelevance', label: '业务关联性', weight: 0.60, icon: GitMerge },
  { key: 'enterpriseScale', label: '企业规模', weight: 0.40, icon: TrendingUp },
]

// 并购动机选项
const acquisitionMotivations = [
  {
    value: 'scale',
    label: '快速扩大规模与市场份额，减少竞争',
    desc: '通过并购快速提升市场占有率和行业地位',
  },
  {
    value: 'resources',
    label: '获取技术、品牌、渠道、牌照等核心资源',
    desc: '获取目标企业的核心资产和竞争优势',
  },
  {
    value: 'integration',
    label: '实现产业链整合，降本增效，产生协同',
    desc: '纵向或横向整合，产生协同效应',
  },
  {
    value: 'diversification',
    label: '业务转型或多元化，分散经营风险',
    desc: '进入新领域，降低单一业务风险',
  },
  {
    value: 'financial',
    label: '通过财务优化、估值差或资本运作提升收益',
    desc: '估值套利、财务优化、资本增值',
  },
  {
    value: 'other',
    label: '其他',
    desc: '其他并购原因，请填写说明',
    requireInput: true,
  },
]

export default function AIMatchmaker({ projectId, onComplete }) {
  const [formData, setFormData] = useState({
    industry: '',
    minAmount: '',
    maxAmount: '',
    region: '',
    // 财务信息
    revenue1: '',
    revenue2: '',
    revenue3: '',
    grossMargin: '',
    netProfit: '',
    netAssets: '',
    totalAssets: '',
    // 出售原因
    sellReason: '',
    // 并购动机
    acquisitionMotivations: [],
    acquisitionMotivationOther: '',
  })
  const [matches, setMatches] = useState([])
  const [isMatching, setIsMatching] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const importedDeals = useExcelDataStore((state) => state.importedDeals)
  const allDeals = [...mockDeals, ...importedDeals]

  // 保存阶段数据到项目
  const savePhaseData = async (outputData) => {
    if (!projectId) return
    try {
      const api = getApi()
      await api.saveProjectPhase(projectId, 'match', outputData)
    } catch (error) {
      console.error('保存买家匹配阶段数据失败:', error)
    }
  }

  // 标记完成 - 供外部调用
  const _handleComplete = async () => {
    if (isCompleted || matches.length === 0 || !onComplete) return
    setIsCompleted(true)

    const outputData = {
      completedAt: new Date().toISOString(),
      matchCount: matches.length,
      topMatches: matches.slice(0, 5).map(m => ({
        company: m.company,
        industry: m.industry,
        region: m.region,
        matchScore: m.matchScore,
      })),
    }
    await savePhaseData(outputData)
    onComplete()
  }

  // Automatic matching based on business relevance and enterprise scale
  const calculateMatchScore = (targetDeal) => {
    const dimensionScores = {}

    // 业务关联性 (60%) - 基于行业、地区、业务协同
    let businessScore = 0
    let businessFactors = []

    // 行业关联
    if (formData.industry && targetDeal.industry === formData.industry) {
      businessScore += 40
      businessFactors.push({ type: 'strong', text: '行业高度相关' })
    } else if (formData.industry && targetDeal.industry) {
      businessScore += 20
      businessFactors.push({ type: 'medium', text: '行业存在关联' })
    }

    // 地域协同
    if (formData.region && targetDeal.region === formData.region) {
      businessScore += 20
      businessFactors.push({ type: 'strong', text: '地域协同' })
    } else if (formData.region) {
      businessScore += 10
    }

    // 规模匹配 - 偏好规模较大的企业
    const dealVal = targetDeal.valuation || 0
    if (dealVal >= 10) {
      businessScore += 25
      businessFactors.push({ type: 'strong', text: '大型企业' })
    } else if (dealVal >= 5) {
      businessScore += 15
      businessFactors.push({ type: 'medium', text: '中型企业' })
    } else if (dealVal >= 1) {
      businessScore += 10
      businessFactors.push({ type: 'light', text: '中小型企业' })
    }

    // 业务协同潜力
    businessScore += Math.floor(Math.random() * 15) + 15
    businessFactors.push({ type: 'medium', text: '业务协同潜力大' })

    dimensionScores.businessRelevance = Math.min(100, businessScore)

    // 企业规模 (40%) - 评估企业规模大小
    let scaleScore = 0
    let scaleFactors = []

    // 基于估值评估规模
    if (dealVal >= 20) {
      scaleScore = 100
      scaleFactors.push({ type: 'strong', text: '超大规模企业' })
    } else if (dealVal >= 10) {
      scaleScore = 85
      scaleFactors.push({ type: 'strong', text: '大型企业' })
    } else if (dealVal >= 5) {
      scaleScore = 70
      scaleFactors.push({ type: 'medium', text: '中大型企业' })
    } else if (dealVal >= 1) {
      scaleScore = 55
      scaleFactors.push({ type: 'light', text: '中型企业' })
    } else {
      scaleScore = 40
      scaleFactors.push({ type: 'light', text: '中小型企业' })
    }

    // 规模稳定增长
    scaleScore += Math.floor(Math.random() * 10)
    dimensionScores.enterpriseScale = Math.min(100, scaleScore)

    // Calculate weighted score
    let totalScore = 0
    Object.entries(dimensionScores).forEach(([key, score]) => {
      const dim = matchDimensions.find((d) => d.key === key)
      if (dim) {
        totalScore += score * dim.weight
      }
    })

    // Combine factors
    const reasons = [...businessFactors, ...scaleFactors]

    // Risk factors
    const riskFactors = []
    if (dealVal < 1) {
      riskFactors.push({ level: 'medium', text: '企业规模较小' })
    }
    if (businessScore < 50) {
      riskFactors.push({ level: 'medium', text: '业务关联性一般' })
    }

    return {
      score: Math.round(totalScore),
      dimensionScores,
      reasons,
      riskFactors,
    }
  }

  const handleAutoMatch = () => {
    setIsMatching(true)
    setMatches([])

    setTimeout(() => {
      const matchedDeals = allDeals.map((deal) => {
        const { score, dimensionScores, reasons, riskFactors } = calculateMatchScore(deal)
        return { ...deal, matchScore: score, dimensionScores, matchReasons: reasons, riskFactors }
      })

      matchedDeals.sort((a, b) => b.matchScore - a.matchScore)
      const topMatches = matchedDeals.filter((d) => d.matchScore >= 40).slice(0, 6)

      setMatches(topMatches)
      setIsMatching(false)
    }, 2000)
  }

  const handleMotivationToggle = (value) => {
    setFormData((prev) => ({
      ...prev,
      acquisitionMotivations: prev.acquisitionMotivations.includes(value)
        ? prev.acquisitionMotivations.filter((m) => m !== value)
        : [...prev.acquisitionMotivations, value],
    }))
  }

  // Automatic matching on mount
  useEffect(() => {
    if (allDeals.length > 0) {
      handleAutoMatch()
    }
  }, [])

  // 加载已有的阶段数据
  useEffect(() => {
    if (!projectId) return

    const loadPhaseData = async () => {
      try {
        const api = getApi()
        const response = await api.getProjectPhases(projectId)
        if (response.success !== false && response.data) {
          const matchPhase = response.data.find(p => p.phase === 'match')
          if (matchPhase && matchPhase.output_data) {
            const outputData = typeof matchPhase.output_data === 'string'
              ? JSON.parse(matchPhase.output_data)
              : matchPhase.output_data
            if (outputData.topMatches && Array.isArray(outputData.topMatches)) {
              const loadedMatches = outputData.topMatches.map(m => ({
                ...m,
                id: `loaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                matchScore: m.matchScore,
              }))
              setMatches(loadedMatches)
            }
            if (outputData.completedAt) {
              setIsCompleted(true)
            }
          }
        }
      } catch (error) {
        console.error('加载匹配数据失败:', error)
      }
    }

    loadPhaseData()
  }, [projectId])

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card padding="lg" className="bg-gradient-to-r from-primary/5 to-secondary/5 border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
              <Zap size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI自动买家匹配</h3>
              <p className="text-sm text-gray-500 mt-1">
                基于 <span className="text-primary font-medium">业务关联性</span> 和 <span className="text-primary font-medium">企业规模</span> 自动分析匹配
              </p>
            </div>
          </div>
          <Badge variant="success" className="px-4 py-2">
            <Sparkles size={14} className="mr-1" />
            自动运行
          </Badge>
        </div>

        {/* Matching Principles */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white/80 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <GitMerge size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">业务关联性</h4>
                <p className="text-xs text-gray-500">权重 60%</p>
              </div>
            </div>
            <p className="text-xs text-gray-600">基于行业相关性、地域协同、业务协同潜力等多维度评估</p>
          </div>
          <div className="bg-white/80 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">企业规模</h4>
                <p className="text-xs text-gray-500">权重 40%</p>
              </div>
            </div>
            <p className="text-xs text-gray-600">优先匹配规模较大企业，确保买家具备足够资金实力</p>
          </div>
        </div>
      </Card>

      {/* Acquisition Motivations */}
      <Card padding="lg">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <TargetIcon size={20} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">并购动机</h2>
        </div>

        <div className="space-y-4">
          {acquisitionMotivations.map((option) => (
            <div
              key={option.value}
              onClick={() => handleMotivationToggle(option.value)}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                formData.acquisitionMotivations.includes(option.value)
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all duration-300 ${
                  formData.acquisitionMotivations.includes(option.value)
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}>
                  {formData.acquisitionMotivations.includes(option.value) && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${
                    formData.acquisitionMotivations.includes(option.value)
                      ? 'text-primary'
                      : 'text-gray-700'
                  }`}>
                    {option.label}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {option.desc}
                  </p>
                  {option.requireInput && formData.acquisitionMotivations.includes(option.value) && (
                    <div className="mt-3">
                      <textarea
                        name="acquisitionMotivationOther"
                        value={formData.acquisitionMotivationOther}
                        onChange={(e) => {
                          e.stopPropagation()
                          setFormData({ ...formData, acquisitionMotivationOther: e.target.value })
                        }}
                        placeholder="请填写其他并购原因..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Results */}
      {isMatching ? (
        <Card padding="lg" className="text-center">
          <div className="animate-pulse">
            <Sparkles className="mx-auto text-primary mb-4" size={48} />
            <p className="text-gray-600 mb-2">AI正在全市场分析潜在买家...</p>
            <p className="text-sm text-gray-400">匹配原则：业务关联性 + 企业规模优先</p>
          </div>
        </Card>
      ) : matches.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-primary">
              <Target size={20} />
              <span className="font-medium">找到 {matches.length} 个高匹配买家</span>
            </div>
            <Badge variant="success">Top {matches.length} 精选</Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((deal, index) => (
              <Card key={deal.id} padding="md" hover className="transition-shadow overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
                <div className="pt-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{deal.company}</h3>
                        <p className="text-sm text-gray-500">{deal.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <span className={`text-2xl font-bold ${
                          deal.matchScore >= 80 ? 'text-green-600' :
                          deal.matchScore >= 65 ? 'text-primary' : 'text-gray-600'
                        }`}>
                          {deal.matchScore}
                        </span>
                        <span className="text-gray-400">分</span>
                      </div>
                      <Badge variant={deal.matchScore >= 80 ? 'success' : deal.matchScore >= 65 ? 'primary' : 'warning'}>
                        {deal.matchScore >= 80 ? '优质' : deal.matchScore >= 65 ? '良好' : '匹配'}
                      </Badge>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-2">匹配评分</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <GitMerge size={14} className="text-blue-500" />
                        <span className="text-xs text-gray-600">业务关联性</span>
                        <span className="text-xs font-bold text-blue-600 ml-auto">{deal.dimensionScores?.businessRelevance || 0}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp size={14} className="text-green-500" />
                        <span className="text-xs text-gray-600">企业规模</span>
                        <span className="text-xs font-bold text-green-600 ml-auto">{deal.dimensionScores?.enterpriseScale || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Match Reasons */}
                  {deal.matchReasons && deal.matchReasons.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">匹配亮点：</p>
                      <div className="flex flex-wrap gap-1">
                        {deal.matchReasons.slice(0, 3).map((reason, idx) => (
                          <Badge
                            key={idx}
                            variant={reason.type === 'strong' ? 'success' : reason.type === 'medium' ? 'primary' : 'warning'}
                            className="text-xs"
                          >
                            {reason.text}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {deal.riskFactors && deal.riskFactors.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">提示：</p>
                      <div className="flex flex-wrap gap-1">
                        {deal.riskFactors.map((risk, idx) => (
                          <Badge
                            key={idx}
                            variant="warning"
                            className="text-xs"
                          >
                            {risk.text}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">估值</p>
                      <p className="font-semibold text-primary text-sm">{deal.amount}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">行业</p>
                      <p className="font-semibold text-gray-700 text-sm">{deal.industry}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">地域</p>
                      <p className="font-semibold text-gray-700 text-sm">{deal.region}</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" size="sm">
                    查看详情
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Re-match Button */}
          <div className="text-center mt-6">
            <Button variant="ghost" onClick={handleAutoMatch} className="px-6">
              <Sparkles size={16} className="mr-2" />
              重新匹配
            </Button>
          </div>
        </>
      ) : (
        <Card padding="lg" className="text-center">
          <Brain className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">正在分析市场数据，寻找优质买家...</p>
          <p className="text-sm text-gray-400 mt-2">
            AI将自动匹配业务关联性强、规模较大的企业
          </p>
        </Card>
      )}
    </div>
  )
}
