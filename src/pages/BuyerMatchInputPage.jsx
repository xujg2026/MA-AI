import { useState, useEffect } from 'react'
import { Building2, DollarSign, Users, TrendingUp, Target, CheckCircle, ChevronRight, Sparkles, Shield, Database, Briefcase, AlertCircle, FileText, Search, Loader2 } from 'lucide-react'
import { Card, Badge, Button, Input } from '../components/ui'
import { getApi } from '../services/api'

// 买家梯队数据
const buyerTiers = [
  {
    tier: 1,
    name: '第一梯队',
    subtitle: '最优匹配',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: Crown,
    buyers: [
      { name: '同行业头部上市企业', desc: '横向整合补短板，强化龙头地位' },
      { name: '上下游关联行业龙头', desc: '纵向一体化布局，降低供应链成本' },
      { name: '国际行业巨头', desc: '抢占本土市场，快速切入' },
    ],
    coreMotivation: '协同价值最大化，业绩增量提升',
    matchScore: 95,
  },
  {
    tier: 2,
    name: '第二梯队',
    subtitle: '次优匹配',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Briefcase,
    buyers: [
      { name: '细分赛道龙头企业', desc: '同行整合扩大市场' },
      { name: '行业专项并购基金', desc: '财务投资，IPO/并购退出' },
      { name: '地方国资产业平台', desc: '区域产业布局，保值增值' },
    ],
    coreMotivation: '资金保障稳定，落地效率高',
    matchScore: 80,
  },
  {
    tier: 3,
    name: '第三梯队',
    subtitle: '潜在买家',
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: AlertCircle,
    buyers: [
      { name: '跨界转型上市公司', desc: '快速切入新赛道' },
      { name: '大型综合投资集团', desc: '多元化布局分散风险' },
      { name: '央企/国企产业平台', desc: '丰富业务结构，补充短板' },
    ],
    coreMotivation: '战略布局需求，需谨慎评估',
    matchScore: 60,
  },
  {
    tier: 4,
    name: '第四梯队',
    subtitle: '排除名单',
    color: 'from-red-500 to-rose-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: Shield,
    buyers: [
      { name: '小型财务PE/个人资本', desc: '资金不足，排除' },
      { name: '亏损/经营困难企业', desc: '无收购能力，排除' },
      { name: '非关联行业机构', desc: '无协同，仅投机，排除' },
    ],
    coreMotivation: '风险较高，不建议对接',
    matchScore: 30,
  },
]

function Crown({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 1L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 1Z" />
    </svg>
  )
}

