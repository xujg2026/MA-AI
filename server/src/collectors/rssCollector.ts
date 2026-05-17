/**
 * RSS Feed Collector
 * 采集 RSS feeds 并存储到 news.db
 */

import * as path from 'path'
import * as fs from 'fs'
import crypto from 'crypto'

// RSSHub 配置
const RSSHUB_BASE_URL = process.env.RSSHUB_URL || 'http://localhost:1200'

// 类型定义
export interface RawArticle {
  url: string
  title: string
  body: string | null
  published_at: string | null
  md5: string
}

export interface FeedConfig {
  id: number
  name: string
  url: string
}

// MD5 计算
function computeMd5(url: string, title: string): string {
  return crypto.createHash('md5').update(url + title, 'utf8').digest('hex')
}

// 解析日期
function parseDate(dateStr: string | null): string | null {
  if (!dateStr) return null
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return null
    return date.toISOString()
  } catch {
    return null
  }
}

/**
 * 获取 feed 内容
 * 通过 RSSHub 代理获取 RSS feed
 */
async function fetchFeed(url: string, timeout: number = 30000): Promise<string> {
  const rsshubUrl = `${RSSHUB_BASE_URL}${url}`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(rsshubUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MA-AI-NewsBot/1.0)',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.text()
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Fetch timeout for ${url}`)
    }
    throw error
  }
}

/**
 * 解析 RSS XML
 * 简单的 XML 解析器，不依赖外部库
 */
function parseRSS(xml: string): RawArticle[] {
  const articles: RawArticle[] = []

  // 提取所有 item 标签
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1]

    // 提取 title
    const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(itemContent)
    const title = titleMatch ? decodeHTMLEntities(titleMatch[1].trim()) : ''

    // 提取 link
    const linkMatch = /<link[^>]*>([\s\S]*?)<\/link>/i.exec(itemContent)
    // link 可能有多行，处理一下
    let link = ''
    if (linkMatch) {
      let linkRaw = linkMatch[1].trim()
      // 去除 CDATA 包装
      if (linkRaw.startsWith('<![CDATA[') && linkRaw.endsWith(']]>')) {
        linkRaw = linkRaw.slice(11, -3)
      }
      link = linkRaw
    }

    // 提取 description/content
    let body = ''
    const descMatch = /<description[^>]*>([\s\S]*?)<\/description>/i.exec(itemContent)
    if (descMatch) {
      body = stripHTML(decodeHTMLEntities(descMatch[1]))
    }

    // 提取 pubDate
    const pubDateMatch = /<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i.exec(itemContent)
    const published_at = pubDateMatch ? parseDate(pubDateMatch[1].trim()) : null

    // 跳过没有 title 或 link 的条目
    if (!title || !link) continue

    const md5 = computeMd5(link, title)

    articles.push({
      url: link,
      title,
      body: body || null,
      published_at,
      md5,
    })
  }

  return articles
}

/**
 * 解码 HTML 实体
 */
function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&nbsp;': ' ',
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '…',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
  }

  let result = text
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'gi'), char)
  }

  // 处理数字实体
  result = result.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
  result = result.replace(/&#x([a-fA-F0-9]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))

  return result
}

/**
 * 去除 HTML 标签
 */
function stripHTML(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 采集单个 feed
 */
export async function collectFeed(feed: FeedConfig): Promise<RawArticle[]> {
  console.log(`[RSSCollector] Collecting: ${feed.name} (${feed.url})`)

  try {
    const xml = await fetchFeed(feed.url)
    const articles = parseRSS(xml)

    console.log(`[RSSCollector] Collected ${articles.length} articles from ${feed.name}`)
    return articles
  } catch (error: any) {
    console.error(`[RSSCollector] Failed to collect ${feed.name}:`, error.message)
    return []
  }
}

/**
 * 批量采集多个 feeds
 */
export async function collectFeeds(feeds: FeedConfig[]): Promise<Map<number, RawArticle[]>> {
  const results = new Map<number, RawArticle[]>()

  for (const feed of feeds) {
    const articles = await collectFeed(feed)
    if (articles.length > 0) {
      results.set(feed.id, articles)
    }

    // 避免请求过快
    await sleep(1000)
  }

  return results
}

/**
 * 工具函数：睡眠
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

console.log('[RSSCollector] Module loaded, RSSHub URL:', RSSHUB_BASE_URL)