// M&A News Service
// 提供新闻数据获取，支持真实API和mock fallback

import api from './api.js'

// 是否使用真实数据
const USE_REAL_NEWS = import.meta.env.VITE_USE_REAL_NEWS === 'true'

// 静态市场数据（用于NewsPage的marketData展示）
export const marketData = [
  { label: 'TIC行业新闻', value: '156', change: '+12今日', up: true },
  { label: '并购动态', value: '43', change: '+5今日', up: true },
  { label: '政策解读', value: '28', change: '+2今日', up: true },
  { label: '投资事件', value: '87', change: '+8今日', up: true },
  { label: '上市动态', value: '12', change: '-1今日', up: false },
  { label: '财报速递', value: '34', change: '+3今日', up: true },
]

// 获取实时新闻 (滚动)
export const getLiveNews = async () => {
  if (!USE_REAL_NEWS) {
    return getMockLiveNews()
  }

  try {
    const response = await api.get('/news/live')
    if (response.data && response.data.length > 0) {
      return response.data.map(a => ({
        id: a.id,
        title: a.title,
        category: a.category || '快讯',
        hot: a.hot || false,
        sentiment: a.sentiment || 'neutral',
        time: a.time || '',
        views: a.views || 0,
      }))
    }
  } catch (error) {
    console.warn('[NewsService] Real news fetch failed, using mock:', error)
  }

  return getMockLiveNews()
}

// 获取热门新闻
export const getHotNews = async () => {
  if (!USE_REAL_NEWS) {
    return getMockHotNews()
  }

  try {
    const response = await api.get('/news/hot')
    if (response.data && response.data.length > 0) {
      return response.data.map(a => ({
        id: a.id,
        title: a.title,
        category: a.category || '热门',
        hot: true,
        sentiment: a.sentiment || 'neutral',
        time: a.time || '',
        views: a.views || 0,
      }))
    }
  } catch (error) {
    console.warn('[NewsService] Real hot news failed, using mock:', error)
  }

  return getMockHotNews()
}

// 获取所有新闻
export const getAllNews = async (filters = {}) => {
  if (!USE_REAL_NEWS) {
    return getMockAllNews(filters)
  }

  try {
    const response = await api.get('/news/all', { params: filters })
    if (response.data && response.data.length > 0) {
      // Transform real API data to match expected format
      return response.data.map(a => ({
        id: a.id,
        title: a.title,
        category: a.category || '其他',
        date: a.date ? new Date(a.date).toLocaleDateString('zh-CN') : '',
        summary: a.body ? a.body.substring(0, 100) + '...' : '',
        hot: a.hot || false,
        views: a.views || 0,
        is_tic: a.is_tic || false,
        is_ma: a.is_ma || false,
        sentiment: a.sentiment || 'neutral',
      }))
    }
  } catch (error) {
    console.warn('[NewsService] Real news failed, using mock:', error)
  }

  return getMockAllNews(filters)
}

// 获取市场数据
export const getMarketStats = async () => {
  if (!USE_REAL_NEWS) {
    return getMockMarketData()
  }

  try {
    const response = await api.get('/news/stats')
    if (response.data && response.data.length > 0) {
      return response.data
    }
  } catch (error) {
    console.warn('[NewsService] Real market stats failed, using mock:', error)
  }

  return getMockMarketData()
}

// 搜索新闻
export const searchNews = async (keyword) => {
  if (!USE_REAL_NEWS) {
    return getMockAllNews({ keyword })
  }

  try {
    const response = await api.get('/news/search', { params: { keyword } })
    return response.data || []
  } catch (error) {
    console.warn('[NewsService] Real search failed, using mock:', error)
  }

  return []
}

// 手动触发采集
export const triggerCollection = async () => {
  try {
    await api.post('/news/collect')
    return true
  } catch (error) {
    console.error('[NewsService] Trigger collection failed:', error)
    return false
  }
}

// 手动触发AI分析
export const triggerAnalysis = async (count = 100) => {
  try {
    const response = await api.post('/news/analyze', null, { params: { count } })
    return response.analyzed_count || 0
  } catch (error) {
    console.error('[NewsService] Trigger analysis failed:', error)
    return 0
  }
}

// ============ Mock 数据 (Fallback) ============

function getMockLiveNews() {
  return [
    { id: 1, title: '华测检测拟收购某环境检测公司100%股权', hot: true, category: '并购', sentiment: 'positive', time: '刚刚', views: 1234 },
    { id: 2, title: '2024年TIC行业市场规模突破5000亿元', hot: false, category: '行业', sentiment: 'positive', time: '5分钟前', views: 890 },
    { id: 3, title: 'AI技术在检测认证领域应用白皮书发布', hot: true, category: '技术', sentiment: 'positive', time: '10分钟前', views: 567 },
    { id: 4, title: '某头部机构完成第12起并购整合', hot: false, category: '并购', sentiment: 'positive', time: '15分钟前', views: 432 },
    { id: 5, title: '跨境检测认证服务需求激增200%', hot: true, category: '市场', sentiment: 'positive', time: '20分钟前', views: 321 },
  ]
}