export default function BuyerMatchInputPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [step, setStep] = useState(1) // 1: 输入信息, 2: 匹配结果
  const [isMatching, setIsMatching] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    revenue: '',
    netProfit: '',
    equity: '',
    teamSize: '',
    hasQualification: false,
    hasTechAdvantage: false,
    location: '',
  })
  const [matchResult, setMatchResult] = useState(null)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value })
  }

  // 计算匹配度
  const calculateMatch = () => {
    let score = 70
    if (formData.revenue > 10000) score += 10
    if (formData.netProfit > 1000) score += 10
    if (formData.hasQualification) score += 5
    if (formData.hasTechAdvantage) score += 5
    return Math.min(100, score)
  }

  // 执行匹配
  const handleMatch = async () => {
    setIsMatching(true)
    try {
      const api = getApi()

      // 并行调用买家画像和筛选接口
      const [profileRes, screenRes] = await Promise.all([
        api.getBuyerProfile(formData.companyName),
        api.screenBuyers({
          companyName: formData.companyName,
          industry: formData.industry,
          region: formData.location,
          valuation: formData.equity,
          mainCerts: formData.hasQualification ? ['CMA', 'CNAS'] : [],
          limit: 20,
        }),
      ])

      // 计算综合匹配度
      let score = 70
      if (formData.revenue > 10000) score += 10
      if (formData.netProfit > 1000) score += 10
      if (formData.hasQualification) score += 5
      if (formData.hasTechAdvantage) score += 5
      score = Math.min(100, score)

      const result = {
        score,
        tiers: buyerTiers,
        formData,
        recommendedTier: score > 80 ? 1 : score > 60 ? 2 : 3,
        // 来自真实 API 的数据
        apiData: {
          profile: profileRes.success ? profileRes.data : null,
          candidates: screenRes.success ? screenRes.data?.candidates || [] : [],
          totalCount: screenRes.success ? screenRes.data?.totalCount || 0 : 0,
        },
      }

      setMatchResult(result)
    } catch (err) {
      console.error('[BuyerMatch] 匹配失败:', err)
      // API 失败时降级到本地计算
      const matchScore = calculateMatch()
      setMatchResult({
        score: matchScore,
        tiers: buyerTiers,
        formData,
        recommendedTier: matchScore > 80 ? 1 : matchScore > 60 ? 2 : 3,
        apiData: null,
      })
    } finally {
      setIsMatching(false)
      setStep(2)
    }
  }

  // 重置
  const handleReset = () => {
    setFormData({
      companyName: '',
      industry: '',
      revenue: '',
      netProfit: '',
      equity: '',
      teamSize: '',
      hasQualification: false,
      hasTechAdvantage: false,
      location: '',
    })
    setMatchResult(null)
    setStep(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-10 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Badge variant="primary" className="mb-4">
            <Target size={12} className="mr-1" />
            买家匹配
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            输入企业信息<span className="gradient-text">智能匹配买家</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            基于产业协同逻辑，精准匹配最优买家
          </p>
        </div>

        {step === 1 ? (
          /* 步骤1: 输入企业信息 */
          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Card padding="lg" className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <Building2 size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">企业基本信息</h2>
                  <p className="text-sm text-gray-500">请填写目标公司的核心信息</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="企业名称"
                  name="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="请输入企业全称"
                  icon={Building2}
                />

                <Input
                  label="所属行业"
                  name="industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  placeholder="如：制造业、科技、医疗"
                  icon={TrendingUp}
                />

                <Input
                  label="年营收（万元）"
                  name="revenue"
                  type="number"
                  value={formData.revenue}
                  onChange={(e) => handleInputChange('revenue', parseFloat(e.target.value) || '')}
                  placeholder="请输入年营收"
                  icon={DollarSign}
                />

                <Input
                  label="净利润（万元）"
                  name="netProfit"
                  type="number"
                  value={formData.netProfit}
                  onChange={(e) => handleInputChange('netProfit', parseFloat(e.target.value) || '')}
                  placeholder="请输入净利润"
                  icon={DollarSign}
                />

                <Input
                  label="估值预期（万元）"
                  name="equity"
                  type="number"
                  value={formData.equity}
                  onChange={(e) => handleInputChange('equity', parseFloat(e.target.value) || '')}
                  placeholder="请输入估值预期"
                  icon={Database}
                />

                <Input
                  label="团队规模"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={(e) => handleInputChange('teamSize', e.target.value)}
                  placeholder="如：50-100人"
                  icon={Users}
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">核心优势（可多选）</label>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.hasQualification}
                        onChange={(e) => handleInputChange('hasQualification', e.target.checked)}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <span className="text-sm">核心经营资质</span>
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.hasTechAdvantage}
                        onChange={(e) => handleInputChange('hasTechAdvantage', e.target.checked)}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <span className="text-sm">技术/专利优势</span>
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary rounded"
                      />
                      <span className="text-sm">稳定客户资源</span>
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary rounded"
                      />
                      <span className="text-sm">品牌影响力</span>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="注册地"
                    name="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="如：上海、北京"
                    icon={Building2}
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between">
                <Button variant="outline" onClick={handleReset}>
                  重置
                </Button>
                <Button
                  variant="primary"
                  onClick={handleMatch}
                  disabled={!formData.companyName || !formData.industry || isMatching}
                  icon={isMatching ? Loader2 : Search}
                  iconPosition="right"
                >
                  {isMatching ? '匹配中...' : '开始匹配买家'}
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          /* 步骤2: 匹配结果 */
          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* 企业信息摘要 */}
            <Card padding="lg" className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <Building2 size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{formData.companyName}</h2>
                    <p className="text-sm text-gray-500">{formData.industry} | {formData.location}</p>
                  </div>
                </div>
                <Badge variant="primary" className="text-lg px-4 py-2">
                  匹配度: {matchResult?.score}%
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-3">
                  <p className="text-xs text-gray-500">年营收</p>
                  <p className="text-lg font-bold text-gray-900">{formData.revenue || '-'} 万</p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <p className="text-xs text-gray-500">净利润</p>
                  <p className="text-lg font-bold text-gray-900">{formData.netProfit || '-'} 万</p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <p className="text-xs text-gray-500">估值预期</p>
                  <p className="text-lg font-bold text-gray-900">{formData.equity || '-'} 万</p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <p className="text-xs text-gray-500">团队规模</p>
                  <p className="text-lg font-bold text-gray-900">{formData.teamSize || '-'}</p>
                </div>
              </div>
            </Card>

            {/* 买家梯队匹配结果 */}
            <div className="space-y-6">
              {buyerTiers.map((tier) => {
                const isRecommended = tier.tier === matchResult?.recommendedTier
                const Icon = tier.icon
                return (
                  <Card
                    key={tier.tier}
                    padding="none"
                    className={`overflow-hidden transition-all hover:shadow-xl ${
                      isRecommended ? `border-2 ${tier.borderColor}` : ''
                    }`}
                  >
                    <div className={`h-1.5 bg-gradient-to-r ${tier.color}`} />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                            <Icon size={28} className="text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                              <Badge variant="primary">{tier.subtitle}</Badge>
                              {isRecommended && (
                                <Badge variant="success">推荐</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{tier.coreMotivation}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-3xl font-bold ${
                            tier.tier === 1 ? 'text-green-600' :
                            tier.tier === 2 ? 'text-blue-600' :
                            tier.tier === 3 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {tier.matchScore}%
                          </p>
                          <p className="text-xs text-gray-500">匹配度</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        {tier.buyers.map((buyer, idx) => (
                          <div
                            key={idx}
                            className={`${tier.bgColor} rounded-xl p-4 border ${tier.borderColor}`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle size={16} className={
                                tier.tier === 4 ? 'text-red-400' : 'text-green-500'
                              } />
                              <span className="font-medium text-gray-900 text-sm">{buyer.name}</span>
                            </div>
                            <p className="text-xs text-gray-500">{buyer.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* 真实候选买家列表（来自后端 API） */}
            {matchResult?.apiData?.candidates?.length > 0 && (
              <Card padding="lg" className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={20} className="text-primary" />
                  <h3 className="text-lg font-bold text-gray-900">AI 推荐候选买家</h3>
                  <Badge variant="primary">{matchResult.apiData.totalCount} 家</Badge>
                </div>
                <div className="space-y-3">
                  {matchResult.apiData.candidates.slice(0, 6).map((candidate, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                          <Building2 size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{candidate.companyName}</p>
                          <p className="text-xs text-gray-500">
                            {candidate.industry} | {candidate.region} | 注册资本 {candidate.registeredCapital}万
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={candidate.matchScore >= 80 ? 'success' : candidate.matchScore >= 60 ? 'primary' : 'outline'}>
                          {candidate.matchScore}分
                        </Badge>
                        {candidate.matchReasons?.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1 max-w-xs text-right">
                            {candidate.matchReasons[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 交易建议 */}
            <Card padding="lg" className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-purple-500" />
                交易建议
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">估值参考区间</h4>
                  <p className="text-sm text-gray-600">
                    基于营收 {formData.revenue}万 和净利润 {formData.netProfit}万，建议估值区间：
                  </p>
                  <p className="text-lg font-bold text-purple-600 mt-1">
                    {Math.round((formData.netProfit || 0) * 10)} ~ {Math.round((formData.netProfit || 0) * 20)} 万元
                  </p>
                  <p className="text-xs text-gray-500 mt-1">（PE 10~20倍，仅供参考）</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">推荐交易结构</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• 现金收购 ≥80%</p>
                    <p>• 剩余股权锁定</p>
                    <p>• 3年净利润对赌</p>
                    <p>• 核心团队股权激励</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* 操作按钮 */}
            <div className="mt-8 flex justify-center gap-4">
              <Button variant="outline" onClick={handleReset} icon={Building2}>
                重新匹配
              </Button>
              <Button variant="primary" icon={ChevronRight} iconPosition="right">
                下载完整报告
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
