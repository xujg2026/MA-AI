/**
 * A股股票数据库工具
 * 用于从本地SQLite数据库查询和搜索股票
 */

import Database from 'better-sqlite3'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_PATH = path.join(__dirname, '../../data/a_stocks.db')

// 股票接口
export interface Stock {
  row_id: number
  code: string
  name: string
  business_scope: string
  company_intro: string
  main_business: string
  main_products: string
  region: string
  is_st: number
  is_star_st: number
}

// 搜索结果接口
export interface StockWithScore extends Stock {
  match_score: number
}

// 获取数据库连接
let dbInstance: Database.Database | null = null

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH, {
      verbose: process.env.DEBUG ? console.log : undefined
    })
  }
  return dbInstance
}

// 关闭数据库连接
export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

/**
 * 根据关键词搜索股票
 * @param keywords 关键词数组
 * @param limit 返回数量限制
 * @returns 匹配的股票列表
 */
export function searchStocks(keywords: string[], limit: number = 50): StockWithScore[] {
  const db = getDb()

  if (!keywords || keywords.length === 0) {
    return []
  }

  // 构建搜索条件
  const conditions: string[] = []
  const params: any[] = []

  for (const keyword of keywords) {
    if (keyword && keyword.trim()) {
      const kw = `%${keyword.trim()}%`
      conditions.push(`(main_business LIKE ? OR main_products LIKE ? OR business_scope LIKE ?)`)
      params.push(kw, kw, kw)
    }
  }

  if (conditions.length === 0) {
    return []
  }

  // 排除ST股票
  const whereClause = conditions.join(' OR ')
  const sql = `
    SELECT *,
      (CASE WHEN is_st = 1 OR is_star_st = 1 THEN 0 ELSE 1 END) as valid
    FROM a_stocks
    WHERE (${whereClause})
      AND is_st = 0
      AND is_star_st = 0
    ORDER BY valid DESC, row_id DESC
    LIMIT ?
  `
  params.push(limit)

  try {
    const rows = db.prepare(sql).all(...params) as Stock[]

    // 计算匹配分数
    const results: StockWithScore[] = rows.map(stock => {
      let matchScore = 0
      const searchText = `${stock.main_business || ''} ${stock.main_products || ''} ${stock.business_scope || ''}`.toLowerCase()

      for (const keyword of keywords) {
        if (keyword && searchText.includes(keyword.toLowerCase())) {
          matchScore += 10
        }
      }

      return {
        ...stock,
        match_score: matchScore
      }
    })

    // 按匹配分数排序
    results.sort((a, b) => b.match_score - a.match_score)

    return results
  } catch (error) {
    console.error('[StockDb] searchStocks error:', error)
    return []
  }
}

/**
 * 根据代码获取单只股票信息
 * @param code 股票代码
 * @returns 股票信息或null
 */
export function getStockByCode(code: string): Stock | null {
  const db = getDb()

  try {
    const row = db.prepare('SELECT * FROM a_stocks WHERE code = ?').get(code) as Stock | undefined
    return row || null
  } catch (error) {
    console.error('[StockDb] getStockByCode error:', error)
    return null
  }
}

/**
 * 根据名称搜索股票
 * @param name 股票名称（支持模糊匹配）
 * @param limit 返回数量限制
 * @returns 匹配的股票列表
 */
export function searchStocksByName(name: string, limit: number = 20): Stock[] {
  const db = getDb()

  if (!name || !name.trim()) {
    return []
  }

  const sql = `
    SELECT * FROM a_stocks
    WHERE name LIKE ?
      AND is_st = 0
      AND is_star_st = 0
    ORDER BY row_id DESC
    LIMIT ?
  `

  try {
    const rows = db.prepare(sql).all(`%${name.trim()}%`, limit) as Stock[]
    return rows
  } catch (error) {
    console.error('[StockDb] searchStocksByName error:', error)
    return []
  }
}

/**
 * 根据行业搜索股票
 * @param industry 行业名称
 * @param limit 返回数量限制
 * @returns 匹配的股票列表
 */
export function searchStocksByIndustry(industry: string, limit: number = 50): Stock[] {
  const db = getDb()

  if (!industry || !industry.trim()) {
    return []
  }

  const sql = `
    SELECT * FROM a_stocks
    WHERE main_business LIKE ?
      AND is_st = 0
      AND is_star_st = 0
    ORDER BY row_id DESC
    LIMIT ?
  `

  try {
    const rows = db.prepare(sql).all(`%${industry.trim()}%`, limit) as Stock[]
    return rows
  } catch (error) {
    console.error('[StockDb] searchStocksByIndustry error:', error)
    return []
  }
}

/**
 * 获取所有股票数量
 */
export function getTotalCount(): number {
  const db = getDb()

  try {
    const result = db.prepare('SELECT COUNT(*) as count FROM a_stocks').get() as { count: number }
    return result.count
  } catch (error) {
    console.error('[StockDb] getTotalCount error:', error)
    return 0
  }
}

/**
 * 获取非ST股票数量
 */
export function getValidCount(): number {
  const db = getDb()

  try {
    const result = db.prepare('SELECT COUNT(*) as count FROM a_stocks WHERE is_st = 0 AND is_star_st = 0').get() as { count: number }
    return result.count
  } catch (error) {
    console.error('[StockDb] getValidCount error:', error)
    return 0
  }
}

/**
 * 使用FTS5全文搜索（如果可用）
 * @param keywords 关键词数组
 * @param limit 返回数量限制
 * @returns 匹配的股票列表
 */
export function searchStocksFts(keywords: string[], limit: number = 50): StockWithScore[] {
  const db = getDb()

  if (!keywords || keywords.length === 0) {
    return []
  }

  try {
    // 尝试使用FTS5
    const ftsQuery = keywords.map(k => `"${k.trim()}"`).join(' OR ')

    const sql = `
      SELECT s.*,
        (SELECT COUNT(*) FROM a_stocks_fts f WHERE f.main_business MATCH s.main_business) as fts_score
      FROM a_stocks s
      WHERE s.row_id IN (
        SELECT rowid FROM a_stocks_fts WHERE main_business MATCH ? OR main_products MATCH ? OR business_scope MATCH ?
      )
        AND s.is_st = 0
        AND s.is_star_st = 0
      ORDER BY s.row_id DESC
      LIMIT ?
    `

    const searchTerm = keywords.join(' OR ')
    const rows = db.prepare(sql).all(searchTerm, searchTerm, searchTerm, limit) as (Stock & { fts_score: number })[]

    return rows.map(stock => ({
      ...stock,
      match_score: stock.fts_score * 10
    }))
  } catch (error) {
    // FTS不可用，降级到LIKE搜索
    console.warn('[StockDb] FTS search failed, falling back to LIKE:', error)
    return searchStocks(keywords, limit)
  }
}

// 调试/测试函数
export function testConnection(): boolean {
  try {
    const db = getDb()
    const result = db.prepare('SELECT 1 as test').get()
    console.log('[StockDb] Database connection OK:', result)
    return true
  } catch (error) {
    console.error('[StockDb] Database connection failed:', error)
    return false
  }
}
