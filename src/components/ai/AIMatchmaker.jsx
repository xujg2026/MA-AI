import { useState, useEffect } from 'react'
import { getApi } from '../../services/api'
import useProjectStore from '../../stores/projectStore'
import { Brain, Target, TrendingUp, CheckCircle, Sparkles, GitMerge, MapPin, Building2, Users, Zap, Target as TargetIcon, AlertCircle, BarChart3 } from 'lucide-react'
import { Card, Button, Input, Badge } from '../ui'

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

// 评级徽章颜色
const gradeColors = {
  'S': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  'A': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  'B': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  'C': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  'D': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
}

export default function AIMatchmaker({ projectId, onComplete }) {
  const [formData, setFormData] = useState({
    acquisitionMotivations: [],
    acquisitionMotivationOther: '',
  })
  const [matches, setMatches] = useState([])
  const [isMatching, setIsMatching] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [error, setError] = useState(null)
  const [screeningReport, setScreeningReport] = useState(null)
  const [isCached, setIsCached] = useState(false)
  const [cacheInfo, setCacheInfo] = useState(null)

  const { projects = [], fetchProjects } = useProjectStore()

  // 获取当前项目信息
  const currentProject = projects.find(p => p.id === projectId)

  // 保存阶段数据到项目
  const savePhaseData = async (outputData) => {
    if (!projectId) return
    try {
      const api = getApi()
      await api.saveProjectPhase(projectId, 'match', outputData)
    } catch (err) {
      console.error('保存买家匹配阶段数据失败:', err)
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
        company: m.companyName,
        industry: m.industry,
        region: m.region || '-',
        matchScore: m.overallScore,
      })),
    }
    await savePhaseData(outputData)
    onComplete()
  }

  // 调用后端API进行买家筛选
  const runBuyerScreening = async (forceRefresh = false) => {
    if (!currentProject) {
      setError('请先选择项目')
      return
    }

    setIsMatching(true)
    setError(null)
    setMatches([])

    try {
      const api = getApi()
      const response = await api.getScreeningAgent({
        targetCompany: {
          name: currentProject.company_name || currentProject.name,
          industry: currentProject.industry,
          mainBusiness: currentProject.main_business,
          estimatedValue: currentProject.estimated_value || currentProject.valuation,
          region: currentProject.region,
        },
        limit: 10,
        forceRefresh,
      })

      if (response.success !== false && response.data?.screeningReport) {
        const report = response.data.screeningReport
        setScreeningReport(report)
        setMatches(report.finalRecommendations || [])
        // 处理缓存状态
        if (response.data._cached) {
          setIsCached(true)
          setCacheInfo({
            id: response.data._cacheId,
            createdAt: response.data._cacheCreatedAt,
          })
        } else {
          setIsCached(false)
          setCacheInfo(null)
        }
      } else {
        setError(response.error || '获取买家匹配结果失败')
      }
    } catch (err) {
      console.error('买家筛选API调用失败:', err)
      setError('网络请求失败: ' + (err.message || '未知错误'))
    } finally {
      setIsMatching(false)
    }
  }

  const handleMotivationToggle = (value) => {
    setFormData((prev) => ({
      ...prev,
      acquisitionMotivations: prev.acquisitionMotivations.includes(value)
        ? prev.acquisitionMotivations.filter((m) => m !== value)
        : [...prev.acquisitionMotivations, value],
    }))
  }

  // 项目变化时自动运行筛选
  useEffect(() => {
    if (projectId && currentProject) {
      runBuyerScreening()
    }
  }, [projectId, currentProject?.id])

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
                overallScore: m.matchScore,
              }))
              setMatches(loadedMatches)
            }
            if (outputData.completedAt) {
              setIsCompleted(true)
            }
          }
        }
      } catch (err) {
        console.error('加载匹配数据失败:', err)
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
      {error && (
        <Card padding="lg" className="border-red-200 bg-red-50">
          <div className="flex items-center text-red-600">
            <AlertCircle size={20} className="mr-2" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {isMatching ? (
        <Card padding="lg" className="text-center">
          <div className="animate-pulse">
            <Sparkles className="mx-auto text-primary mb-4" size={48} />
            <p className="text-gray-600 mb-2">AI正在全市场分析潜在买家...</p>
            <p className="text-sm text-gray-400">基于A股上市公司数据库 + 财务数据 + 并购历史分析</p>
            {currentProject && (
              <p className="text-xs text-gray-400 mt-1">目标公司：{currentProject.company_name || currentProject.name}</p>
            )}
          </div>
        </Card>
      ) : matches.length > 0 ? (
        <>
          {/* Screening Report Summary */}
          {screeningReport && (
            <Card padding="md" className="mb-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <BarChart3 size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">筛选报告</p>
                      {isCached && (
                        <Badge variant="primary" className="text-xs">缓存</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      候选 {screeningReport.totalCandidates} 家 | 通过初筛 {screeningReport.passedFirstStep} 家
                      {cacheInfo && (
                        <span className="ml-2 text-primary">（{new Date(cacheInfo.createdAt).toLocaleString()} 生成）</span>
                      )}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{screeningReport.screeningDate}</p>
              </div>
            </Card>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-primary">
              <Target size={20} />
              <span className="font-medium">找到 {matches.length} 个高匹配买家</span>
            </div>
            <Badge variant="success">Top {matches.length} 精选</Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((buyer, index) => {
              const gradeStyle = gradeColors[buyer.grade] || gradeColors['B']
              return (
                <Card key={buyer.stockCode || index} padding="md" hover className="transition-shadow overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${index === 0 ? 'from-purple-500 to-pink-500' : index === 1 ? 'from-blue-500 to-cyan-500' : 'from-primary to-secondary'}`} />
                  <div className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${index === 0 ? 'from-purple-500 to-pink-500' : index === 1 ? 'from-blue-500 to-cyan-500' : 'from-primary to-secondary'} rounded-xl flex items-center justify-center text-white font-bold shadow-lg`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{buyer.companyName}</h3>
                          <p className="text-xs text-gray-500">{buyer.stockCode} {buyer.exchange === 'SH' ? '上交所' : buyer.exchange === 'SZ' ? '深交所' : buyer.exchange === 'BJ' ? '北交所' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <span className={`text-2xl font-bold ${
                            buyer.overallScore >= 75 ? 'text-green-600' :
                            buyer.overallScore >= 65 ? 'text-primary' : 'text-gray-600'
                          }`}>
                            {buyer.overallScore}
                          </span>
                          <span className="text-gray-400">分</span>
                        </div>
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${gradeStyle.bg} ${gradeStyle.text} border ${gradeStyle.border}`}>
                          {buyer.grade}级
                        </span>
                      </div>
                    </div>

                    {/* Main Business */}
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{buyer.mainBusiness}</p>

                    {/* Score Breakdown */}
                    <div className="mb-3 p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-2">评分明细</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <GitMerge size={14} className="text-blue-500" />
                          <span className="text-xs text-gray-600">战略协同性</span>
                          <span className="text-xs font-bold text-blue-600 ml-auto">{buyer.strategicAlignmentScore || 0}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp size={14} className="text-green-500" />
                          <span className="text-xs text-gray-600">财务健康度</span>
                          <span className="text-xs font-bold text-green-600 ml-auto">{buyer.financialHealthScore || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Key Strengths */}
                    {buyer.keyStrengths && buyer.keyStrengths.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">核心优势：</p>
                        <div className="flex flex-wrap gap-1">
                          {buyer.keyStrengths.slice(0, 3).map((strength, idx) => (
                            <Badge key={idx} variant="success" className="text-xs">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Main Concerns */}
                    {buyer.mainConcerns && buyer.mainConcerns.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">需关注：</p>
                        <div className="flex flex-wrap gap-1">
                          {buyer.mainConcerns.slice(0, 2).map((concern, idx) => (
                            <Badge key={idx} variant="warning" className="text-xs">
                              {concern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button variant="outline" className="w-full" size="sm">
                      查看详情
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Re-match Button */}
          <div className="text-center mt-6 flex justify-center gap-3">
            <Button variant="ghost" onClick={() => runBuyerScreening(true)} className="px-6">
              <Sparkles size={16} className="mr-2" />
              {isCached ? '强制刷新缓存' : '重新筛选'}
            </Button>
            {isCached && (
              <Button variant="outline" onClick={() => runBuyerScreening(false)} className="px-6">
                使用缓存结果
              </Button>
            )}
          </div>
        </>
      ) : !error && !isMatching ? (
        <Card padding="lg" className="text-center">
          <Brain className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">暂无匹配结果</p>
          <p className="text-sm text-gray-400 mt-2">
            请确保项目信息完整后重新筛选
          </p>
          <Button variant="outline" onClick={runBuyerScreening} className="mt-4">
            <Sparkles size={16} className="mr-2" />
            重新筛选
          </Button>
        </Card>
      ) : null}
    </div>
  )
}
