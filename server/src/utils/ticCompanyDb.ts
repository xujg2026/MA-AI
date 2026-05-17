/**
 * TIC 企业数据库工具
 * 用于管理TIC企业数据的数据库访问层
 */

import Database from 'better-sqlite3'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '../../data')
const DB_PATH = path.join(DATA_DIR, 'projects.db')

// 确保data目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// TIC 企业接口
export interface TicCompany {
  id: number
  company_name: string
  business_status: string | null
  legal_representative: string | null
  registered_capital: string | null
  registered_capital_currency: string | null
  establishment_date: string | null
  approval_date: string | null
  province: string | null
  city: string | null
  county: string | null
  township: string | null
  credit_code: string | null
  phone: string | null
  email: string | null
  employee_count: number | null
  company_type: string | null
  organization_form: string | null
  industry_category: string | null
  industry_major: string | null
  industry_middle: string | null
  industry_minor: string | null
  website: string | null
  registered_address: string | null
  mailing_address: string | null
  is_listed: string | null
  // 风险字段
  dishonest_status: string | null
  被执行_status: string | null
  high_consumer_status: string | null
  judicial_freeze_status: string | null
  bankruptcy_restructuring_status: string | null
  financial_penalty_status: string | null
  serious_violation_status: string | null
  business_exception_status: string | null
  tax_violation_status: string | null
  abnormal_status: string | null
  // 扩展信息
  business_scope: string | null
  source_file: string | null
  imported_at: string
}

// TIC 企业筛选器
export interface TicCompanyFilters {
  keyword?: string
  industry?: string
  province?: string
  city?: string
  county?: string
  companyType?: string
  employeeCountMin?: number
  employeeCountMax?: number
  registeredCapitalMin?: number
  registeredCapitalMax?: number
  hasPhone?: string
  hasWebsite?: string
  businessScope?: string
}

