import { useState, useEffect } from 'react'
import { Search, Sparkles, ChevronRight, Eye, Flame, Clock, TrendingUp, FileText, Radio, Zap, RefreshCw } from 'lucide-react'
import { Card, Badge, Button } from '../components/ui'
import { getLiveNews, getHotNews, getAllNews, marketData } from '../services/newsService'

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0)

  // 实时数据
  const [liveNews, setLiveNews] = useState([])
  const [hotNews, setHotNews] = useState([])
  const [allNews, setAllNews] = useState([])
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // 加载数据
  useEffect(() => {
    setLiveNews(getLiveNews())
    setHotNews(getHotNews())
    setAllNews(getAllNews())
    setLastUpdate(new Date())
    setIsLoaded(true)
  }, [])

  // 自动滚动实时新闻
  useEffect(() => {
    if (liveNews.length === 0) return
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % liveNews.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [liveNews.length])

  // 手动刷新
  const handleRefresh = () => {
    setLiveNews(getLiveNews())
    setHotNews(getHotNews())
    setAllNews(getAllNews())
    setLastUpdate(new Date())
  }

  const categories = ['全部', '行业研究', '技术前沿', '案例分析', '合规指南', '市场分析']

  const filteredNews = activeCategory === '全部'
    ? allNews.slice(0, 9)
    : allNews.filter(n => n.category === activeCategory).slice(0, 9)

  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* 顶部实时资讯横幅 */}
      <div className="bg-gradient-to-r from-primary via-secondary to-primary">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* 标题行 */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Radio size={24} className="text-white animate-pulse" />
                <span className="text-white text-xl font-bold">实时资讯</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-sm">直播中</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/70 text-sm">更新于 {formatTime(lastUpdate)}</span>
              <button
                onClick={handleRefresh}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* 市场数据 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
            {marketData.map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur rounded-xl p-3">
                <p className="text-white/60 text-xs mb-1">{stat.label}</p>
                <p className="text-white text-lg font-bold">{stat.value}</p>
                <p className={`text-xs ${stat.up ? 'text-green-300' : 'text-red-300'}`}>{stat.change}</p>
              </div>
            ))}
          </div>

          {/* 滚动新闻列表 */}
          <div className="bg-white/15 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500 rounded-lg">
                <Zap size={14} className="text-white" />
                <span className="text-white text-sm font-bold">最新</span>
              </div>
              <div className="h-px flex-1 bg-white/20" />
            </div>

            <div className="space-y-2 max-h-32 overflow-hidden">
              {liveNews.slice(0, 5).map((news, idx) => (
                <div
                  key={news.id}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer ${
                    idx === currentNewsIndex ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                  onClick={() => setCurrentNewsIndex(idx)}
                >
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    news.hot ? 'bg-orange-500 text-white' : 'bg-white/20 text-white/80'
                  }`}>
                    {news.hot && <Flame size={10} className="inline mr-0.5" />}
                    {news.category}
                  </span>
                  <span className="text-white flex-1 truncate">{news.title}</span>
                  <span className="text-white/50 text-xs">{news.time}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-1.5 mt-3">
              {liveNews.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentNewsIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentNewsIndex === idx ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge variant="primary" className="mb-4">
            <Sparkles size={12} className="mr-1" />
            并购资讯
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            聚焦市场动态<span className="gradient-text">洞察行业趋势</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            提供专业的并购资讯与分析报告，助力企业决策
          </p>
        </div>

        {/* 热门资讯 */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Flame size={20} className="text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900">热门资讯</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {hotNews.slice(0, 3).map((news, idx) => (
              <Card
                key={news.id}
                padding="lg"
                className={`cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 ${
                  idx === 0 ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200' :
                  idx === 1 ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200' :
                  'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-orange-500' : 'bg-amber-500'
                  }`}>
                    <Flame size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="accent">热门</Badge>
                      <span className="text-xs text-gray-400">{news.time}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{news.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Eye size={14} />
                      {news.views} 阅读
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 搜索 */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索资讯..."
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white shadow-md"
            />
          </div>
        </div>

        {/* 分类 */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 新闻列表 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((news) => (
            <Card
              key={news.id}
              padding="none"
              hover
              className="cursor-pointer overflow-hidden group"
            >
              <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="primary">{news.category}</Badge>
                  {news.hot && (
                    <div className="flex items-center gap-1 text-orange-500">
                      <TrendingUp size={14} />
                      <span className="text-xs font-medium">热门</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{news.summary}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {news.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {news.views}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary">
                    阅读 <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 加载更多 */}
        <div className="text-center mt-12">
          <Button variant="outline" className="px-10 py-3">
            加载更多
          </Button>
        </div>
      </div>
    </div>
  )
}
