/**
 * M&A项目数据库工具
 * 用于管理项目数据的数据库访问层
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

// 项目接口
export interface Project {
  id: string
  name: string
  status: string
  industry: string | null
  region: string | null
  estimated_value: string | null
  source: string
  company_name: string | null
  company_type: string | null
  registration_capital: string | null
  establishment_date: string | null
  employee_count: string | null
  sell_motivation: string | null
  risk_level: string | null
  change_records: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  is_deleted: number
}

// 项目阶段接口
export interface ProjectPhase {
  id: string
  project_id: string
  phase: string
  status: string
  started_at: string | null
  completed_at: string | null
  output_data: string | null
}

// 项目筛选器
export interface ProjectFilters {
  status?: string
  industry?: string
  region?: string
  keyword?: string
}

// 买家筛选缓存接口
export interface BuyerScreeningCache {
  id: string
  target_name: string
  target_industry: string | null
  target_region: string | null
  estimated_value: string | null
  results: string  // JSON stringified results
  candidate_count: number
  created_at: string
  expires_at: string | null  // 过期时间，null表示永不过期
}

// 创建项目参数
export interface CreateProjectParams {
  id: string
  name: string
  status?: string
  industry?: string
  region?: string
  estimated_value?: string
  source?: string
  company_name?: string
  company_type?: string
  registration_capital?: string
  establishment_date?: string
  employee_count?: string
  sell_motivation?: string
  risk_level?: string
  change_records?: string
  created_by?: string
}

// 更新项目参数
export interface UpdateProjectParams {
  name?: string
  status?: string
  industry?: string
  region?: string
  estimated_value?: string
  source?: string
  company_name?: string
  company_type?: string
  registration_capital?: string
  establishment_date?: string
  employee_count?: string
  sell_motivation?: string
  risk_level?: string
  change_records?: string
}

// 创建阶段参数
export interface CreatePhaseParams {
  id: string
  project_id: string
  phase: string
  status?: string
  started_at?: string
  completed_at?: string
  output_data?: string
}

// 更新阶段参数
export interface UpdatePhaseParams {
  phase?: string
  status?: string
  started_at?: string
  completed_at?: string
  output_data?: string
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
 * 初始化项目数据库
 * 创建表结构
 */
