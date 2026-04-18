import { Sparkles, Search, FileCheck, DollarSign, Handshake, TrendingUp, CheckCircle } from 'lucide-react'
import { Badge, Card } from '../ui'

const processSteps = [
  {
    icon: Search,
    title: '需求诊断',
    desc: '深入了解买方战略目标、偏好与预算',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    icon: FileCheck,
    title: '标的匹配',
    desc: 'AI智能筛选+专家人工复核，精准匹配合适项目',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    icon: DollarSign,
    title: '尽职调查',
    desc: '全面风险评估，识别潜在风险点',
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
  {
    icon: TrendingUp,
    title: '交易估值',
    desc: '多维度估值模型，输出合理估值区间',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    icon: Handshake,
    title: '谈判推进',
    desc: '专业团队协助谈判，促成双方达成一致',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  {
    icon: CheckCircle,
    title: '整合赋能',
    desc: '整合后持续跟踪，提供增值服务',
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
  },
]

export default function ServiceProcess() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <Badge variant="primary" className="mb-6 inline-flex items-center space-x-2">
            <Sparkles size={16} className="animate-pulse" />
            <span>服务流程</span>
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            并购全程
            <span className="gradient-text"> 一站式服务</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            从需求诊断到整合赋能，专业团队全程陪伴
          </p>
        </div>

        {/* Process Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-6 lg:gap-4">
            {processSteps.map((step, index) => (
              <div
                key={step.title}
                className="relative animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Step Card */}
                <div className={`relative bg-white rounded-2xl p-6 shadow-soft hover:shadow-xl transition-all duration-500 border-2 ${step.borderColor} hover:-translate-y-2 group`}>
                  {/* Step number */}
                  <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full ${step.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 ${step.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <step.icon size={28} className={`bg-gradient-to-br ${step.color} bg-clip-text`} style={{ color: step.color.split(' ')[1].replace('to-', '') }} />
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>

                  {/* Arrow for desktop */}
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 z-10">
                      <div className={`w-10 h-10 rounded-full ${step.bgColor} flex items-center justify-center border-2 ${step.borderColor}`}>
                        <span className={`bg-gradient-to-br ${step.color} bg-clip-text text-transparent font-bold text-sm`}>→</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl px-8 py-4">
            <span className="text-gray-600">想要了解更多服务详情？</span>
            <a href="/contact" className="text-primary font-semibold hover:text-accent transition-colors">
              联系我们 →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
