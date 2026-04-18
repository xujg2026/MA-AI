import { useState } from 'react'
import { Card, Button, Badge } from '../ui'
import {
  Target,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  GitMerge,
  BarChart3,
  Lightbulb,
} from 'lucide-react'

const integrationFactors = [
  { key: 'cultural', label: '文化整合', icon: Users, weight: 0.2 },
  { key: 'business', label: '业务协同', icon: GitMerge, weight: 0.3 },
  { key: 'personnel', label: '人员稳定', icon: Users, weight: 0.2 },
  { key: 'financial', label: '财务整合', icon: DollarSign, weight: 0.15 },
  { key: 'operational', label: '运营协同', icon: TrendingUp, weight: 0.15 },
]

const riskItems = [
  { key: 'key_person_risk', label: '核心人员流失风险', level: 'high', desc: '技术团队稳定性存疑' },
  { key: 'customer_concentration', label: '客户集中度风险', level: 'medium', desc: '前5客户占比超60%' },
  { key: 'technology_integration', label: '技术整合难度', level: 'medium', desc: 'IT系统差异较大' },
  { key: 'debt_repayment', label: '债务偿还压力', level: 'low', desc: '负债结构合理' },
]

export default function IntegrationPrediction() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [formData, setFormData] = useState({
    buyerCompany: '',
    targetCompany: '',
    dealSize: '',
    timeline: '12',
  })

  const runPrediction = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setResult({
        overallScore: 72,
        difficulty: '中等',
        successProbability: 78,
        timeline: '12-18个月',
        keyRisks: [
          { factor: '文化整合难度', level: 'medium', score: 65 },
          { factor: '核心人才保留', level: 'high', score: 55 },
          { factor: '客户协同潜力', level: 'low', score: 85 },
          { factor: '技术互补性', level: 'low', score: 80 },
        ],
        recommendations: [
          '建议保留原管理团队至少12个月',
          '优先整合销售渠道，发挥协同效应',
          '建立双向激励机制，留住核心技术人员',
          '分阶段进行IT系统整合',
        ],
        integrationPhases: [
          { phase: '第一阶段（0-3月）', focus: '组织架构调整、核心人员沟通', status: '准备' },
          { phase: '第二阶段（3-6月）', focus: '业务整合、客户关系维护', status: '执行' },
          { phase: '第三阶段（6-12月）', focus: '系统整合、流程优化', status: '深化' },
          { phase: '第四阶段（12-18月）', focus: '文化融合、效能提升', status: '稳定' },
        ],
      })
      setIsAnalyzing(false)
    }, 2500)
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card padding="md" className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <GitMerge size={28} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">整合预测分析</h2>
              <p className="text-sm text-gray-500">基于历史案例AI预测整合成功率与风险点</p>
            </div>
          </div>
          {result && (
            <Badge variant="primary" className="text-lg px-4 py-2">
              综合得分: {result.overallScore}/100
            </Badge>
          )}
        </div>
      </Card>

      {/* Input Form */}
      {!result && (
        <Card padding="lg">
          <Card.Title className="flex items-center mb-6">
            <BarChart3 size={20} className="mr-2 text-primary" />
            输入交易信息
          </Card.Title>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                收购方公司名称
              </label>
              <input
                type="text"
                value={formData.buyerCompany}
                onChange={(e) => setFormData({ ...formData, buyerCompany: e.target.value })}
                placeholder="例如：华测检测集团"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目标公司名称
              </label>
              <input
                type="text"
                value={formData.targetCompany}
                onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
                placeholder="例如：信科检测"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                交易金额（亿元）
              </label>
              <input
                type="number"
                value={formData.dealSize}
                onChange={(e) => setFormData({ ...formData, dealSize: e.target.value })}
                placeholder="例如：4.5"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                期望整合周期
              </label>
              <select
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="6">6个月</option>
                <option value="12">12个月</option>
                <option value="18">18个月</option>
                <option value="24">24个月</option>
              </select>
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full mt-8"
            icon={Target}
            onClick={runPrediction}
            disabled={isAnalyzing || !formData.buyerCompany || !formData.targetCompany}
          >
            {isAnalyzing ? (
              <>
                <Clock size={20} className="animate-spin mr-2" />
                AI正在分析历史案例...
              </>
            ) : (
              '启动整合预测分析'
            )}
          </Button>
        </Card>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card padding="md" className="text-center">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-600" />
              <p className="text-3xl font-bold text-green-600">{result.successProbability}%</p>
              <p className="text-sm text-gray-500">成功率预测</p>
            </Card>
            <Card padding="md" className="text-center">
              <GitMerge size={32} className="mx-auto mb-2 text-yellow-600" />
              <p className="text-3xl font-bold text-yellow-600">{result.difficulty}</p>
              <p className="text-sm text-gray-500">整合难度</p>
            </Card>
            <Card padding="md" className="text-center">
              <Clock size={32} className="mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold text-primary">{result.timeline}</p>
              <p className="text-sm text-gray-500">建议周期</p>
            </Card>
            <Card padding="md" className="text-center">
              <AlertTriangle size={32} className="mx-auto mb-2 text-red-600" />
              <p className="text-3xl font-bold text-red-600">{result.keyRisks.filter(r => r.level === 'high').length}</p>
              <p className="text-sm text-gray-500">高风险项</p>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Risk Analysis */}
            <Card padding="lg">
              <Card.Title className="flex items-center mb-4">
                <AlertTriangle size={20} className="mr-2 text-red-500" />
                风险因素分析
              </Card.Title>

              <div className="space-y-4">
                {result.keyRisks.map((risk, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{risk.factor}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(risk.level)}`}>
                        {risk.level === 'high' ? '高风险' : risk.level === 'medium' ? '中风险' : '低风险'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getScoreColor(risk.score)} bg-current`}
                          style={{ width: `${risk.score}%` }}
                        />
                      </div>
                      <span className={`font-bold ${getScoreColor(risk.score)}`}>{risk.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommendations */}
            <Card padding="lg">
              <Card.Title className="flex items-center mb-4">
                <Lightbulb size={20} className="mr-2 text-yellow-500" />
                整合建议
              </Card.Title>

              <div className="space-y-3">
                {result.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 bg-green-50 rounded-xl">
                    <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Integration Timeline */}
          <Card padding="lg">
            <Card.Title className="flex items-center mb-6">
              <Clock size={20} className="mr-2 text-primary" />
              整合时间表
            </Card.Title>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

              <div className="space-y-6 relative">
                {result.integrationPhases.map((phase, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center z-10 ${
                      phase.status === '准备' ? 'bg-blue-100 text-blue-600' :
                      phase.status === '执行' ? 'bg-yellow-100 text-yellow-600' :
                      phase.status === '深化' ? 'bg-orange-100 text-orange-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      <span className="font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{phase.phase}</h4>
                        <Badge variant={
                          phase.status === '准备' ? 'info' :
                          phase.status === '执行' ? 'warning' :
                          phase.status === '深化' ? 'primary' :
                          'success'
                        }>
                          {phase.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{phase.focus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Reset Button */}
          <div className="flex justify-center">
            <Button variant="ghost" onClick={() => setResult(null)}>
              重新分析
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
