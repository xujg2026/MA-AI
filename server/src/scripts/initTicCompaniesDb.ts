/**
 * 初始化 TIC 企业数据库
 * 从 Excel 文件导入 55,574 条 TIC 企业数据
 */

import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'
// 使用 CommonJS require 兼容 xlsx 模块
import XLSX from 'xlsx'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 导入数据库工具
import { initTicCompanyDb, batchInsertTicCompanies, isTicCompanyTableEmpty, getTicCompanyCount, truncateTicCompanies } from '../utils/ticCompanyDb.js'

// Excel 文件路径 - 使用相对路径（兼容 Windows 和 Linux）
const EXCEL_FILE = path.join(__dirname, '../../Source/TIC company info.xlsx')

// 字段映射
const FIELD_MAP: Record<string, string> = {
  '企业名称': 'company_name',
  '经营状态': 'business_status',
  '法定代表人': 'legal_representative',
  '注册资本': 'registered_capital',
  '注册资本币种': 'registered_capital_currency',
  '成立日期': 'establishment_date',
  '核准日期': 'approval_date',
  '所属省': 'province',
  '所属市': 'city',
  '所属区/县': 'county',
  '所属乡镇/街道': 'township',
  '统一社会信用代码': 'credit_code',
  '联系电话': 'phone',
  '邮箱': 'email',
  '参保人数(人)': 'employee_count',
  '企业类型': 'company_type',
  '组织形式': 'organization_form',
  '国标行业门类': 'industry_category',
  '国标行业大类': 'industry_major',
  '国标行业中类': 'industry_middle',
  '国标行业小类': 'industry_minor',
  '网址': 'website',
  '注册地址': 'registered_address',
  '通信地址': 'mailing_address',
  '是否上市': 'is_listed',
  '失信被执行人': 'dishonest_status',
  '被执行人': '被执行_status',
  '限制高消费': 'high_consumer_status',
  '司法冻结': 'judicial_freeze_status',
  '破产重整': 'bankruptcy_restructuring_status',
  '金融监管处罚': 'financial_penalty_status',
  '严重违法': 'serious_violation_status',
  '经营异常': 'business_exception_status',
  '重大税收违法': 'tax_violation_status',
  '非正常户': 'abnormal_status',
  '经营范围': 'business_scope',
}

// 批量插入大小
const BATCH_SIZE = 1000

interface RawRow {
  [key: string]: string | number | null | undefined
}

async function importTicCompaniesFromExcel(force: boolean = false): Promise<void> {
  console.log('[InitTicCompaniesDb] 开始导入 TIC 企业数据...')
  console.log(`[InitTicCompaniesDb] Excel 文件: ${EXCEL_FILE}`)

  // 检查文件是否存在
  if (!fs.existsSync(EXCEL_FILE)) {
    console.error(`[InitTicCompaniesDb] 错误: Excel 文件不存在 - ${EXCEL_FILE}`)
    return
  }

  // 初始化数据库
  initTicCompanyDb()

  // 检查是否已有数据
  const currentCount = getTicCompanyCount()
  console.log(`[InitTicCompaniesDb] 当前数据库中有 ${currentCount} 条记录`)

  if (currentCount > 0 && !force) {
    console.log('[InitTicCompaniesDb] 数据库中已有数据，使用 --force 参数强制重新导入')
    return
  }

  // 如果强制导入，先清空表
  if (force && currentCount > 0) {
    truncateTicCompanies()
    console.log('[InitTicCompaniesDb] 已清空现有数据')
  }

  // 读取 Excel 文件
  console.log('[InitTicCompaniesDb] 正在读取 Excel 文件...')
  const workbook = XLSX.readFile(EXCEL_FILE)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const rawData = XLSX.utils.sheet_to_json<RawRow>(worksheet, { defval: null })

  console.log(`[InitTicCompaniesDb] 共读取 ${rawData.length} 行数据`)

  // 转换数据
  console.log('[InitTicCompaniesDb] 正在转换数据...')
  const companies: any[] = []
  let skipped = 0

  for (const row of rawData) {
    try {
      const company: any = {}

      // 映射字段
      for (const [excelField, dbField] of Object.entries(FIELD_MAP)) {
        const value = row[excelField]
        if (value !== undefined && value !== null && value !== '') {
          company[dbField] = typeof value === 'string' ? value.trim() : value
        } else {
          company[dbField] = null
        }
      }

      // 验证必填字段
      if (!company.company_name) {
        skipped++
        continue
      }

      // 设置默认值
      company.source_file = EXCEL_FILE

      companies.push(company)
    } catch (err) {
      console.warn('[InitTicCompaniesDb] 跳过无效行:', err)
      skipped++
    }
  }

  console.log(`[InitTicCompaniesDb] 有效数据: ${companies.length} 条, 跳过: ${skipped} 条`)

  // 批量插入
  console.log(`[InitTicCompaniesDb] 开始批量插入 (每批 ${BATCH_SIZE} 条)...`)
  let inserted = 0
  let failed = 0

  for (let i = 0; i < companies.length; i += BATCH_SIZE) {
    const batch = companies.slice(i, i + BATCH_SIZE)
    const result = batchInsertTicCompanies(batch)
    inserted += result
    failed += (batch.length - result)

    const progress = Math.min(i + BATCH_SIZE, companies.length)
    console.log(`[InitTicCompaniesDb] 进度: ${progress}/${companies.length} (${inserted} 插入, ${failed} 失败)`)
  }

  // 验证结果
  const finalCount = getTicCompanyCount()
  console.log('[InitTicCompaniesDb] 导入完成!')
  console.log(`[InitTicCompaniesDb] 最终数据库记录: ${finalCount} 条`)
}

// 主函数
async function main() {
  const force = process.argv.includes('--force')

  try {
    await importTicCompaniesFromExcel(force)

    // 检查是否需要自动导入（启动时）
    if (isTicCompanyTableEmpty()) {
      console.log('[InitTicCompaniesDb] 检测到表为空，正在自动导入...')
      await importTicCompaniesFromExcel(false)
    }
  } catch (error) {
    console.error('[InitTicCompaniesDb] 导入失败:', error)
    process.exit(1)
  }
}

// 执行
main().catch(console.error)