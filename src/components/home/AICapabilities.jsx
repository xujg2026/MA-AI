import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Sparkles, GitMerge, Brain, Search, DollarSign, FileCheck, Target, Users, Shield, Building } from 'lucide-react'
import { Badge, Card } from '../ui'

const capabilities = [
  {
    icon: Brain,
    title: 'AI智能匹配',
    description: '基于TIC行业特征库，精准匹配买方需求与卖方标的，智能推荐最优质项目',
    link: '/ai-finder',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'bg-blue-50',
    hoverBorder: 'hover:border-blue-200',
    iconBg: 'bg-blue-500',
    tag: '智能推荐',
  },
  {
    icon: Target,
    title: '标的筛选',
    description: 'CMA/CNAS资质、认可范围、实验室规模等多维度TIC专属筛选条件',
    link: '/ai-finder',
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'bg-emerald-50',
    hoverBorder: 'hover:border-emerald-200',
    iconBg: 'bg-emerald-500',
    tag: '精准筛选',
  },
  {
    icon: DollarSign,
    title: 'AI企业估值',
    description: '多模型并行估值，结合TIC行业特点输出估值区间与敏感性分析',
    link: '/ai-valuation',
    gradient: 'from-violet-500 to-purple-500',
    bgGradient: 'bg-violet-50',
    hoverBorder: 'hover:border-violet-200',
    iconBg: 'bg-violet-500',
    tag: '精准估值',
  },
  {
    icon: FileCheck,
    title: 'AI风险尽调',
    description: '自动识别资质异常、债务风险、股权质押等TIC行业特有风险点',
    link: '/ai-due-diligence',
    gradient: 'from-orange-500 to-amber-500',
    bgGradient: 'bg-orange-50',
    hoverBorder: 'hover:border-orange-200',
    iconBg: 'bg-orange-500',
    tag: '风险识别',
  },
  {
    icon: GitMerge,
    title: 'AI整合预测',
    description: '基于TIC行业历史案例预测整合成功率、资质协同效应',
    link: '/ai-integration',
    gradient: 'from-pink-500 to-rose-500',
    bgGradient: 'bg-pink-50',
    hoverBorder: 'hover:border-pink-200',
    iconBg: 'bg-pink-500',
    tag: '整合预测',
  },
]

export default function AICapabilities() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <Badge variant="primary" className="mb-6 inline-flex items-center space-x-2">
            <Sparkles size={16} className="animate-pulse" />
            <span>TIC行业专精</span>
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            TIC并购
            <span className="gradient-text"> 智能解决方案</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            深耕TIC行业十余年，AI技术贯穿并购全流程，助力TIC企业高效整合
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
          {capabilities.map((cap, index) => (
            <Link
              key={cap.title}
              to={cap.link}
              className={`group relative bg-white rounded-3xl p-6 shadow-soft hover:shadow-soft-xl transition-all duration-500 border border-gray-100 ${cap.hoverBorder} hover:-translate-y-3 overflow-hidden animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cap.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Top tag */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {cap.tag}
                </span>
              </div>

              {/* Content */}
              <div className="relative">
                {/* Icon with enhanced effect */}
                <div className={`inline-flex items-center justify-center w-14 h-14 ${cap.iconBg} rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                  <cap.icon className="text-white" size={26} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300">
                  {cap.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {cap.description}
                </p>

                {/* Arrow indicator with animation */}
                <div className="flex items-center text-primary font-semibold mt-4">
                  <span className="text-xs">了解更多</span>
                  <ArrowRight
                    size={14}
                    className="ml-1 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Decorative circles */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Bottom gradient line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${cap.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
            </Link>
          ))}
        </div>

        {/* Service Model Banner */}
        <div className="mt-20 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">四大服务模式</h3>
            <p className="text-gray-600">全方位满足TIC行业并购需求</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: '并购顾问', desc: '专业团队全程服务' },
              { icon: Building, title: '并购经纪', desc: '精准匹配买卖双方' },
              { icon: Target, title: '并购标的', desc: '500+优质标的项目库' },
              { icon: Search, title: '并购资讯', desc: 'TIC行业最新动态' },
            ].map((service, i) => (
              <Card key={i} padding="lg" className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <service.icon size={24} className="text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{service.title}</h4>
                <p className="text-sm text-gray-500">{service.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-20 relative animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-dark rounded-3xl" />

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="relative px-8 lg:px-16 py-12 lg:py-16">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left content */}
              <div>
                <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  开始您的TIC行业并购之旅
                </h3>
                <p className="text-white/70 text-lg mb-8 max-w-lg">
                  专业团队+AI赋能，助力TIC企业完成高效并购整合
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/ai-finder"
                    className="group relative inline-flex items-center justify-center bg-gradient-to-r from-accent to-amber-400 hover:from-amber-400 hover:to-accent text-primary font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-glow hover:shadow-xl hover:-translate-y-1 btn-press"
                  >
                    <span className="text-lg">AI觅售</span>
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </Link>
                  <Link
                    to="/prospect-entry"
                    className="group inline-flex items-center justify-center border-2 border-white/30 hover:border-white/50 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5 btn-press"
                  >
                    <span className="text-lg">录入项目</span>
                  </Link>
                </div>
              </div>

              {/* Right content - Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card padding="md" className="bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors cursor-pointer">
                  <p className="text-4xl font-bold text-white mb-2">500+</p>
                  <p className="text-white/60 text-sm">TIC行业标的</p>
                </Card>
                <Card padding="md" className="bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors cursor-pointer">
                  <p className="text-4xl font-bold text-white mb-2">10+</p>
                  <p className="text-white/60 text-sm">成功并购案例</p>
                </Card>
                <Card padding="md" className="bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors cursor-pointer">
                  <p className="text-4xl font-bold text-white mb-2">100+</p>
                  <p className="text-white/60 text-sm">行业专家网络</p>
                </Card>
                <Card padding="md" className="bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors cursor-pointer">
                  <p className="text-4xl font-bold text-accent mb-2">24/7</p>
                  <p className="text-white/60 text-sm">AI在线服务</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
