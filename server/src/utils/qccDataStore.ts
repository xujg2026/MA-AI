/**
 * 企查查数据存储工具
 * 用于将企查查API获取的数据存储到本地SQLite
 */

import Database from 'better-sqlite3'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_PATH = path.join(__dirname, '../../data/target_companies.db')

// 目标公司数据接口
export interface TargetCompanyData {
  company_name: string
  registered_capital?: string
  legal_representative?: string
  business_scope?: string
  main_business?: string
  industry?: string
  region?: string
  establishment_date?: string
  shareholder_info?: any
  key_personnel?: any
  actual_controller?: any
  dishonest_info?: any
  business_exception?: any
  administrative_penalty?: any
  patent_info?: any
  trademark_info?: any
  bidding_info?: any
  qualifications?: any
  credit_evaluation?: any
  raw_data?: any
}

// 获取数据库连接
let dbInstance: Database.Database | null = null

export function getTargetDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH)
  }
  return dbInstance
}

// 关闭数据库连接
export function closeTargetDb(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

/**
 * 检查数据是否过期（7天有效期）
 */
export function isDataExpired(lastFetchTime: string | null): boolean {
  if (!lastFetchTime) {
    return true
  }

  const lastDate = new Date(lastFetchTime)
  const now = new Date()
  const daysDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)

  return daysDiff > 7
}

/**
 * 从本地数据库获取目标公司信息
 */
export function getTargetCompanyFromDb(companyName: string): (TargetCompanyData & { qcc_fetch_time: string }) | null {
  const db = getTargetDb()

  try {
    const row = db.prepare(
      'SELECT * FROM target_companies WHERE company_name = ?'
    ).get(companyName) as any

    if (row) {
      return {
        company_name: row.company_name,
        registered_capital: row.registered_capital,
        legal_representative: row.legal_representative,
        business_scope: row.business_scope,
        main_business: row.main_business,
        industry: row.industry,
        region: row.region,
        establishment_date: row.establishment_date,
        shareholder_info: row.shareholder_info ? JSON.parse(row.shareholder_info) : null,
        key_personnel: row.key_personnel ? JSON.parse(row.key_personnel) : null,
        actual_controller: row.actual_controller ? JSON.parse(row.actual_controller) : null,
        dishonest_info: row.dishonest_info ? JSON.parse(row.dishonest_info) : null,
        business_exception: row.business_exception ? JSON.parse(row.business_exception) : null,
        administrative_penalty: row.administrative_penalty ? JSON.parse(row.administrative_penalty) : null,
        patent_info: row.patent_info ? JSON.parse(row.patent_info) : null,
        trademark_info: row.trademark_info ? JSON.parse(row.trademark_info) : null,
        bidding_info: row.bidding_info ? JSON.parse(row.bidding_info) : null,
        qualifications: row.qualifications ? JSON.parse(row.qualifications) : null,
        credit_evaluation: row.credit_evaluation ? JSON.parse(row.credit_evaluation) : null,
        raw_data: row.raw_data ? JSON.parse(row.raw_data) : null,
        qcc_fetch_time: row.qcc_fetch_time,
      }
    }
    return null
  } catch (error) {
    console.error('[QccDataStore] getTargetCompanyFromDb error:', error)
    return null
  }
}

/**
 * 保存目标公司信息到本地数据库
 */
export function saveTargetCompany(data: TargetCompanyData): boolean {
  const db = getTargetDb()

  try {
    const sql = `
      INSERT OR REPLACE INTO target_companies (
        company_name,
        registered_capital,
        legal_representative,
        business_scope,
        main_business,
        industry,
        region,
        establishment_date,
        shareholder_info,
        key_personnel,
        actual_controller,
        dishonest_info,
        business_exception,
        administrative_penalty,
        patent_info,
        trademark_info,
        bidding_info,
        qualifications,
        credit_evaluation,
        raw_data,
        qcc_fetch_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    db.prepare(sql).run(
      data.company_name,
      data.registered_capital || null,
      data.legal_representative || null,
      data.business_scope || null,
      data.main_business || null,
      data.industry || null,
      data.region || null,
      data.establishment_date || null,
      data.shareholder_info ? JSON.stringify(data.shareholder_info) : null,
      data.key_personnel ? JSON.stringify(data.key_personnel) : null,
      data.actual_controller ? JSON.stringify(data.actual_controller) : null,
      data.dishonest_info ? JSON.stringify(data.dishonest_info) : null,
      data.business_exception ? JSON.stringify(data.business_exception) : null,
      data.administrative_penalty ? JSON.stringify(data.administrative_penalty) : null,
      data.patent_info ? JSON.stringify(data.patent_info) : null,
      data.trademark_info ? JSON.stringify(data.trademark_info) : null,
      data.bidding_info ? JSON.stringify(data.bidding_info) : null,
      data.qualifications ? JSON.stringify(data.qualifications) : null,
      data.credit_evaluation ? JSON.stringify(data.credit_evaluation) : null,
      data.raw_data ? JSON.stringify(data.raw_data) : null,
      new Date().toISOString()
    )

    console.log(`[QccDataStore] 已保存目标公司: ${data.company_name}`)
    return true
  } catch (error) {
    console.error('[QccDataStore] saveTargetCompany error:', error)
    return false
  }
}

/**
 * 从企查查API响应中提取基本信息
 */
export function extractCompanyInfoFromQcc(qccData: any): Partial<TargetCompanyData> {
  const companyInfo = qccData?.companyInfo || qccData || {}

  // 处理不同的字段名称格式
  return {
    registered_capital: companyInfo.注册资本 || companyInfo.registeredCapital || null,
    legal_representative: companyInfo.法定代表人 || companyInfo.legalRepresentative || null,
    business_scope: companyInfo.经营范围 || companyInfo.businessScope || null,
    main_business: companyInfo.主营业务 || companyInfo.mainBusiness || null,
    industry: companyInfo.所属行业 || companyInfo.industry || null,
    region: companyInfo.注册地 || companyInfo.region || null,
    establishment_date: companyInfo.成立日期 || companyInfo.establishmentDate || null,
  }
}

/**
 * 记录筛选日志
 */
export function logScreeningProcess(
  targetCompany: string,
  step: string,
  status: 'success' | 'failed' | 'fallback',
  duration: number,
  error?: string,
  details?: any
): void {
  const db = getTargetDb()

  try {
    db.prepare(`
      INSERT INTO screening_logs (target_company, step, status, duration, error, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      targetCompany,
      step,
      status,
      duration,
      error || null,
      details ? JSON.stringify(details) : null
    )
  } catch (err) {
    console.error('[QccDataStore] logScreeningProcess error:', err)
  }
}

/**
 * 获取已缓存的目标公司列表
 */
export function getCachedCompanies(limit: number = 100): string[] {
  const db = getTargetDb()

  try {
    const rows = db.prepare(`
      SELECT company_name FROM target_companies
      ORDER BY last_updated DESC
      LIMIT ?
    `).all(limit) as { company_name: string }[]

    return rows.map(r => r.company_name)
  } catch (error) {
    console.error('[QccDataStore] getCachedCompanies error:', error)
    return []
  }
}

/**
 * 删除过期缓存
 */
export function clearExpiredCache(): number {
  const db = getTargetDb()

  try {
    const result = db.prepare(`
      DELETE FROM target_companies
      WHERE datetime(last_updated) < datetime('now', '-30 days')
    `).run()

    console.log(`[QccDataStore] 清理了 ${result.changes} 条过期缓存`)
    return result.changes
  } catch (error) {
    console.error('[QccDataStore] clearExpiredCache error:', error)
    return 0
  }
}
