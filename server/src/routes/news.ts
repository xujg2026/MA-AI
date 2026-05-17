/**
 * News API Routes
 * 新闻相关 REST API
 */

import { Router } from 'express'
import {
  getFeeds,
  createFeed,
  updateFeed,
  deleteFeed,
  getArticlesByFeedId,
  getTICMAArticles,
  getAllArticles,
  getHotArticles,
  getLatestArticles,
  getMarketStats,
  getArticleCount,
  getTICArticleCount,
  getMAArticleCount,
  getUnanalyzedCount,
  checkNewsDb,
} from '../utils/newsDb.js'
import { triggerCollection, triggerAnalysis } from '../collectors/scheduler.js'

const router = Router()

// ============ 健康检查 ============

router.get('/health', (req, res) => {
  const dbOk = checkNewsDb()
  res.json({
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk ? 'ok' : 'error',
    article_count: getArticleCount(),
    tic_count: getTICArticleCount(),
    ma_count: getMAArticleCount(),
    unanalyzed_count: getUnanalyzedCount(),
  })
})

// ============ 文章 API ============

// GET /api/news/live - 实时快讯
router.get('/live', (req, res) => {
  try {
    // 获取最新采集的文章 (来自财联社等快讯源)
    const articles = getLatestArticles(20)
    const liveNews = articles.map(a => ({
      id: a.id,
      title: a.title,
      category: a.category || '快讯',
      hot: a.hot === 1,
      sentiment: a.sentiment,
      time: formatTime(a.collected_at),
      views: a.views,
    }))
    res.json({ success: true, data: liveNews })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/news/hot - 热门文章
router.get('/hot', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const articles = getHotArticles(limit)
    const hotNews = articles.map(a => ({
      id: a.id,
      title: a.title,
      category: a.category || '热门',
      hot: true,
      sentiment: a.sentiment,
      time: formatTime(a.published_at),
      views: a.views,
    }))
    res.json({ success: true, data: hotNews })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/news/all - 所有/筛选文章
router.get('/all', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 20
    const category = req.query.category as string | undefined
    const ticOnly = req.query.tic === 'true'

    let result
    if (ticOnly) {
      const articles = getTICMAArticles(pageSize, (page - 1) * pageSize)
      result = { articles, total: getTICArticleCount() + getMAArticleCount() }
    } else {
      result = getAllArticles(page, pageSize, category)
    }

    res.json({
      success: true,
      data: result.articles.map(a => ({
        id: a.id,
        title: a.title,
        body: a.body?.substring(0, 200) || '',
        category: a.category,
        date: a.published_at,
        hot: a.hot === 1,
        views: a.views,
        is_tic: a.is_tic === 1,
        is_ma: a.is_ma === 1,
        sentiment: a.sentiment,
      })),
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pageSize),
      },
    })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/news/stats - 市场数据
router.get('/stats', (req, res) => {
  try {
    const stats = getMarketStats()
    if (stats.length === 0) {
      // 返回默认统计数据
      res.json({
        success: true,
        data: [
          { label: 'TIC行业指数', value: '3865.32', change: '+1.24%', up: true, icon: '📈' },
          { label: '今日并购', value: String(getMAArticleCount()), change: '+3', up: true, icon: '🤝' },
          { label: '待审项目', value: '48', change: '+5', up: true, icon: '📋' },
          { label: '成交金额(亿)', value: '8.5', change: '+15%', up: true, icon: '💰' },
          { label: 'TIC文章', value: String(getTICArticleCount()), change: '+12', up: true, icon: '📰' },
          { label: '行业招聘', value: '892', change: '-12%', up: false, icon: '👥' },
        ],
      })
    } else {
      res.json({ success: true, data: stats })
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============ Feeds 管理 API ============

// GET /api/news/feeds - 获取新闻源列表
router.get('/feeds', (req, res) => {
  try {
    const enabledOnly = req.query.enabled === 'true'
    const feeds = getFeeds(enabledOnly)
    res.json({ success: true, data: feeds })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/news/feeds - 添加新闻源
router.post('/feeds', (req, res) => {
  try {
    const { name, url, source_type, category, tags, poll_interval_minutes, enabled } = req.body

    if (!name || !url) {
      res.status(400).json({ success: false, error: 'name and url are required' })
      return
    }

    const id = createFeed({
      name,
      url,
      source_type: source_type || 'rss',
      category: category || null,
      tags: tags || null,
      poll_interval_minutes: poll_interval_minutes || 30,
      enabled: enabled !== undefined ? enabled : 1,
    })

    res.status(201).json({ success: true, data: { id } })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// PUT /api/news/feeds/:id - 更新新闻源
router.put('/feeds/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid feed id' })
      return
    }

    const success = updateFeed(id, req.body)
    if (success) {
      res.json({ success: true })
    } else {
      res.status(404).json({ success: false, error: 'Feed not found' })
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// DELETE /api/news/feeds/:id - 删除新闻源
router.delete('/feeds/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid feed id' })
      return
    }

    const success = deleteFeed(id)
    if (success) {
      res.json({ success: true })
    } else {
      res.status(404).json({ success: false, error: 'Feed not found' })
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============ 手动触发 ============

// POST /api/news/collect - 手动触发采集
router.post('/collect', async (req, res) => {
  try {
    await triggerCollection()
    res.json({ success: true, message: 'Collection triggered' })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/news/analyze - 手动触发 AI 分析
router.post('/analyze', async (req, res) => {
  try {
    const count = parseInt(req.query.count as string) || 100
    const analyzed = await triggerAnalysis(count)
    res.json({ success: true, analyzed_count: analyzed })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============ 辅助函数 ============

function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60 * 1000) return '刚刚'
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`

    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export { router as newsRouter }