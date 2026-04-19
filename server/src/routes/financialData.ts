/**
 * 金融数据查询API路由
 *
 * POST /api/financial/query
 * 调用mx-finance-data技能查询金融数据
 */

import { Router } from 'express'
import { runMXSkillSimple } from '../utils/mxSkillRunner.js'

export const financialDataRouter = Router()

/**
 * 查询金融数据
 *
 * Body: { query: string }
 */
financialDataRouter.post('/query', async (req, res) => {
  try {
    const { query } = req.body

    if (!query) {
      res.status(400).json({
        success: false,
        error: 'query is required'
      })
      return
    }

    console.log(`[FinancialData] Query: ${query}`)

    const result = await runMXSkillSimple(
      'mx-finance-data',
      'get_data.py',
      query
    )

    if (!result.success) {
      res.json({
        success: false,
        error: result.error,
        data: null
      })
      return
    }

    res.json({
      success: true,
      data: result.data,
      outputPath: result.outputPath
    })
  } catch (error) {
    console.error('[FinancialData] Error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * 获取企业财务概览
 *
 * GET /api/financial/overview?company=xxx
 */
financialDataRouter.get('/overview', async (req, res) => {
  try {
    const { company } = req.query

    if (!company) {
      res.status(400).json({
        success: false,
        error: 'company is required'
      })
      return
    }

    const query = `${company} 主营业务 营业收入 净利润 资产负债率 现金流`
    const result = await runMXSkillSimple('mx-finance-data', 'get_data.py', query)

    res.json({
      success: result.success,
      data: result.success ? result.data : null,
      error: result.error
    })
  } catch (error) {
    console.error('[FinancialData] Error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
