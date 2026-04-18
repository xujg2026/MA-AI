import { Sparkles, Shield, Award, Users, Globe, TrendingUp, CheckCircle, Zap } from 'lucide-react'
import { Badge, Card } from '../ui'

const advantages = [
  {
    icon: Globe,
    title: '深度行业覆盖',
    desc: '深耕并购行业十余年，专业项目库收录500+优质标的，覆盖科技、医疗、制造、消费等多个领域',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Users,
    title: '100+行业专家网络',
    desc: '汇聚各行业资深专家，提供专业尽调评估与咨询服务',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: Shield,
    title: '全程风险把控',
    desc: 'AI+专家双重风险评估，从源头把控并购风险，确保交易安全',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-50',
  },
  {
    icon: TrendingUp,
    title: '精准估值体系',
    desc: '多维度估值模型，结合行业特点输出合理估值区间',
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-50',
  },
  {
    icon: Zap,
    title: 'AI智能匹配',
    desc: '基于300+维度特征匹配，3-7天完成全市场智能筛选',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
  },
  {
    icon: Award,
    title: '丰富成功案例',
    desc: '10+成功并购案例，涵盖不同行业与交易规模',
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-50',
  },
]

const standards = [
  { label: '财务尽调', desc: '专业财务尽职调查' },
  { label: '法律审查', desc: '全方位法律风险审查' },
  { label: '行业研究', desc: '深入行业研究分析' },
]

export default function CoreAdvantages() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <Badge variant="primary" className="mb-6 inline-flex items-center space-x-2">
            <Sparkles size={16} className="animate-pulse" />
            <span>核心优势</span>
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            为什么选择
            <span className="gradient-text"> 我们</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            深耕并购行业十余年，专业团队+AI技术，助力企业高效完成并购整合
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {advantages.map((adv, index) => (
            <Card
              key={adv.title}
              padding="lg"
              className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${adv.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${adv.color} mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                  <adv.icon size={26} className="text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-white transition-colors">
                  {adv.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {adv.desc}
                </p>
              </div>

              {/* Bottom accent */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${adv.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
            </Card>
          ))}
        </div>

        {/* Standards Banner */}
        <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-3xl p-8 border border-white/10 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">TIC行业专业标准</h3>
            <p className="text-gray-400">覆盖TIC行业各类资质认定标准</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {standards.map((standard, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <CheckCircle size={24} className="text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">{standard.label}</h4>
                  <p className="text-sm text-gray-400">{standard.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
