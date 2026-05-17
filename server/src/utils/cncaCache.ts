/**
 * CNCA认证证书缓存工具
 * 用于存储CNCA认证查询结果，24小时有效，避免重复爬取
 */

import Database from 'better-sqlite3'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '../../data')
const DB_PATH = path.join(DATA_DIR, 'cnca_cache.db')

// CNCA认证查询结果接口
export interface CncaCertResult {
  hasCertification: boolean    // 是否有认证
  certNo: string | null         // 证书编号
  instCode: string | null      // 机构代码
  orgCode: string | null       // 组织机构代码
  detailUrl: string | null     // 详情URL
  cachedAt: string              // 缓存时间 (ISO string)
}

// 缓存数据库记录
interface CacheRecord {
  id: number
  company_name: string
  credit_code: string | null
  result: string  // JSON stringified CncaCertResult
  created_at: string
  expires_at: string
}

// 数据库连接单例
let dbInstance: Database.Database | null = null

/**
 * 获取数据库连接
 */
export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH, {
      verbose: process.env.DEBUG ? console.log : undefined
    })
  }
  return dbInstance
}

/**
 * 关闭数据库连接
 */
export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

/**
 * 初始化CNCA缓存数据库
 */
export function initCncaCacheDb(): void {
  const db = getDb()

  // 创建cnca_cert_cache表
  db.exec(`
    CREATE TABLE IF NOT EXISTS cnca_cert_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      credit_code TEXT,
      result TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT NOT NULL
    )
  `)

  // 创建索引
  db.exec(`CREATE INDEX IF NOT EXISTS idx_cnca_cache_company ON cnca_cert_cache(company_name)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_cnca_cache_expires ON cnca_cert_cache(expires_at)`)

  console.log('[CncaCache] Database initialized successfully')
}

/**
 * 生成缓存key
 * 格式: ${companyName}|${creditCode}
 */
export function generateCacheKey(companyName: string, creditCode: string | null): string {
  return `${companyName}|${creditCode || ''}`
}

/**
 * 设置缓存
 * @param companyName 公司名称
 * @param creditCode 统一社会信用代码
 * @param result 认证结果
 * @param ttlHours 缓存有效期（小时），默认24小时
 * @returns 是否成功
 */
export function setCncaCache(
  companyName: string,
  creditCode: string | null,
  result: CncaCertResult,
  ttlHours: number = 24
): boolean {
  const db = getDb()

  try {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000).toISOString()

    // 先删除旧缓存（同一公司+信用代码）
    db.prepare(`
      DELETE FROM cnca_cert_cache
      WHERE company_name = ? AND credit_code IS ?
    `).run(companyName, creditCode || null)

    // 插入新缓存
    const stmt = db.prepare(`
      INSERT INTO cnca_cert_cache (company_name, credit_code, result, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `)

    stmt.run(
      companyName,
      creditCode || null,
      JSON.stringify(result),
      now.toISOString(),
      expiresAt
    )

    console.log(`[CncaCache] Cache set: ${generateCacheKey(companyName, creditCode)}`)
    return true
  } catch (error) {
    console.error('[CncaCache] setCncaCache error:', error)
    return false
  }
}

/**
 * 获取缓存
 * @param companyName 公司名称
 * @param creditCode 统一社会信用代码
 * @returns 缓存结果或null（已过期或不存在）
 */
export function getCncaCache(
  companyName: string,
  creditCode: string | null
): CncaCertResult | null {
  const db = getDb()

  try {
    const now = new Date().toISOString()

    // 查询缓存，忽略已过期的
    const row = db.prepare(`
      SELECT result FROM cnca_cert_cache
      WHERE company_name = ? AND credit_code IS ? AND expires_at > ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(companyName, creditCode || null, now) as { result: string } | undefined

    if (row) {
      console.log(`[CncaCache] Cache hit: ${generateCacheKey(companyName, creditCode)}`)
      return JSON.parse(row.result) as CncaCertResult
    }

    console.log(`[CncaCache] Cache miss: ${generateCacheKey(companyName, creditCode)}`)
    return null
  } catch (error) {
    console.error('[CncaCache] getCncaCache error:', error)
    return null
  }
}

/**
 * 删除缓存
 * @param companyName 公司名称
 * @param creditCode 统一社会信用代码
 * @returns 是否成功
 */
export function deleteCncaCache(
  companyName: string,
  creditCode: string | null
): boolean {
  const db = getDb()

  try {
    const result = db.prepare(`
      DELETE FROM cnca_cert_cache
      WHERE company_name = ? AND credit_code IS ?
    `).run(companyName, creditCode || null)

    console.log(`[CncaCache] Cache deleted: ${generateCacheKey(companyName, creditCode)}, affected=${result.changes}`)
    return result.changes > 0
  } catch (error) {
    console.error('[CncaCache] deleteCncaCache error:', error)
    return false
  }
}

/**
 * 清除所有过期缓存
 * @returns 清除的记录数
 */
export function clearExpiredCncaCache(): number {
  const db = getDb()

  try {
    const now = new Date().toISOString()
    const result = db.prepare(`
      DELETE FROM cnca_cert_cache
      WHERE expires_at <= ?
    `).run(now)

    console.log(`[CncaCache] Expired cache cleared: deleted=${result.changes}`)
    return result.changes
  } catch (error) {
    console.error('[CncaCache] clearExpiredCncaCache error:', error)
    return 0
  }
}

/**
 * 清除所有CNCA缓存
 * @returns 清除的记录数
 */
export function clearAllCncaCache(): number {
  const db = getDb()

  try {
    const result = db.prepare('DELETE FROM cnca_cert_cache').run()
    console.log(`[CncaCache] All cache cleared: deleted=${result.changes}`)
    return result.changes
  } catch (error) {
    console.error('[CncaCache] clearAllCncaCache error:', error)
    return 0
  }
}

/**
 * 获取缓存统计
 */
export function getCncaCacheStats(): { total: number; expired: number; active: number } {
  const db = getDb()

  try {
    const now = new Date().toISOString()
    const total = db.prepare('SELECT COUNT(*) as count FROM cnca_cert_cache').get() as { count: number }
    const expired = db.prepare('SELECT COUNT(*) as count FROM cnca_cert_cache WHERE expires_at <= ?').get(now) as { count: number }

    return {
      total: total.count,
      expired: expired.count,
      active: total.count - expired.count
    }
  } catch (error) {
    console.error('[CncaCache] getCncaCacheStats error:', error)
    return { total: 0, expired: 0, active: 0 }
  }
}

/**
 * 测试数据库连接
 */
export function testConnection(): boolean {
  try {
    const db = getDb()
    const result = db.prepare('SELECT 1 as test').get()
    console.log('[CncaCache] Database connection OK:', result)
    return true
  } catch (error) {
    console.error('[CncaCache] Database connection failed:', error)
    return false
  }
}

// 初始化数据库
initCncaCacheDb()