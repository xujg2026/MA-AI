/**
 * M&A新闻数据库工具
 * 用于管理新闻数据的数据库访问层
 */

import Database from 'better-sqlite3'
import * as path from 'path'
import * as fs from 'fs'

const DATA_DIR = path.join(process.cwd(), 'server/data')
const DB_PATH = path.join(DATA_DIR, 'news.db')

// 确保data目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// ============ 接口定义 ============

export interface Feed {
  id?: number
  name: string
  url: string
  source_type?: string
  category?: string | null
  tags?: string | null
  poll_interval_minutes?: number
  enabled?: number
  last_collected_at?: string | null
  created_at?: string
}

export interface Article {
  id?: number
  feed_id: number
  md5: string
  url: string
  title: string
  body?: string | null
  published_at?: string | null
  collected_at?: string
  is_tic?: number
  is_ma?: number
  sentiment?: string | null
  category?: string | null
  ai_confidence?: number | null
  analyzed_at?: string | null
  hot?: number
  views?: number
}

export interface MarketStat {
  id?: number
  label: string
  value: string
  change: string | null
  up: number
  icon: string | null
  updated_at?: string
}

// ============ 数据库初始化 ============

let db: Database.Database | null = null

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    initializeDb()
  }
  return db
}

function initializeDb(): void {
  const database = db!

  // 创建 feeds 表
  database.exec(`
    CREATE TABLE IF NOT EXISTS feeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      source_type TEXT DEFAULT 'rss',
      category TEXT,
      tags TEXT,
      poll_interval_minutes INTEGER DEFAULT 30,
      enabled INTEGER DEFAULT 1,
      last_collected_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 创建 articles 表
  database.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feed_id INTEGER REFERENCES feeds(id),
      md5 TEXT UNIQUE,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      published_at TEXT,
      collected_at TEXT DEFAULT CURRENT_TIMESTAMP,
      is_tic INTEGER DEFAULT 0,
      is_ma INTEGER DEFAULT 0,
      sentiment TEXT,
      category TEXT,
      ai_confidence REAL,
      analyzed_at TEXT,
      hot INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0
    )
  `)

  // 创建 market_stats 表
  database.exec(`
    CREATE TABLE IF NOT EXISTS market_stats (
      id INTEGER PRIMARY KEY,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      change TEXT,
      up INTEGER,
      icon TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 创建索引
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_articles_feed_id ON articles(feed_id);
    CREATE INDEX IF NOT EXISTS idx_articles_is_tic ON articles(is_tic);
    CREATE INDEX IF NOT EXISTS idx_articles_is_ma ON articles(is_ma);
    CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
    CREATE INDEX IF NOT EXISTS idx_articles_hot ON articles(hot);
    CREATE INDEX IF NOT EXISTS idx_articles_analyzed ON articles(analyzed_at);
  `)

  console.log('[newsDb] Database initialized at:', DB_PATH)
}

// ============ Feeds CRUD ============

