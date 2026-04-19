import { Router } from 'express'
import { getCompanyIntelligence, isQccConfigured } from '../services/qccApi.js'

export const qccRouter = Router()

qccRouter.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      configured: isQccConfigured(),
    },
  })
})

qccRouter.post('/company-intelligence', async (req, res) => {
  try {
    const { companyName } = req.body

    if (!companyName || typeof companyName !== 'string') {
      res.status(400).json({
        success: false,
        error: 'companyName is required',
      })
      return
    }

    const result = await getCompanyIntelligence(companyName.trim())

    if (!result.success) {
      res.status(result.error === 'QCC_API_KEY is not configured' ? 503 : 502).json(result)
      return
    }

    res.json(result)
  } catch (error) {
    console.error('[QCC] Error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})
