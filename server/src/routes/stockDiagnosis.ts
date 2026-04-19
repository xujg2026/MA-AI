/**
 * 股票诊断API路由
 *
 * POST /api/diagnosis/stock
 * 调用stock-diagnosis技能进行股票诊断
 */

import { Router } from 'express'
import { runMXSkillSimple } from '../utils/mxSkillRunner.js'

export const stockDiagnosisRouter = Router()

/**
 * 诊断股票
 *
 * Body: { query: string }
 */
stockDiagnosisRouter.post('/stock', async (req, res) => {
  try {
    const { query } = req.body

    if (!query) {
      res.status(400).json({
        success: false,
        error: 'query is required'
      })
      return
    }

    console.log(`[StockDiagnosis] Query: ${query}`)

    const result = await runMXSkillSimple(
      'stock-diagnosis',
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
    console.error('[StockDiagnosis] Error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * 诊断多只股票
 *
 * POST /api/diagnosis/batch
 * Body: { queries: string[] }
 */
stockDiagnosisRouter.post('/batch', async (req, res) => {
  try {
    const { queries } = req.body

    if (!queries || !Array.isArray(queries)) {
      res.status(400).json({
        success: false,
        error: 'queries array is required'
      })
      return
    }

    console.log(`[StockDiagnosis] Batch query: ${queries.length} stocks`)

    // 限制并发数量
    const BATCH_SIZE = 3
    const results = []

    for (let i = 0; i < queries.length; i += BATCH_SIZE) {
      const batch = queries.slice(i, i + BATCH_SIZE)
      const batchResults = await Promise.all(
        batch.map(query =>
          runMXSkillSimple('stock-diagnosis', 'get_data.py', query, { noSave: true })
        )
      )
      results.push(...batchResults)
    }

    res.json({
      success: true,
      data: results.map((r, i) => ({
        query: queries[i],
        ...(r.success ? { data: r.data } : { error: r.error })
      }))
    })
  } catch (error) {
    console.error('[StockDiagnosis] Error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
