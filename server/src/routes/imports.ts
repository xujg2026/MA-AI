/**
 * Excel 导入路由
 *
 * 处理 Excel 文件导入和模板下载
 */

import { Router } from 'express'
import * as XLSX from 'xlsx'
import { createProject, listProjects } from '../utils/projectDb.js'

export const importsRouter = Router()

// 生成UUID的简单函数
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

// Excel列名映射配置
const columnMappings: Record<string, string[]> = {
  company: ['公司名称', '公司名', '名称', 'company'],
  title: ['项目标题', '标题', 'title'],
  amount: ['交易金额', '金额', 'amount'],
  valuation: ['估值', '估值（亿元）', 'valuation'],
  industry: ['行业', '行业分类', 'industry'],
  sector: ['细分领域', 'sector'],
  region: ['地域', '地区', 'region'],
  stage: ['交易阶段', '阶段', 'stage'],
  description: ['项目描述', '描述', 'description'],
  highlights: ['亮点', 'highlights'],
  type: ['类型', 'type', '卖方/买方'],
}

// 标准行业选项
const standardIndustries = [
  '科技', '医疗健康', '金融服务', '制造业', '零售消费',
  '能源环保', '教育培训', '媒体娱乐', '物流运输', '房地产', '其他',
]

// 标准地域选项
const standardRegions = [
  '华北地区', '华东地区', '华南地区', '华中地区', '西南地区',
  '西北地区', '东北地区', '港澳台', '海外', '全国',
]

