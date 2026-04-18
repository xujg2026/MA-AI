import { useState, useEffect } from 'react'
import { FileText, TrendingUp, Clock, Search, Sparkles, ChevronRight, Eye } from 'lucide-react'
import { Card, Badge, Button } from '../components/ui'

const newsData = [
  {
    id: 1,
    title: '2024年中国TIC检测行业并购趋势分析',
    category: '行业研究',
    date: '2024-03-15',
    summary: '随着检测认证行业的高速发展，龙头企业通过并购整合提升市场份额的趋势愈发明显...',
    hot: true,
    views: 2580,
  },
  {
    id: 2,
    title: 'AI技术在尽职调查中的应用白皮书',
    category: '技术前沿',
    date: '2024-03-12',
    summary: '人工智能技术正在革新传统的尽职调查流程，大幅提升效率和准确性...',
    hot: false,
    views: 1890,
  },
  {
    id: 3,
    title: '某上市公司收购检测公司案例分析',
    category: '案例分析',
    date: '2024-03-10',
    summary: '本次收购标的公司为国内领先的第三方检测机构，交易金额达8亿元...',
    hot: true,
    views: 3200,
  },
  {
    id: 4,
    title: '跨境并购中的合规风险与应对策略',
    category: '合规指南',
    date: '2024-03-08',
    summary: '跨境并购涉及多个司法管辖区的合规要求，企业需要提前做好风险评估...',
    hot: false,
    views: 1560,
  },
  {
    id: 5,
    title: '2024年Q1并购市场回顾与展望',
    category: '市场分析',
    date: '2024-03-05',
    summary: '本季度并购市场活跃度较去年同期有所提升，科技和医疗健康领域仍是热点...',
    hot: false,
    views: 2100,
  },
  {
    id: 6,
    title: '如何利用AI提升企业估值准确性',
    category: '技术前沿',
    date: '2024-03-03',
    summary: '多维度数据分析结合机器学习算法可以显著提升企业估值的一致性和准确性...',
    hot: false,
    views: 1780,
  },
]

const categories = ['全部', '行业研究', '技术前沿', '案例分析', '合规指南', '市场分析']

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const filteredNews = activeCategory === '全部'
    ? newsData
    : newsData.filter(n => n.category === activeCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Badge variant="primary" className="mb-4 inline-flex items-center gap-2">
            <Sparkles size={14} />
            <span>并购资讯</span>
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            聚焦市场动态<span className="gradient-text">洞察行业趋势</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            提供专业的并购资讯与分析报告，助力企业决策
          </p>
        </div>

        {/* Search */}
        <div className={`max-w-xl mx-auto mb-8 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索资讯..."
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white shadow-soft transition-all"
            />
          </div>
        </div>

        {/* Categories */}
        <div className={`flex justify-center gap-2 mb-10 flex-wrap transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-primary/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {filteredNews.map((news, index) => (
            <Card
              key={news.id}
              padding="none"
              hover
              className="cursor-pointer overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant={news.hot ? 'accent' : 'primary'} className={news.hot ? 'animate-pulse' : ''}>
                    {news.category}
                  </Badge>
                  {news.hot && (
                    <div className="flex items-center gap-1 text-xs text-orange-500">
                      <TrendingUp size={12} />
                      <span>热门</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {news.title}
                </h3>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {news.summary}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-xs text-gray-400 gap-3">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {news.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {news.views}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="group-hover:text-primary">
                    阅读 <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" className="px-8">
            加载更多
          </Button>
        </div>
      </div>
    </div>
  )
}
