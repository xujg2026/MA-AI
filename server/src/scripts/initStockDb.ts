/**
 * 初始化A股股票数据库
 * 从 Source/全部A股.csv 导入数据到 SQLite
 */

import Database from 'better-sqlite3'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_PATH = path.join(__dirname, '../../data/a_stocks.db')
const CSV_PATH = path.join(__dirname, '../../../Source/全部A股.csv')

async function initStockDb() {
  console.log('[InitStockDb] 开始初始化A股数据库...')

  // 确保数据目录存在
  const dataDir = path.dirname(DB_PATH)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  // 删除旧数据库（如有）
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH)
    console.log('[InitStockDb] 已删除旧数据库')
  }

  // 创建新数据库
  const db = new Database(DB_PATH)

  // 创建表
  db.exec(`
    CREATE TABLE IF NOT EXISTS a_stocks (
      row_id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      business_scope TEXT,
      company_intro TEXT,
      main_business TEXT,
      main_products TEXT,
      region TEXT,
      is_st INTEGER DEFAULT 0,
      is_star_st INTEGER DEFAULT 0,
      last_updated TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_a_stocks_code ON a_stocks(code);
    CREATE INDEX IF NOT EXISTS idx_a_stocks_name ON a_stocks(name);
    CREATE INDEX IF NOT EXISTS idx_a_stocks_main_business ON a_stocks(main_business);

    -- 全文搜索索引（用于关键词匹配）
    CREATE VIRTUAL TABLE IF NOT EXISTS a_stocks_fts USING fts5(
      main_business,
      main_products,
      business_scope,
      content='a_stocks',
      content_rowid='row_id'
    );
  `)

  console.log('[InitStockDb] 数据库表创建完成')

  // 读取CSV文件
  console.log('[InitStockDb] 读取CSV文件:', CSV_PATH)

  // 使用Node.js原生方式读取CSV
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
  const lines = csvContent.split('\n')

  // 解析CSV表头
  const headers = lines[0].split(',').map(h => h.trim())
  console.log('[InitStockDb] CSV表头:', headers)

  // 找到各列的索引
  const colIndex: Record<string, number> = {}
  headers.forEach((header, index) => {
    colIndex[header] = index
  })

  console.log('[InitStockDb] 列索引映射:', colIndex)

  // 预处理CSV行（处理引号内的逗号）
  function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())

    return result
  }

  // 准备插入语句
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO a_stocks (
      code, name, business_scope, company_intro, main_business,
      main_products, region, is_st, is_star_st
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  // 批量插入
  const insertMany = db.transaction((rows: any[]) => {
    for (const row of rows) {
      insertStmt.run(
        row.code,
        row.name,
        row.business_scope,
        row.company_intro,
        row.main_business,
        row.main_products,
        row.region,
        row.is_st,
        row.is_star_st
      )
    }
  })

  // 解析并插入数据
  let insertedCount = 0
  const batchSize = 100
  let batch: any[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    try {
      const fields = parseCSVLine(line)

      const code = fields[colIndex['证券代码']] || ''
      const name = fields[colIndex['证券名称']] || ''
      const businessScope = fields[colIndex['经营范围']] || ''
      const companyIntro = fields[colIndex['公司简介']] || ''
      const mainBusiness = fields[colIndex['主营业务']] || ''
      const mainProducts = fields[colIndex['主营产品名称']] || ''
      const region = fields[colIndex['所属行政区划']] || ''

      // 处理ST标识
      const isStRaw = fields[colIndex['是否为ST股票']] || '否'
      const isStarStRaw = fields[colIndex['是否为*ST股票']] || '否'
      const isSt = isStRaw === '是' ? 1 : 0
      const isStarSt = isStarStRaw === '是' ? 1 : 0

      if (code) {
        batch.push({
          code,
          name,
          business_scope: businessScope,
          company_intro: companyIntro,
          main_business: mainBusiness,
          main_products: mainProducts,
          region,
          is_st: isSt,
          is_star_st: isStarSt
        })

        if (batch.length >= batchSize) {
          insertMany(batch)
          insertedCount += batch.length
          console.log(`[InitStockDb] 已插入 ${insertedCount} 条记录...`)
          batch = []
        }
      }
    } catch (error) {
      console.error(`[InitStockDb] 解析行 ${i} 失败:`, error)
    }
  }

  // 插入剩余数据
  if (batch.length > 0) {
    insertMany(batch)
    insertedCount += batch.length
  }

  console.log(`[InitStockDb] 总共插入 ${insertedCount} 条记录`)

  // 更新全文搜索索引（使用content_rowid）
  console.log('[InitStockDb] 更新全文搜索索引...')
  try {
    db.exec(`
      INSERT INTO a_stocks_fts(rowid, main_business, main_products, business_scope)
      SELECT row_id, main_business, main_products, business_scope FROM a_stocks;
    `)
    console.log('[InitStockDb] 全文搜索索引创建完成')
  } catch (error) {
    console.warn('[InitStockDb] 全文搜索索引创建失败，将使用LIKE查询替代:', error)
  }

  // 验证数据
  const countResult = db.prepare('SELECT COUNT(*) as count FROM a_stocks').get() as { count: number }
  console.log(`[InitStockDb] 数据库验证: ${countResult.count} 条股票`)

  const stCount = db.prepare('SELECT COUNT(*) as count FROM a_stocks WHERE is_st = 1 OR is_star_st = 1').get() as { count: number }
  console.log(`[InitStockDb] ST股票: ${stCount.count} 条`)

  db.close()

  console.log('[InitStockDb] A股数据库初始化完成!')
  console.log(`[InitStockDb] 数据库路径: ${DB_PATH}`)
}

// 执行
initStockDb().catch(console.error)