// TIC 企业查询结果
export interface TicCompanyQueryResult {
  list: TicCompany[]
  total: number
  page: number
  pageSize: number
  totalPages: number
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
 * 初始化 TIC 企业数据库
 * 创建表结构
 */
export function initTicCompanyDb(): void {
  const db = getDb()

  // 创建 tic_companies 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS tic_companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT UNIQUE NOT NULL,
      business_status TEXT,
      legal_representative TEXT,
      registered_capital TEXT,
      registered_capital_currency TEXT,
      establishment_date TEXT,
      approval_date TEXT,
      province TEXT,
      city TEXT,
      county TEXT,
      township TEXT,
      credit_code TEXT,
      phone TEXT,
      email TEXT,
      employee_count INTEGER,
      company_type TEXT,
      organization_form TEXT,
      industry_category TEXT,
      industry_major TEXT,
      industry_middle TEXT,
      industry_minor TEXT,
      website TEXT,
      registered_address TEXT,
      mailing_address TEXT,
      is_listed TEXT,
      -- 风险字段
      dishonest_status TEXT,
      被执行_status TEXT,
      high_consumer_status TEXT,
      judicial_freeze_status TEXT,
      bankruptcy_restructuring_status TEXT,
      financial_penalty_status TEXT,
      serious_violation_status TEXT,
      business_exception_status TEXT,
      tax_violation_status TEXT,
      abnormal_status TEXT,
      -- 扩展信息
      business_scope TEXT,
      source_file TEXT,
      imported_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 创建索引
  db.exec(`CREATE INDEX IF NOT EXISTS idx_tic_company_name ON tic_companies(company_name)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_tic_company_industry ON tic_companies(industry_category)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_tic_company_province ON tic_companies(province)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_tic_company_city ON tic_companies(city)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_tic_company_business_scope ON tic_companies(business_scope)`)

  console.log('[TicCompanyDb] Database initialized successfully')
}

/**
 * 检查 TIC 企业表是否为空
 */
export function isTicCompanyTableEmpty(): boolean {
  const db = getDb()
  try {
    const result = db.prepare('SELECT COUNT(*) as count FROM tic_companies').get() as { count: number }
    return result.count === 0
  } catch (error) {
    console.error('[TicCompanyDb] isTicCompanyTableEmpty error:', error)
    return true
  }
}

/**
 * 获取 TIC 企业总数
 */
export function getTicCompanyCount(): number {
  const db = getDb()
  try {
    const result = db.prepare('SELECT COUNT(*) as count FROM tic_companies').get() as { count: number }
    return result.count
  } catch (error) {
    console.error('[TicCompanyDb] getTicCompanyCount error:', error)
    return 0
  }
}

/**
 * 根据 ID 获取 TIC 企业
 */
export function getTicCompanyById(id: number): TicCompany | null {
  const db = getDb()
  try {
    const row = db.prepare('SELECT * FROM tic_companies WHERE id = ?').get(id) as TicCompany | undefined
    return row || null
  } catch (error) {
    console.error('[TicCompanyDb] getTicCompanyById error:', error)
    return null
  }
}

/**
 * 批量插入 TIC 企业
 */
export function batchInsertTicCompanies(companies: Omit<TicCompany, 'id' | 'imported_at'>[]): number {
  const db = getDb()
  try {
    const stmt = db.prepare(`
      INSERT INTO tic_companies (
        company_name, business_status, legal_representative, registered_capital,
        registered_capital_currency, establishment_date, approval_date,
        province, city, county, township, credit_code, phone, email,
        employee_count, company_type, organization_form,
        industry_category, industry_major, industry_middle, industry_minor,
        website, registered_address, mailing_address, is_listed,
        dishonest_status, 被执行_status, high_consumer_status,
        judicial_freeze_status, bankruptcy_restructuring_status,
        financial_penalty_status, serious_violation_status,
        business_exception_status, tax_violation_status, abnormal_status,
        business_scope, source_file
      ) VALUES (
        @company_name, @business_status, @legal_representative, @registered_capital,
        @registered_capital_currency, @establishment_date, @approval_date,
        @province, @city, @county, @township, @credit_code, @phone, @email,
        @employee_count, @company_type, @organization_form,
        @industry_category, @industry_major, @industry_middle, @industry_minor,
        @website, @registered_address, @mailing_address, @is_listed,
        @dishonest_status, @被执行_status, @high_consumer_status,
        @judicial_freeze_status, @bankruptcy_restructuring_status,
        @financial_penalty_status, @serious_violation_status,
        @business_exception_status, @tax_violation_status, @abnormal_status,
        @business_scope, @source_file
      )
    `)

    const insertMany = db.transaction((items: typeof companies) => {
      let inserted = 0
      for (const item of items) {
        try {
          stmt.run(item)
          inserted++
        } catch (err) {
          // 忽略重复企业名错误
          console.warn(`[TicCompanyDb] Skip duplicate company: ${item.company_name}`)
        }
      }
      return inserted
    })

    return insertMany(companies)
  } catch (error) {
    console.error('[TicCompanyDb] batchInsertTicCompanies error:', error)
    return 0
  }
}

/**
 * 查询 TIC 企业（支持分页和筛选）
 */
export function queryTicCompanies(
  filters: TicCompanyFilters = {},
  page: number = 1,
  pageSize: number = 20
): TicCompanyQueryResult {
  const db = getDb()
  try {
    const conditions: string[] = []
    const params: any[] = []

    // keyword 模糊搜索
    if (filters.keyword) {
      conditions.push('(company_name LIKE ? OR legal_representative LIKE ?)')
      const kw = `%${filters.keyword}%`
      params.push(kw, kw)
    }

    // industry 行业门类精确匹配
    if (filters.industry) {
      conditions.push('industry_category = ?')
      params.push(filters.industry)
    }

    // province 省份精确匹配
    if (filters.province) {
      conditions.push('province = ?')
      params.push(filters.province)
    }

    // city 城市精确匹配
    if (filters.city) {
      conditions.push('city = ?')
      params.push(filters.city)
    }

    // county 区县精确匹配
    if (filters.county) {
      conditions.push('county = ?')
      params.push(filters.county)
    }

    // companyType 企业类型精确匹配
    if (filters.companyType) {
      conditions.push('company_type = ?')
      params.push(filters.companyType)
    }

    // employee_count 人数范围
    if (filters.employeeCountMin !== undefined) {
      conditions.push('employee_count >= ?')
      params.push(filters.employeeCountMin)
    }
    if (filters.employeeCountMax !== undefined) {
      conditions.push('employee_count <= ?')
      params.push(filters.employeeCountMax)
    }

    // registeredCapitalMin 注册资本下限（万元）
    if (filters.registeredCapitalMin !== undefined && filters.registeredCapitalMin > 0) {
      conditions.push("CAST(REPLACE(registered_capital, '万', '') AS INTEGER) >= ?")
      params.push(filters.registeredCapitalMin)
    }

    // hasPhone 联系电话筛选
    if (filters.hasPhone === 'true' || filters.hasPhone === '1') {
      conditions.push("phone IS NOT NULL AND phone != ''")
    } else if (filters.hasPhone === 'false' || filters.hasPhone === '0') {
      conditions.push("(phone IS NULL OR phone = '')")
    }

    // hasWebsite 网址筛选
    if (filters.hasWebsite === 'true' || filters.hasWebsite === '1') {
      conditions.push("website IS NOT NULL AND website != ''")
    } else if (filters.hasWebsite === 'false' || filters.hasWebsite === '0') {
      conditions.push("(website IS NULL OR website = '')")
    }

    // businessScope 经营范围模糊搜索
    if (filters.businessScope) {
      conditions.push('business_scope LIKE ?')
      params.push(`%${filters.businessScope}%`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // 获取总数
    const countSql = `SELECT COUNT(*) as count FROM tic_companies ${whereClause}`
    const countResult = db.prepare(countSql).get(...params) as { count: number }
    const total = countResult.count

    // 计算分页
    const totalPages = Math.ceil(total / pageSize)
    const offset = (page - 1) * pageSize

    // 查询列表
    const listSql = `
      SELECT * FROM tic_companies
      ${whereClause}
      ORDER BY id ASC
      LIMIT ? OFFSET ?
    `
    const listParams = [...params, pageSize, offset]
    const list = db.prepare(listSql).all(...listParams) as TicCompany[]

    return {
      list,
      total,
      page,
      pageSize,
      totalPages
    }
  } catch (error) {
    console.error('[TicCompanyDb] queryTicCompanies error:', error)
    return {
      list: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0
    }
  }
}

/**
 * 清空 TIC 企业表（用于重新导入）
 */
export function truncateTicCompanies(): boolean {
  const db = getDb()
  try {
    db.exec('DELETE FROM tic_companies')
    console.log('[TicCompanyDb] Table tic_companies truncated')
    return true
  } catch (error) {
    console.error('[TicCompanyDb] truncateTicCompanies error:', error)
    return false
  }
}

/**
 * 测试数据库连接
 */
export function testConnection(): boolean {
  try {
    const db = getDb()
    const result = db.prepare('SELECT 1 as test').get()
    console.log('[TicCompanyDb] Database connection OK:', result)
    return true
  } catch (error) {
    console.error('[TicCompanyDb] Database connection failed:', error)
    return false
  }
}

// 初始化数据库
initTicCompanyDb()