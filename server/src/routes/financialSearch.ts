/**
 * 金融资讯搜索API路由
 *
 * POST /api/search/news
 * 调用mx-finance-search技能搜索金融资讯
 */

import { Router } from 'express'
import { runMXSkillSimple } from '../utils/mxSkillRunner.js'

export const financialSearchRouter = Router()

/**
 * 搜索金融资讯
 *
 * Body: { query: string }
 */
financialSearchRouter.post('/news', async (req, res) => {
  try {
    const { query } = req.body

    if (!query) {
      res.status(400).json({
        success: false,
        error: 'query is required'
      })
      return
    }

    console.log(`[FinancialSearch] Query: ${query}`)

    const result = await runMXSkillSimple(
      'mx-finance-search',
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
    console.error('[FinancialSearch] Error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * 搜索并购相关资讯
 *
 * GET /api/search/ma?company=xxx
 */
financialSearchRouter.get('/ma', async (req, res) => {
  try {
    const { company } = req.query

    if (!company) {
      res.status(400).json({
        success: false,
        error: 'company is required'
      })
      return
    }

    const query = `${company} 并购 收购 战略扩张 投资动态`
    const result = await runMXSkillSimple('mx-finance-search', 'get_data.py', query)

    res.json({
      success: result.success,
      data: result.success ? result.data : null,
      error: result.error
    })
  } catch (error) {
    console.error('[FinancialSearch] Error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
