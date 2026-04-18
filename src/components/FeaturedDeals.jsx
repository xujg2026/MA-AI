import { ArrowUpRight, TrendingUp, Clock, CheckCircle, Sparkles, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ticCaseStudies } from '../data/mockData'
import { Card, Badge, Button } from './ui'

export default function FeaturedDeals() {
  const featuredCases = ticCaseStudies.slice(0, 4)

  return (
    <section id="deals" className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4 animate-fade-in-up">
          <div>
            <Badge variant="primary" className="mb-4 inline-flex items-center space-x-2">
              <TrendingUp size={16} className="animate-pulse" />
              <span>精选案例</span>
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              精选并购案例
            </h2>
            <p className="text-gray-600">各行业成功并购案例，洞察市场整合趋势</p>
          </div>
          <Link
            to="/deals"
            className="group inline-flex items-center space-x-2 text-primary hover:text-accent font-medium transition-colors"
          >
            <span>查看更多</span>
            <ArrowUpRight
              size={18}
              className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
            />
          </Link>
        </div>

        {/* Deals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCases.map((deal, index) => (
            <Card
              key={deal.id}
              padding="none"
              className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-3 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Top accent with gradient */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${deal.gradient || 'from-blue-500 to-cyan-500'}`} />

              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

              <div className="p-6">
                {/* Status badge */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`relative w-14 h-14 bg-gradient-to-br ${deal.gradient || 'from-blue-500 to-cyan-500'} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                  >
                    {deal.buyer.charAt(0)}
                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${deal.gradient || 'from-blue-500 to-cyan-500'} rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
                  </div>
                  <Badge variant="success" className="flex items-center space-x-1 group-hover:scale-105 transition-transform">
                    <CheckCircle size={14} />
                    <span>{deal.status}</span>
                  </Badge>
                </div>

                {/* Company names */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                    {deal.buyer}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    收购 {deal.target}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
                    <span className="text-gray-500 text-sm">交易金额</span>
                    <span className={`font-bold text-lg bg-gradient-to-r ${deal.gradient || 'from-blue-500 to-cyan-500'} bg-clip-text text-transparent`}>
                      {deal.amount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
                    <span className="font-medium text-gray-700">{deal.sector}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
                    <span className="text-gray-500 text-sm flex items-center space-x-1">
                      <Clock size={14} />
                      <span>完成日期</span>
                    </span>
                    <span className="font-medium text-gray-700">{deal.date}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button variant="secondary" className="w-full group-hover:shadow-lg transition-shadow" size="sm">
                  <span>查看详情</span>
                  <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </div>

              {/* Hover decoration */}
              <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br ${deal.gradient || 'from-blue-500 to-cyan-500'} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`} />
            </Card>
          ))}
        </div>

        {/* Industry Stats */}
        <div className="mt-12 bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 text-white relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

          <div className="relative grid md:grid-cols-4 gap-8">
            <div className="text-center group cursor-pointer">
              <p className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform">50万亿</p>
              <p className="text-white/70 text-sm">全球并购市场规模</p>
            </div>
            <div className="text-center group cursor-pointer">
              <p className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform">5万亿</p>
              <p className="text-white/70 text-sm">中国并购市场规模</p>
            </div>
            <div className="text-center group cursor-pointer">
              <p className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform">10,000+</p>
              <p className="text-white/70 text-sm">优质并购标的</p>
            </div>
            <div className="text-center group cursor-pointer">
              <p className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform">100+</p>
              <p className="text-white/70 text-sm">行业专家覆盖</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