// 标准化数据类型
function normalizeRecord(record: Record<string, any>): Record<string, any> {
  // 查找匹配的列名
  const findValue = (fieldName: string): any => {
    const mappings = columnMappings[fieldName]
    if (!mappings) return null
    for (const key of Object.keys(record)) {
      const normalizedKey = String(key).trim().toLowerCase()
      for (const mapping of mappings) {
        if (normalizedKey === mapping.toLowerCase()) {
          return record[key]
        }
      }
    }
    return null
  }

  const industry = findValue('industry') || '其他'
  const region = findValue('region') || '全国'

  return {
    id: `excel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    company: findValue('company') || '未知公司',
    title: findValue('title') || findValue('company') || '未命名项目',
    amount: findValue('amount') || '待定',
    valuation: parseFloat(findValue('valuation')) || 0,
    industry: standardIndustries.includes(industry) ? industry : '其他',
    sector: findValue('sector') || '',
    region: standardRegions.includes(region) ? region : '全国',
    stage: findValue('stage') || '意向',
    description: findValue('description') || '',
    highlights: (findValue('highlights') || '').toString().split(/[,，、]/).filter(Boolean),
    type: (findValue('type') || '').toString().toLowerCase().includes('买') ? 'buy' : 'sell',
    date: new Date().toISOString().split('T')[0],
    status: '进行中',
    matchScore: 0,
    isImported: true,
  }
}

/**
 * POST /api/imports/excel
 * 接收 Excel 文件，解析数据，批量创建项目记录
 */
importsRouter.post('/excel', async (req, res) => {
  try {
    // 检查是否有文件上传
    if (!req.body || !req.body.fileData) {
      res.status(400).json({
        success: false,
        error: 'No file data provided'
      })
      return
    }

    const { fileData, filename } = req.body

    // 解析 base64 或直接处理数据
    let jsonData: any[] = []

    if (typeof fileData === 'string') {
      // 尝试解析为 base64 的 Excel 数据
      try {
        const binaryString = atob(fileData)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const workbook = XLSX.read(bytes, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      } catch (parseError) {
        // 尝试直接解析为 JSON 数组
        try {
          jsonData = JSON.parse(fileData)
        } catch {
          res.status(400).json({
            success: false,
            error: 'Invalid file data format'
          })
          return
        }
      }
    } else if (Array.isArray(fileData)) {
      jsonData = fileData
    }

    if (jsonData.length < 2) {
      res.status(400).json({
        success: false,
        error: 'Excel file must contain header row and data rows'
      })
      return
    }

    const fileHeaders = jsonData[0].map((h) => String(h || ''))
    const rows = jsonData.slice(1).filter((row) => row.some((cell) => cell))

    // 自动映射列
    const columnMap: Record<string, string> = {}
    Object.entries(columnMappings).forEach(([field, possibleNames]) => {
      for (const header of fileHeaders) {
        const normalizedHeader = header.trim().toLowerCase()
        for (const name of possibleNames) {
          if (normalizedHeader === name.toLowerCase()) {
            columnMap[field] = header
            break
          }
        }
        if (columnMap[field]) break
      }
    })

    const headerIndexMap: Record<string, number> = {}
    fileHeaders.forEach((h, i) => {
      headerIndexMap[h] = i
    })

    // 解析并标准化每条记录
    const allRecords = rows
      .map((row) => {
        const record: Record<string, any> = {}
        Object.entries(columnMap).forEach(([field, header]) => {
          if (header && headerIndexMap[header] !== undefined) {
            record[field] = row[headerIndexMap[header]]
          }
        })
        return normalizeRecord({ ...record, _filename: filename || 'unknown' })
      })
      .filter((record) => record.company && record.company !== '未知公司')

    if (allRecords.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No valid records found in Excel file'
      })
      return
    }

    // 批量创建项目
    const results = {
      importedCount: 0,
      failedCount: 0,
      errors: [] as string[],
      projects: [] as any[]
    }

    for (const record of allRecords) {
      try {
        const project = createProject({
          id: generateId(),
          name: record.title || record.company,
          status: 'draft',
          industry: record.industry,
          region: record.region,
          estimated_value: record.valuation?.toString() || '0',
          source: 'excel_import',
          company_name: record.company,
          company_type: record.type === 'buy' ? '买方' : '卖方',
          sell_motivation: record.description || null,
          risk_level: null,
          change_records: JSON.stringify({
            excelImport: true,
            importDate: new Date().toISOString(),
            originalData: record,
            highlights: record.highlights,
            stage: record.stage,
            amount: record.amount,
          }),
        })

        if (project) {
          results.importedCount++
          results.projects.push(project)
        } else {
          results.failedCount++
          results.errors.push(`Failed to import: ${record.company}`)
        }
      } catch (err) {
        results.failedCount++
        results.errors.push(`Error importing ${record.company}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    res.json({
      success: true,
      data: {
        importedCount: results.importedCount,
        failedCount: results.failedCount,
        errors: results.errors,
        projects: results.projects,
      }
    })
  } catch (error) {
    console.error('[Imports] POST /excel error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /api/imports/templates
 * 返回 Excel 导入模板文件
 */
importsRouter.get('/templates', (req, res) => {
  try {
    const templateData = [
      {
        '公司名称': '示例公司A',
        '项目标题': 'XX行业龙头企业出售',
        '交易金额': '¥10亿',
        '估值（亿元）': 10,
        '行业': '科技',
        '细分领域': '软件服务',
        '地域': '华东地区',
        '交易阶段': '尽调',
        '项目描述': '公司是一家专注于XX领域的领先企业...',
        '亮点': '核心技术专利10项,年收入5亿元,团队规模300+',
        '类型': '卖方',
      },
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '项目数据')

    // 生成 buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="M&A项目导入模板.xlsx"')
    res.send(buffer)
  } catch (error) {
    console.error('[Imports] GET /templates error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * POST /api/imports/sync
 * 将本地导入数据同步到后端
 */
importsRouter.post('/sync', async (req, res) => {
  try {
    const { records } = req.body

    if (!records || !Array.isArray(records) || records.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No records provided'
      })
      return
    }

    const results = {
      importedCount: 0,
      failedCount: 0,
      errors: [] as string[],
      projects: [] as any[]
    }

    for (const record of records) {
      try {
        const project = createProject({
          id: record.id || generateId(),
          name: record.title || record.company || '未命名项目',
          status: 'draft',
          industry: record.industry || '其他',
          region: record.region || '全国',
          estimated_value: record.valuation?.toString() || '0',
          source: 'excel_import',
          company_name: record.company || null,
          company_type: record.type === 'buy' ? '买方' : '卖方',
          sell_motivation: record.description || null,
          risk_level: null,
          change_records: JSON.stringify({
            excelImport: true,
            importDate: new Date().toISOString(),
            originalData: record,
            highlights: record.highlights,
            stage: record.stage,
            amount: record.amount,
          }),
        })

        if (project) {
          results.importedCount++
          results.projects.push(project)
        } else {
          results.failedCount++
          results.errors.push(`Failed to import: ${record.company}`)
        }
      } catch (err) {
        results.failedCount++
        results.errors.push(`Error importing ${record.company}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    res.json({
      success: true,
      data: {
        importedCount: results.importedCount,
        failedCount: results.failedCount,
        errors: results.errors,
        projects: results.projects,
      }
    })
  } catch (error) {
    console.error('[Imports] POST /sync error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /api/imports/excel-projects
 * 获取所有来源为 excel_import 的项目
 */
importsRouter.get('/excel-projects', (req, res) => {
  try {
    const projects = listProjects({ keyword: undefined }, 100, 0)
    const excelProjects = projects.filter(p => p.source === 'excel_import')

    res.json({
      success: true,
      data: excelProjects
    })
  } catch (error) {
    console.error('[Imports] GET /excel-projects error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