export function initProjectDb(): void {
  const db = getDb()

  // 创建projects表
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      industry TEXT,
      region TEXT,
      estimated_value TEXT,
      source TEXT DEFAULT 'manual',
      company_name TEXT,
      company_type TEXT,
      registration_capital TEXT,
      establishment_date TEXT,
      employee_count TEXT,
      sell_motivation TEXT,
      risk_level TEXT,
      change_records TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      is_deleted INTEGER DEFAULT 0
    )
  `)

  // 创建project_phases表
  db.exec(`
    CREATE TABLE IF NOT EXISTS project_phases (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      phase TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      started_at TEXT,
      completed_at TEXT,
      output_data TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `)

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)
  `)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_projects_industry ON projects(industry)
  `)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_projects_region ON projects(region)
  `)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_projects_is_deleted ON projects(is_deleted)
  `)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_project_phases_project_id ON project_phases(project_id)
  `)

  // 创建买家筛选缓存表
  db.exec(`
    CREATE TABLE IF NOT EXISTS buyer_screening_cache (
      id TEXT PRIMARY KEY,
      target_name TEXT NOT NULL,
      target_industry TEXT,
      target_region TEXT,
      estimated_value TEXT,
      results TEXT NOT NULL,
      candidate_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT
    )
  `)

  // 创建缓存查询索引（按目标公司名+行业）
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_buyer_cache_target ON buyer_screening_cache(target_name, target_industry)
  `)

  console.log('[ProjectDb] Database initialized successfully')
}

/**
 * 创建项目
 * @param project 项目数据
 * @returns 创建的项目
 */
export function createProject(project: CreateProjectParams): Project | null {
  const db = getDb()

  try {
    const stmt = db.prepare(`
      INSERT INTO projects (
        id, name, status, industry, region, estimated_value, source,
        company_name, company_type, registration_capital, establishment_date,
        employee_count, sell_motivation, risk_level, change_records, created_by
      ) VALUES (
        @id, @name, @status, @industry, @region, @estimated_value, @source,
        @company_name, @company_type, @registration_capital, @establishment_date,
        @employee_count, @sell_motivation, @risk_level, @change_records, @created_by
      )
    `)

    stmt.run({
      id: project.id,
      name: project.name,
      status: project.status || 'draft',
      industry: project.industry || null,
      region: project.region || null,
      estimated_value: project.estimated_value || null,
      source: project.source || 'manual',
      company_name: project.company_name || null,
      company_type: project.company_type || null,
      registration_capital: project.registration_capital || null,
      establishment_date: project.establishment_date || null,
      employee_count: project.employee_count || null,
      sell_motivation: project.sell_motivation || null,
      risk_level: project.risk_level || null,
      change_records: project.change_records || null,
      created_by: project.created_by || null
    })

    return getProject(project.id)
  } catch (error) {
    console.error('[ProjectDb] createProject error:', error)
    return null
  }
}

/**
 * 获取单个项目
 * @param id 项目ID
 * @returns 项目数据或null
 */
export function getProject(id: string): Project | null {
  const db = getDb()

  try {
    const row = db.prepare(
      'SELECT * FROM projects WHERE id = ? AND is_deleted = 0'
    ).get(id) as Project | undefined
    return row || null
  } catch (error) {
    console.error('[ProjectDb] getProject error:', error)
    return null
  }
}

/**
 * 列表查询项目
 * @param filters 筛选条件
 * @param limit 返回数量限制
 * @param offset 偏移量
 * @returns 项目列表
 */
export function listProjects(
  filters: ProjectFilters = {},
  limit: number = 100,
  offset: number = 0
): Project[] {
  const db = getDb()

  try {
    const conditions: string[] = ['is_deleted = 0']
    const params: any[] = []

    if (filters.status) {
      conditions.push('status = ?')
      params.push(filters.status)
    }

    if (filters.industry) {
      conditions.push('industry = ?')
      params.push(filters.industry)
    }

    if (filters.region) {
      conditions.push('region = ?')
      params.push(filters.region)
    }

    if (filters.keyword) {
      conditions.push('(name LIKE ? OR company_name LIKE ? OR industry LIKE ?)')
      const kw = `%${filters.keyword}%`
      params.push(kw, kw, kw)
    }

    const whereClause = conditions.join(' AND ')
    const sql = `
      SELECT * FROM projects
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `
    params.push(limit, offset)

    return db.prepare(sql).all(...params) as Project[]
  } catch (error) {
    console.error('[ProjectDb] listProjects error:', error)
    return []
  }
}

/**
 * 更新项目
 * @param id 项目ID
 * @param data 更新数据
 * @returns 更新后的项目或null
 */
export function updateProject(id: string, data: UpdateProjectParams): Project | null {
  const db = getDb()

  try {
    const fields: string[] = ['updated_at = CURRENT_TIMESTAMP']
    const params: any[] = []

    if (data.name !== undefined) {
      fields.push('name = ?')
      params.push(data.name)
    }
    if (data.status !== undefined) {
      fields.push('status = ?')
      params.push(data.status)
    }
    if (data.industry !== undefined) {
      fields.push('industry = ?')
      params.push(data.industry)
    }
    if (data.region !== undefined) {
      fields.push('region = ?')
      params.push(data.region)
    }
    if (data.estimated_value !== undefined) {
      fields.push('estimated_value = ?')
      params.push(data.estimated_value)
    }
    if (data.source !== undefined) {
      fields.push('source = ?')
      params.push(data.source)
    }
    if (data.company_name !== undefined) {
      fields.push('company_name = ?')
      params.push(data.company_name)
    }
    if (data.company_type !== undefined) {
      fields.push('company_type = ?')
      params.push(data.company_type)
    }
    if (data.registration_capital !== undefined) {
      fields.push('registration_capital = ?')
      params.push(data.registration_capital)
    }
    if (data.establishment_date !== undefined) {
      fields.push('establishment_date = ?')
      params.push(data.establishment_date)
    }
    if (data.employee_count !== undefined) {
      fields.push('employee_count = ?')
      params.push(data.employee_count)
    }
    if (data.sell_motivation !== undefined) {
      fields.push('sell_motivation = ?')
      params.push(data.sell_motivation)
    }
    if (data.risk_level !== undefined) {
      fields.push('risk_level = ?')
      params.push(data.risk_level)
    }
    if (data.change_records !== undefined) {
      fields.push('change_records = ?')
      params.push(data.change_records)
    }

    if (fields.length === 1) {
      // 只有updated_at，没有其他更新
      return getProject(id)
    }

    params.push(id)
    const sql = `UPDATE projects SET ${fields.join(', ')} WHERE id = ? AND is_deleted = 0`
    db.prepare(sql).run(...params)

    return getProject(id)
  } catch (error) {
    console.error('[ProjectDb] updateProject error:', error)
    return null
  }
}

/**
 * 删除项目（软删除）
 * @param id 项目ID
 * @returns 是否成功
 */
export function deleteProject(id: string): boolean {
  const db = getDb()

  try {
    const result = db.prepare(
      'UPDATE projects SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_deleted = 0'
    ).run(id)
    return result.changes > 0
  } catch (error) {
    console.error('[ProjectDb] deleteProject error:', error)
    return false
  }
}

/**
 * 创建或更新项目阶段
 * @param phase 阶段数据
 * @returns 创建/更新的阶段
 */
export function createPhase(phase: CreatePhaseParams): ProjectPhase | null {
  const db = getDb()

  try {
    // 检查是否已存在该阶段
    const existing = db.prepare(
      'SELECT * FROM project_phases WHERE project_id = ? AND phase = ?'
    ).get(phase.project_id, phase.phase) as ProjectPhase | undefined

    if (existing) {
      // 更新现有阶段
      return updatePhase(existing.id, {
        status: phase.status,
        started_at: phase.started_at,
        completed_at: phase.completed_at,
        output_data: typeof phase.output_data === 'string' ? phase.output_data : JSON.stringify(phase.output_data)
      })
    }

    // 插入新阶段
    const stmt = db.prepare(`
      INSERT INTO project_phases (id, project_id, phase, status, started_at, completed_at, output_data)
      VALUES (@id, @project_id, @phase, @status, @started_at, @completed_at, @output_data)
    `)

    stmt.run({
      id: phase.id,
      project_id: phase.project_id,
      phase: phase.phase,
      status: phase.status || 'pending',
      started_at: phase.started_at || null,
      completed_at: phase.completed_at || null,
      output_data: phase.output_data || null
    })

    return getPhaseById(phase.id)
  } catch (error) {
    console.error('[ProjectDb] createPhase error:', error)
    return null
  }
}

/**
 * 根据ID获取阶段
 * @param id 阶段ID
 * @returns 阶段数据或null
 */
export function getPhaseById(id: string): ProjectPhase | null {
  const db = getDb()

  try {
    const row = db.prepare('SELECT * FROM project_phases WHERE id = ?').get(id) as ProjectPhase | undefined
    return row || null
  } catch (error) {
    console.error('[ProjectDb] getPhaseById error:', error)
    return null
  }
}

/**
 * 获取项目的所有阶段
 * @param projectId 项目ID
 * @returns 阶段列表
 */
export function getPhases(projectId: string): ProjectPhase[] {
  const db = getDb()

  try {
    return db.prepare(
      'SELECT * FROM project_phases WHERE project_id = ? ORDER BY started_at ASC'
    ).all(projectId) as ProjectPhase[]
  } catch (error) {
    console.error('[ProjectDb] getPhases error:', error)
    return []
  }
}

/**
 * 更新阶段
 * @param id 阶段ID
 * @param data 更新数据
 * @returns 更新后的阶段或null
 */
export function updatePhase(id: string, data: UpdatePhaseParams): ProjectPhase | null {
  const db = getDb()

  try {
    const fields: string[] = []
    const params: any[] = []

    if (data.phase !== undefined) {
      fields.push('phase = ?')
      params.push(data.phase)
    }
    if (data.status !== undefined) {
      fields.push('status = ?')
      params.push(data.status)
    }
    if (data.started_at !== undefined) {
      fields.push('started_at = ?')
      params.push(data.started_at)
    }
    if (data.completed_at !== undefined) {
      fields.push('completed_at = ?')
      params.push(data.completed_at)
    }
    if (data.output_data !== undefined) {
      fields.push('output_data = ?')
      params.push(typeof data.output_data === 'string' ? data.output_data : JSON.stringify(data.output_data))
    }

    if (fields.length === 0) {
      return getPhaseById(id)
    }

    params.push(id)
    const sql = `UPDATE project_phases SET ${fields.join(', ')} WHERE id = ?`
    db.prepare(sql).run(...params)

    return getPhaseById(id)
  } catch (error) {
    console.error('[ProjectDb] updatePhase error:', error)
    return null
  }
}

/**
 * 删除项目阶段
 * @param id 阶段ID
 * @returns 是否成功
 */
export function deletePhase(id: string): boolean {
  const db = getDb()

  try {
    const result = db.prepare('DELETE FROM project_phases WHERE id = ?').run(id)
    return result.changes > 0
  } catch (error) {
    console.error('[ProjectDb] deletePhase error:', error)
    return false
  }
}

/**
 * 获取项目总数
 */
export function getProjectCount(): number {
  const db = getDb()

  try {
    const result = db.prepare(
      'SELECT COUNT(*) as count FROM projects WHERE is_deleted = 0'
    ).get() as { count: number }
    return result.count
  } catch (error) {
    console.error('[ProjectDb] getProjectCount error:', error)
    return 0
  }
}

/**
 * 测试数据库连接
 */
export function testConnection(): boolean {
  try {
    const db = getDb()
    const result = db.prepare('SELECT 1 as test').get()
    console.log('[ProjectDb] Database connection OK:', result)
    return true
  } catch (error) {
    console.error('[ProjectDb] Database connection failed:', error)
    return false
  }
}

// ========== 买家筛选缓存 ==========

/**
 * 生成缓存唯一ID
 */
function generateCacheId(targetName: string, industry: string | null): string {
  const key = `${targetName}|${industry || ''}`
  // 简单的hash
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `bsc_${Math.abs(hash).toString(16)}_${Date.now()}`
}

/**
 * 保存买家筛选缓存
 * @param targetName 目标公司名称
 * @param industry 目标行业
 * @param region 目标地区
 * @param estimatedValue 预估价值
 * @param results 筛选结果
 * @param candidateCount 候选数量
 * @param ttlHours 缓存有效期（小时），默认24小时，null表示永不过期
 * @returns 缓存记录
 */
export function saveBuyerScreeningCache(
  targetName: string,
  industry: string | null,
  region: string | null,
  estimatedValue: string | null,
  results: any,
  candidateCount: number,
  ttlHours: number | null = 24
): BuyerScreeningCache | null {
  const db = getDb()

  try {
    const id = generateCacheId(targetName, industry)
    const now = new Date()
    const expiresAt = ttlHours !== null
      ? new Date(now.getTime() + ttlHours * 60 * 60 * 1000).toISOString()
      : null

    const stmt = db.prepare(`
      INSERT INTO buyer_screening_cache (
        id, target_name, target_industry, target_region, estimated_value,
        results, candidate_count, created_at, expires_at
      ) VALUES (
        @id, @target_name, @target_industry, @target_region, @estimated_value,
        @results, @candidate_count, @created_at, @expires_at
      )
    `)

    stmt.run({
      id,
      target_name: targetName,
      target_industry: industry || null,
      target_region: region || null,
      estimated_value: estimatedValue || null,
      results: JSON.stringify(results),
      candidate_count: candidateCount,
      created_at: now.toISOString(),
      expires_at: expiresAt,
    })

    console.log(`[ProjectDb] Buyer screening cache saved: ${id}, target=${targetName}, candidates=${candidateCount}`)
    return getBuyerScreeningCacheById(id)
  } catch (error) {
    console.error('[ProjectDb] saveBuyerScreeningCache error:', error)
    return null
  }
}

/**
 * 获取买家筛选缓存（按目标公司名和行业）
 * @param targetName 目标公司名称
 * @param industry 目标行业
 * @param forceRefresh 是否强制刷新（忽略缓存）
 * @returns 缓存结果或null
 */
export function getBuyerScreeningCache(
  targetName: string,
  industry: string | null,
  forceRefresh: boolean = false
): BuyerScreeningCache | null {
  if (forceRefresh) {
    return null
  }

  const db = getDb()

  try {
    const now = new Date().toISOString()

    // 查询缓存，忽略过期的
    const row = db.prepare(`
      SELECT * FROM buyer_screening_cache
      WHERE target_name = ? AND target_industry IS ? AND (expires_at IS NULL OR expires_at > ?)
      ORDER BY created_at DESC
      LIMIT 1
    `).get(targetName, industry || null, now) as BuyerScreeningCache | undefined

    if (row) {
      console.log(`[ProjectDb] Buyer screening cache hit: ${row.id}, target=${targetName}, candidates=${row.candidate_count}`)
      return row
    }

    console.log(`[ProjectDb] Buyer screening cache miss: target=${targetName}, industry=${industry}`)
    return null
  } catch (error) {
    console.error('[ProjectDb] getBuyerScreeningCache error:', error)
    return null
  }
}

/**
 * 根据ID获取缓存
 */
export function getBuyerScreeningCacheById(id: string): BuyerScreeningCache | null {
  const db = getDb()

  try {
    const row = db.prepare('SELECT * FROM buyer_screening_cache WHERE id = ?').get(id) as BuyerScreeningCache | undefined
    return row || null
  } catch (error) {
    console.error('[ProjectDb] getBuyerScreeningCacheById error:', error)
    return null
  }
}

/**
 * 清除买家筛选缓存
 * @param targetName 目标公司名称
 * @param industry 目标行业
 */
export function invalidateBuyerScreeningCache(
  targetName: string,
  industry: string | null
): boolean {
  const db = getDb()

  try {
    const result = db.prepare(`
      DELETE FROM buyer_screening_cache
      WHERE target_name = ? AND target_industry IS ?
    `).run(targetName, industry || null)

    console.log(`[ProjectDb] Buyer screening cache invalidated: target=${targetName}, industry=${industry}, deleted=${result.changes}`)
    return result.changes > 0
  } catch (error) {
    console.error('[ProjectDb] invalidateBuyerScreeningCache error:', error)
    return false
  }
}

/**
 * 清除所有买家筛选缓存
 */
export function clearAllBuyerScreeningCache(): number {
  const db = getDb()

  try {
    const result = db.prepare('DELETE FROM buyer_screening_cache').run()
    console.log(`[ProjectDb] All buyer screening cache cleared: deleted=${result.changes}`)
    return result.changes
  } catch (error) {
    console.error('[ProjectDb] clearAllBuyerScreeningCache error:', error)
    return 0
  }
}

/**
 * 获取缓存统计
 */
export function getBuyerScreeningCacheStats(): { total: number; expired: number } {
  const db = getDb()

  try {
    const now = new Date().toISOString()
    const total = db.prepare('SELECT COUNT(*) as count FROM buyer_screening_cache').get() as { count: number }
    const expired = db.prepare('SELECT COUNT(*) as count FROM buyer_screening_cache WHERE expires_at IS NOT NULL AND expires_at <= ?').get(now) as { count: number }

    return {
      total: total.count,
      expired: expired.count,
    }
  } catch (error) {
    console.error('[ProjectDb] getBuyerScreeningCacheStats error:', error)
    return { total: 0, expired: 0 }
  }
}

// 初始化数据库
initProjectDb()