export function createFeed(feed: Feed): number {
  const database = getDb()
  const stmt = database.prepare(`
    INSERT INTO feeds (name, url, source_type, category, tags, poll_interval_minutes, enabled)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    feed.name,
    feed.url,
    feed.source_type || 'rss',
    feed.category || null,
    feed.tags || null,
    feed.poll_interval_minutes || 30,
    feed.enabled !== undefined ? feed.enabled : 1
  )
  return result.lastInsertRowid as number
}

export function getFeeds(enabledOnly: boolean = false): Feed[] {
  const database = getDb()
  let stmt
  if (enabledOnly) {
    stmt = database.prepare('SELECT * FROM feeds WHERE enabled = 1 ORDER BY id')
    return stmt.all() as Feed[]
  }
  stmt = database.prepare('SELECT * FROM feeds ORDER BY id')
  return stmt.all() as Feed[]
}

export function getFeedById(id: number): Feed | null {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM feeds WHERE id = ?')
  return stmt.get(id) as Feed | null
}

export function updateFeed(id: number, updates: Partial<Feed>): boolean {
  const database = getDb()
  const fields: string[] = []
  const values: any[] = []

  if (updates.name !== undefined) {
    fields.push('name = ?')
    values.push(updates.name)
  }
  if (updates.url !== undefined) {
    fields.push('url = ?')
    values.push(updates.url)
  }
  if (updates.source_type !== undefined) {
    fields.push('source_type = ?')
    values.push(updates.source_type)
  }
  if (updates.category !== undefined) {
    fields.push('category = ?')
    values.push(updates.category)
  }
  if (updates.tags !== undefined) {
    fields.push('tags = ?')
    values.push(updates.tags)
  }
  if (updates.poll_interval_minutes !== undefined) {
    fields.push('poll_interval_minutes = ?')
    values.push(updates.poll_interval_minutes)
  }
  if (updates.enabled !== undefined) {
    fields.push('enabled = ?')
    values.push(updates.enabled)
  }
  if (updates.last_collected_at !== undefined) {
    fields.push('last_collected_at = ?')
    values.push(updates.last_collected_at)
  }

  if (fields.length === 0) return false

  values.push(id)
  const stmt = database.prepare(`UPDATE feeds SET ${fields.join(', ')} WHERE id = ?`)
  const result = stmt.run(...values)
  return result.changes > 0
}

export function deleteFeed(id: number): boolean {
  const database = getDb()
  const stmt = database.prepare('DELETE FROM feeds WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

export function updateFeedLastCollected(id: number): void {
  const database = getDb()
  const stmt = database.prepare('UPDATE feeds SET last_collected_at = CURRENT_TIMESTAMP WHERE id = ?')
  stmt.run(id)
}

// ============ Articles CRUD ============

export function insertArticle(article: Article): boolean {
  const database = getDb()
  const stmt = database.prepare(`
    INSERT OR IGNORE INTO articles (feed_id, md5, url, title, body, published_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    article.feed_id,
    article.md5,
    article.url,
    article.title,
    article.body || null,
    article.published_at || null
  )
  return result.changes > 0
}

export function getArticlesByFeedId(feedId: number, limit: number = 100): Article[] {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM articles WHERE feed_id = ? ORDER BY published_at DESC LIMIT ?')
  return stmt.all(feedId, limit) as Article[]
}

export function getArticlesByTIC(limit: number = 100, offset: number = 0): Article[] {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM articles WHERE is_tic = 1 ORDER BY published_at DESC LIMIT ? OFFSET ?')
  return stmt.all(limit, offset) as Article[]
}

export function getArticlesByMA(limit: number = 100, offset: number = 0): Article[] {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM articles WHERE is_ma = 1 ORDER BY published_at DESC LIMIT ? OFFSET ?')
  return stmt.all(limit, offset) as Article[]
}

export function getTICMAArticles(limit: number = 100, offset: number = 0): Article[] {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM articles WHERE is_tic = 1 OR is_ma = 1 ORDER BY published_at DESC LIMIT ? OFFSET ?')
  return stmt.all(limit, offset) as Article[]
}

export function getAllArticles(page: number = 1, pageSize: number = 20, category?: string): { articles: Article[], total: number } {
  const database = getDb()
  const offset = (page - 1) * pageSize

  let countStmt
  let dataStmt
  const params: any[] = []

  if (category) {
    countStmt = database.prepare('SELECT COUNT(*) as count FROM articles WHERE category = ?')
    const countResult = countStmt.get(category) as { count: number }
    dataStmt = database.prepare('SELECT * FROM articles WHERE category = ? ORDER BY published_at DESC LIMIT ? OFFSET ?')
    params.push(category, pageSize, offset)
    return { articles: dataStmt.all(category, pageSize, offset) as Article[], total: countResult.count }
  }

  countStmt = database.prepare('SELECT COUNT(*) as count FROM articles')
  const countResult = countStmt.get() as { count: number }
  dataStmt = database.prepare('SELECT * FROM articles ORDER BY published_at DESC LIMIT ? OFFSET ?')
  return { articles: dataStmt.all(pageSize, offset) as Article[], total: countResult.count }
}

export function getHotArticles(limit: number = 10): Article[] {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM articles WHERE hot = 1 ORDER BY views DESC LIMIT ?')
  return stmt.all(limit) as Article[]
}

export function getLatestArticles(limit: number = 10): Article[] {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM articles ORDER BY collected_at DESC LIMIT ?')
  return stmt.all(limit) as Article[]
}

export function getUnanalyzedArticles(limit: number = 100): Article[] {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM articles WHERE analyzed_at IS NULL ORDER BY collected_at DESC LIMIT ?')
  return stmt.all(limit) as Article[]
}

export function updateArticleAnalysis(id: number, analysis: {
  is_tic: number
  is_ma: number
  sentiment: string | null
  category: string | null
  ai_confidence: number | null
}): boolean {
  const database = getDb()
  const stmt = database.prepare(`
    UPDATE articles
    SET is_tic = ?, is_ma = ?, sentiment = ?, category = ?, ai_confidence = ?, analyzed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
  const result = stmt.run(
    analysis.is_tic,
    analysis.is_ma,
    analysis.sentiment,
    analysis.category,
    analysis.ai_confidence,
    id
  )
  return result.changes > 0
}

export function updateArticleHot(id: number, hot: number): boolean {
  const database = getDb()
  const stmt = database.prepare('UPDATE articles SET hot = ? WHERE id = ?')
  const result = stmt.run(hot, id)
  return result.changes > 0
}

export function updateArticleViews(id: number, views: number): boolean {
  const database = getDb()
  const stmt = database.prepare('UPDATE articles SET views = ? WHERE id = ?')
  const result = stmt.run(views, id)
  return result.changes > 0
}

// ============ Market Stats CRUD ============

export function getMarketStats(): MarketStat[] {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM market_stats ORDER BY id')
  return stmt.all() as MarketStat[]
}

export function upsertMarketStat(stat: MarketStat): void {
  const database = getDb()
  const stmt = database.prepare(`
    INSERT INTO market_stats (id, label, value, change, up, icon)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      label = excluded.label,
      value = excluded.value,
      change = excluded.change,
      up = excluded.up,
      icon = excluded.icon,
      updated_at = CURRENT_TIMESTAMP
  `)
  stmt.run(stat.id, stat.label, stat.value, stat.change, stat.up, stat.icon)
}

// ============ 统计与健康检查 ============

export function getArticleCount(): number {
  const database = getDb()
  const stmt = database.prepare('SELECT COUNT(*) as count FROM articles')
  const result = stmt.get() as { count: number }
  return result.count
}

export function getTICArticleCount(): number {
  const database = getDb()
  const stmt = database.prepare('SELECT COUNT(*) as count FROM articles WHERE is_tic = 1')
  const result = stmt.get() as { count: number }
  return result.count
}

export function getMAArticleCount(): number {
  const database = getDb()
  const stmt = database.prepare('SELECT COUNT(*) as count FROM articles WHERE is_ma = 1')
  const result = stmt.get() as { count: number }
  return result.count
}

export function getUnanalyzedCount(): number {
  const database = getDb()
  const stmt = database.prepare('SELECT COUNT(*) as count FROM articles WHERE analyzed_at IS NULL')
  const result = stmt.get() as { count: number }
  return result.count
}

export function checkNewsDb(): boolean {
  try {
    const database = getDb()
    database.exec('SELECT 1')
    return true
  } catch (e) {
    return false
  }
}

// 关闭数据库连接
export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}