function getMockHotNews() {
  return [
    { id: 1, title: '华测检测拟收购某环境检测公司100%股权', hot: true, category: '并购', sentiment: 'positive', time: '刚刚', views: 1234 },
    { id: 3, title: 'AI技术在检测认证领域应用白皮书发布', hot: true, category: '技术', sentiment: 'positive', time: '10分钟前', views: 567 },
    { id: 5, title: '跨境检测认证服务需求激增200%', hot: true, category: '市场', sentiment: 'positive', time: '20分钟前', views: 321 },
    { id: 8, title: '检测行业Q1财报：营收平均增长15%', hot: true, category: '财报', sentiment: 'positive', time: '30分钟前', views: 234 },
    { id: 10, title: '某检测机构被撤销CMA资质', hot: true, category: '监管', sentiment: 'negative', time: '45分钟前', views: 189 },
  ]
}

function getMockAllNews(filters = {}) {
  const baseNews = [
    { id: 1, title: '华测检测拟收购某环境检测公司100%股权', category: '并购', date: '2024-03-15', summary: '华测检测发布公告称拟收购某环境检测公司100%股权...', hot: true, views: 1234, is_tic: true, is_ma: true, sentiment: 'positive' },
    { id: 2, title: '2024年TIC行业市场规模突破5000亿元', category: '行业研究', date: '2024-03-14', summary: '根据最新报告，2024年中国TIC行业市场规模...', hot: false, views: 890, is_tic: true, is_ma: false, sentiment: 'positive' },
    { id: 3, title: 'AI技术在检测认证领域应用白皮书发布', category: '技术前沿', date: '2024-03-13', summary: '中国信通院发布《AI在检测认证领域应用白皮书》...', hot: true, views: 567, is_tic: true, is_ma: false, sentiment: 'positive' },
    { id: 4, title: '某头部机构完成第12起并购整合', category: '案例分析', date: '2024-03-12', summary: '某头部检测机构宣布完成第12起并购整合...', hot: false, views: 432, is_tic: true, is_ma: true, sentiment: 'positive' },
    { id: 5, title: '跨境检测认证服务需求激增200%', category: '市场分析', date: '2024-03-11', summary: '受全球贸易复苏影响，跨境检测认证服务需求...', hot: true, views: 321, is_tic: true, is_ma: false, sentiment: 'positive' },
    { id: 6, title: '首批温室气体核查机构名单公布', category: '合规指南', date: '2024-03-10', summary: '生态环境部公布首批温室气体核查机构名单...', hot: false, views: 234, is_tic: true, is_ma: false, sentiment: 'neutral' },
    { id: 7, title: '食品检测行业标准化建设取得新进展', category: '行业研究', date: '2024-03-09', summary: '全国食品检测标准化技术委员会年会召开...', hot: false, views: 189, is_tic: true, is_ma: false, sentiment: 'positive' },
    { id: 8, title: '检测行业Q1财报：营收平均增长15%', category: '市场分析', date: '2024-03-08', summary: '多家检测行业上市公司发布Q1财报...', hot: true, views: 178, is_tic: true, is_ma: false, sentiment: 'positive' },
    { id: 9, title: '新版CNAS认可规范将于5月实施', category: '合规指南', date: '2024-03-07', summary: 'CNAS发布新版认可规范，将于5月1日起实施...', hot: false, views: 156, is_tic: true, is_ma: false, sentiment: 'neutral' },
    { id: 10, title: '某检测机构被撤销CMA资质', category: '合规指南', date: '2024-03-06', summary: '某检测机构因违规被撤销CMA资质...', hot: true, views: 145, is_tic: true, is_ma: false, sentiment: 'negative' },
  ]

  let filtered = baseNews
  if (filters.category) {
    filtered = filtered.filter(n => n.category === filters.category)
  }

  return filtered
}

function getMockMarketData() {
  return [
    { label: 'TIC行业指数', value: '3865.32', change: '+1.24%', up: true, icon: '📈' },
    { label: '今日并购', value: '12', change: '+3', up: true, icon: '🤝' },
    { label: '待审项目', value: '48', change: '+5', up: true, icon: '📋' },
    { label: '成交金额(亿)', value: '8.5', change: '+15%', up: true, icon: '💰' },
    { label: '新增企业', value: '156', change: '+23', up: true, icon: '🏢' },
    { label: '行业招聘', value: '892', change: '-12%', up: false, icon: '👥' },
  ]
}