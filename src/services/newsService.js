// 实时新闻数据 - 这些数据会动态更新
let newsCounter = Date.now()

// 生成唯一ID
const generateId = () => {
  newsCounter += 1
  return newsCounter
}

// 模拟实时新闻数据 - 可对接真实API
const baseNews = [
  { id: 1, title: '华测检测拟收购某环境检测公司100%股权', hot: true, category: '并购', sentiment: 'positive' },
  { id: 2, title: '2024年TIC行业市场规模突破5000亿元', hot: false, category: '行业', sentiment: 'positive' },
  { id: 3, title: 'AI技术在检测认证领域应用白皮书发布', hot: true, category: '技术', sentiment: 'positive' },
  { id: 4, title: '某头部机构完成第12起并购整合', hot: false, category: '并购', sentiment: 'positive' },
  { id: 5, title: '跨境检测认证服务需求激增200%', hot: true, category: '市场', sentiment: 'positive' },
  { id: 6, title: '首批温室气体核查机构名单公布', hot: false, category: '政策', sentiment: 'neutral' },
  { id: 7, title: '食品检测行业标准化建设取得新进展', hot: false, category: '行业', sentiment: 'positive' },
  { id: 8, title: '检测行业Q1财报：营收平均增长15%', hot: true, category: '财报', sentiment: 'positive' },
  { id: 9, title: '新版CNAS认可规范将于5月实施', hot: false, category: '政策', sentiment: 'neutral' },
  { id: 10, title: '某检测机构被撤销CMA资质', hot: true, category: '监管', sentiment: 'negative' },
  { id: 11, title: '长三角检测一体化发展论坛成功举办', hot: false, category: '行业', sentiment: 'positive' },
  { id: 12, title: '第三方医学检测市场规模预计达800亿', hot: true, category: '市场', sentiment: 'positive' },
]

// 市场数据
export const marketData = [
  { label: 'TIC行业指数', value: '3865.32', change: '+1.24%', up: true, icon: '📈' },
  { label: '今日并购', value: '12', change: '+3', up: true, icon: '🤝' },
  { label: '待审项目', value: '48', change: '+5', up: true, icon: '📋' },
  { label: '成交金额(亿)', value: '8.5', change: '+15%', up: true, icon: '💰' },
  { label: '新增企业', value: '156', change: '+23', up: true, icon: '🏢' },
  { label: '行业招聘', value: '892', change: '-12%', up: false, icon: '👥' },
]

// 生成带时间戳的新闻
const generateTimestamp = () => {
  const now = Date.now()
  const offset = Math.floor(Math.random() * 30) * 60 * 1000 // 0-30分钟
  return new Date(now - offset).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 获取实时新闻列表
export const getLiveNews = () => {
  return baseNews.map(news => ({
    ...news,
    id: generateId(),
    time: generateTimestamp(),
    views: Math.floor(Math.random() * 2000) + 500,
  }))
}

// 热门新闻
export const getHotNews = () => {
  return baseNews.filter(n => n.hot).map(news => ({
    ...news,
    id: generateId(),
    time: generateTimestamp(),
    views: Math.floor(Math.random() * 3000) + 1000,
  }))
}

// 最新新闻 (带NEW标签)
export const getLatestNews = () => {
  return baseNews.slice(0, 5).map((news, index) => ({
    ...news,
    id: generateId(),
    time: index === 0 ? '刚刚' : `${(index + 1) * 5}分钟前`,
    views: Math.floor(Math.random() * 1000) + 100,
    isNew: index < 2,
  }))
}

// 完整新闻列表 (用于资讯页面)
export const getAllNews = () => {
  const categories = ['行业研究', '技术前沿', '案例分析', '合规指南', '市场分析']
  const now = Date.now()

  return Array.from({ length: 20 }, (_, i) => {
    const category = categories[i % categories.length]
    const isHot = i % 4 === 0
    const daysAgo = Math.floor(i / 2)

    return {
      id: now + i,
      title: getNewsTitle(category, i),
      category,
      date: getDate(daysAgo),
      summary: getSummary(category, i),
      hot: isHot,
      views: Math.floor(Math.random() * 3000) + 500,
      isNew: daysAgo === 0,
    }
  })
}

// 根据分类获取新闻标题
const getNewsTitle = (category, index) => {
  const titles = {
    '行业研究': [
      '2024年中国TIC检测行业并购趋势分析',
      '第三方检测机构市场竞争格局研究',
      '检测认证行业发展周期与投资机会',
      'TIC行业上市公司业绩对比分析',
      '检测行业细分市场增长潜力评估',
    ],
    '技术前沿': [
      'AI技术在尽职调查中的应用白皮书',
      '区块链在检测认证领域的应用探索',
      '大数据分析提升企业估值准确性',
      '机器学习在风险评估中的实践',
      '智能化检测技术的最新进展',
    ],
    '案例分析': [
      '某上市公司收购检测公司案例分析',
      '跨国检测机构并购整合全流程复盘',
      '国有检测机构混改成功案例研究',
      '民营企业IPO转型案例深度剖析',
      '检测行业并购中的估值调整机制',
    ],
    '合规指南': [
      '跨境并购中的合规风险与应对策略',
      '检测行业反垄断申报要点解析',
      '外资检测机构在华合规经营指南',
      '上市公司收购检测公司审核关注点',
      '检测行业数据安全合规要求',
    ],
    '市场分析': [
      '2024年Q1并购市场回顾与展望',
      '检测行业并购交易结构创新趋势',
      'PE/VC在检测行业投资策略分析',
      '检测行业估值倍数对比研究',
      '2024年检测行业并购预测报告',
    ],
  }

  const categoryTitles = titles[category] || titles['行业研究']
  return categoryTitles[index % categoryTitles.length]
}

const getSummary = (category, index) => {
  const summaries = {
    '行业研究': '本报告深入分析了中国TIC检测行业的并购趋势，探讨了龙头企业通过并购整合提升市场份额的策略路径...',
    '技术前沿': '人工智能技术正在革新传统的尽职调查流程，通过自然语言处理和机器学习算法大幅提升效率和准确性...',
    '案例分析': '本次收购标的公司为国内领先的第三方检测机构，交易金额达8亿元，是该细分领域最大规模的并购交易...',
    '合规指南': '跨境并购涉及多个司法管辖区的合规要求，企业需要提前做好风险评估，并制定相应的应对策略...',
    '市场分析': '本季度并购市场活跃度较去年同期有所提升，科技和医疗健康领域仍是热点，TIC行业交易数量显著增加...',
  }
  return summaries[category] || summaries['行业研究']
}

const getDate = (daysAgo) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split('T')[0]
}

// 实时更新模拟 - 每隔一段时间返回新数据
let updateInterval = null

export const subscribeToNews = (callback, interval = 30000) => {
  // 立即调用一次
  callback(getLiveNews())

  // 定期更新
  updateInterval = setInterval(() => {
    callback(getLiveNews())
  }, interval)

  // 返回取消订阅函数
  return () => {
    if (updateInterval) {
      clearInterval(updateInterval)
    }
  }
}
