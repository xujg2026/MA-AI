/**
 * Initial Feeds Configuration
 * 初始 RSS Feeds 配置
 */

import { createFeed, getFeeds } from '../utils/newsDb.js'

// 默认 feeds 配置
const DEFAULT_FEEDS = [
  {
    name: '财联社电报',
    url: '/cls/telegraph',
    source_type: 'rss',
    category: 'financial',
    tags: JSON.stringify(['快讯', '实时', 'A股']),
    poll_interval_minutes: 5,
    enabled: 1,
  },
  {
    name: '华尔街见闻',
    url: '/wallstreetcn/news/global',
    source_type: 'rss',
    category: 'financial',
    tags: JSON.stringify(['财经', '宏观', '市场']),
    poll_interval_minutes: 30,
    enabled: 1,
  },
  {
    name: '第一财经',
    url: '/yicai/news',
    source_type: 'rss',
    category: 'financial',
    tags: JSON.stringify(['财经', '产业']),
    poll_interval_minutes: 30,
    enabled: 1,
  },
  {
    name: '36氪',
    url: '/36kr/news/latest',
    source_type: 'rss',
    category: 'financial',
    tags: JSON.stringify(['科技', '创业', '投资']),
    poll_interval_minutes: 30,
    enabled: 1,
  },
  {
    name: '格隆汇热门文章',
    url: '/gelonghui/hot-article',
    source_type: 'rss',
    category: 'financial',
    tags: JSON.stringify(['港股', '投资', '市场']),
    poll_interval_minutes: 30,
    enabled: 1,
  },
  {
    name: '虎嗅',
    url: '/huxiu/article',
    source_type: 'rss',
    category: 'financial',
    tags: JSON.stringify(['科技', '商业']),
    poll_interval_minutes: 30,
    enabled: 1,
  },
]

/**
 * 初始化默认 feeds
 * 如果已存在则跳过
 */
export function initializeDefaultFeeds(): void {
  const existingFeeds = getFeeds()

  if (existingFeeds.length > 0) {
    console.log(`[initFeeds] ${existingFeeds.length} feeds already exist, skipping initialization`)
    return
  }

  console.log('[initFeeds] Initializing default feeds...')

  for (const feed of DEFAULT_FEEDS) {
    try {
      const id = createFeed(feed)
      console.log(`[initFeeds] Created feed: ${feed.name} (id=${id})`)
    } catch (error: any) {
      console.error(`[initFeeds] Failed to create feed ${feed.name}:`, error.message)
    }
  }

  console.log('[initFeeds] Default feeds initialization complete')
}

// 导出配置供其他模块使用
export { DEFAULT_FEEDS }