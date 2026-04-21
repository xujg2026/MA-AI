/**
 * 初始化目标公司缓存数据库
 * 用于存储企查查API获取的企业信息
 */

import Database from 'better-sqlite3'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_PATH = path.join(__dirname, '../../data/target_companies.db')

async function initTargetCompaniesDb() {
  console.log('[InitTargetCompaniesDb] 开始初始化目标公司缓存数据库...')

  // 确保数据目录存在
  const dataDir = path.dirname(DB_PATH)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  // 删除旧数据库（如有）
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH)
    console.log('[InitTargetCompaniesDb] 已删除旧数据库')
  }

  // 创建新数据库
  const db = new Database(DB_PATH)

  // 创建目标公司表
  db.exec(`
    CREATE TABLE IF NOT EXISTS target_companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT UNIQUE NOT NULL,

      -- 基本信息
      registered_capital TEXT,
      legal_representative TEXT,
      business_scope TEXT,
      main_business TEXT,
      industry TEXT,
      region TEXT,
      establishment_date TEXT,

      -- 扩展信息（JSON格式存储）
      shareholder_info TEXT,
      key_personnel TEXT,
      actual_controller TEXT,

      -- 风险信息（JSON格式存储）
      dishonest_info TEXT,
      business_exception TEXT,
      administrative_penalty TEXT,

      -- 知识产权（JSON格式存储）
      patent_info TEXT,
      trademark_info TEXT,
      bidding_info TEXT,
      qualifications TEXT,

      -- 其他
      credit_evaluation TEXT,

      -- 原始数据（完整JSON）
      raw_data TEXT,

      -- 元数据
      qcc_fetch_time TEXT,
      last_updated TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_target_companies_name ON target_companies(company_name);
    CREATE INDEX IF NOT EXISTS idx_target_companies_fetch_time ON target_companies(qcc_fetch_time);
  `)

  console.log('[InitTargetCompaniesDb] 目标公司表创建完成')

  // 创建筛选日志表
  db.exec(`
    CREATE TABLE IF NOT EXISTS screening_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      target_company TEXT NOT NULL,
      step TEXT NOT NULL,
      status TEXT NOT NULL,
      duration INTEGER,
      error TEXT,
      details TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_screening_logs_company ON screening_logs(target_company);
    CREATE INDEX IF NOT EXISTS idx_screening_logs_timestamp ON screening_logs(timestamp);
  `)

  console.log('[InitTargetCompaniesDb] 筛选日志表创建完成')

  // 验证
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
  console.log('[InitTargetCompaniesDb] 数据库表:', tables.map((t: any) => t.name).join(', '))

  db.close()

  console.log('[InitTargetCompaniesDb] 目标公司缓存数据库初始化完成!')
  console.log(`[InitTargetCompaniesDb] 数据库路径: ${DB_PATH}`)
}

// 执行
initTargetCompaniesDb().catch(console.error)
