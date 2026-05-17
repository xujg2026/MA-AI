/**
 * News Collection Scheduler
 * 定时任务调度器
 */

import { collectFeeds, FeedConfig } from './rssCollector.js'
import { getFeeds, updateFeedLastCollected, insertArticle } from '../utils/newsDb.js'
import { startPeriodicAnalysis, stopPeriodicAnalysis } from './newsAnalyzer.js'

// 调度状态
let collectionTimer: NodeJS.Timeout | null = null
let isRunning = false

/**
 * 执行一次数据采集
 */
export async function runCollection(): Promise<void> {
  if (isRunning) {
    console.log('[Scheduler] Collection already in progress, skipping...')
    return
  }

  isRunning = true
  console.log('[Scheduler] Starting news collection...')

  try {
    // 获取所有启用的 feeds
    const feeds = getFeeds(true)

    if (feeds.length === 0) {
      console.log('[Scheduler] No enabled feeds found')
      return
    }

    console.log(`[Scheduler] Collecting from ${feeds.length} feeds`)

    // 转换为 FeedConfig 格式
    const feedConfigs: FeedConfig[] = feeds.map(f => ({
      id: f.id!,
      name: f.name,
      url: f.url,
    }))

    // 批量采集
    const results = await collectFeeds(feedConfigs)

    // 存储到数据库
    let totalArticles = 0
    for (const [feedId, articles] of results) {
      for (const article of articles) {
        if (insertArticle({
          feed_id: feedId,
          md5: article.md5,
          url: article.url,
          title: article.title,
          body: article.body,
          published_at: article.published_at,
          is_tic: 0,
          is_ma: 0,
          hot: 0,
          views: 0,
        })) {
          totalArticles++
        }
      }

      // 更新采集时间
      updateFeedLastCollected(feedId)
    }

    console.log(`[Scheduler] Collection complete: ${totalArticles} new articles from ${results.size} feeds`)
  } catch (error: any) {
    console.error('[Scheduler] Collection failed:', error.message)
  } finally {
    isRunning = false
  }
}

/**
 * 启动采集调度器
 * @param collectionIntervalMinutes 采集间隔（分钟）
 * @param analysisIntervalMinutes AI 分析间隔（分钟）
 */
export function startScheduler(
  collectionIntervalMinutes: number = 5,
  analysisIntervalMinutes: number = 60
): void {
  if (collectionTimer) {
    console.log('[Scheduler] Scheduler already running')
    return
  }

  console.log(`[Scheduler] Starting scheduler...`)
  console.log(`[Scheduler] Collection interval: ${collectionIntervalMinutes} minutes`)
  console.log(`[Scheduler] Analysis interval: ${analysisIntervalMinutes} minutes`)

  // 立即执行一次采集
  runCollection().catch(console.error)

  // 设置定期采集
  const intervalMs = collectionIntervalMinutes * 60 * 1000
  collectionTimer = setInterval(() => {
    runCollection().catch(console.error)
  }, intervalMs)

  // 启动 AI 分析
  startPeriodicAnalysis(analysisIntervalMinutes)

  console.log('[Scheduler] Scheduler started')
}

/**
 * 停止调度器
 */
export function stopScheduler(): void {
  if (collectionTimer) {
    clearInterval(collectionTimer)
    collectionTimer = null
    console.log('[Scheduler] Collection timer stopped')
  }

  stopPeriodicAnalysis()
  console.log('[Scheduler] Scheduler stopped')
}

/**
 * 手动触发一次采集
 */
export async function triggerCollection(): Promise<void> {
  await runCollection()
}

/**
 * 手动触发一次 AI 分析
 */
export async function triggerAnalysis(count: number = 100): Promise<number> {
  const { batchAnalyze } = await import('./newsAnalyzer.js')
  return await batchAnalyze(count)
}