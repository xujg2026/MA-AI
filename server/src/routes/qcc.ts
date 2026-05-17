import { Router } from 'express'
import { getCompanyIntelligence, isQccConfigured } from '../services/qccApi.js'
import {
  getTargetCompanyFromDb,
  saveTargetCompany,
  isDataExpired,
  extractCompanyInfoFromQcc,
  TargetCompanyData,
} from '../utils/qccDataStore.js'

export const qccRouter = Router()

qccRouter.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      configured: isQccConfigured(),
    },
  })
})

// 获取缓存数据
qccRouter.get('/cached-data/:companyName', (req, res) => {
  try {
    const { companyName } = req.params

    if (!companyName) {
      res.status(400).json({ success: false, error: 'companyName is required' })
      return
    }

    const cached = getTargetCompanyFromDb(companyName.trim())

    if (!cached) {
      res.json({ success: true, cacheHit: false, data: null })
      return
    }

    const expired = isDataExpired(cached.qcc_fetch_time)

    res.json({
      success: true,
      cacheHit: !expired,
      data: {
        company_name: cached.company_name,
        qcc_fetch_time: cached.qcc_fetch_time,
        isExpired: expired,
        items: cached,
      },
    })
  } catch (error) {
    console.error('[QCC] Error checking cache:', error)
    res.status(500).json({ success: false, error: 'Failed to check cache' })
  }
})

qccRouter.post('/company-intelligence', async (req, res) => {
  try {
    const { companyName, forceRefresh } = req.body

    if (!companyName || typeof companyName !== 'string') {
      res.status(400).json({
        success: false,
        error: 'companyName is required',
      })
      return
    }

    const companyNameTrimmed = companyName.trim()

    // 检查缓存（除非 forceRefresh 为 true）
    if (!forceRefresh) {
      const cached = getTargetCompanyFromDb(companyNameTrimmed)
      if (cached && !isDataExpired(cached.qcc_fetch_time)) {
        console.log(`[QCC] Cache hit for ${companyNameTrimmed}`)
        res.json({
          success: true,
          cacheHit: true,
          data: cached,
        })
        return
      }
    }

    // 调用企查查API获取新数据
    const result = await getCompanyIntelligence(companyNameTrimmed)

    if (!result.success) {
      res.status(result.error === 'QCC_API_KEY is not configured' ? 503 : 502).json(result)
      return
    }

    // 保存到本地缓存
    const dataToSave: TargetCompanyData = {
      company_name: companyNameTrimmed,
      ...extractCompanyInfoFromQcc(result.data?.companyInfo),
      shareholder_info: result.data?.shareholderInfo,
      key_personnel: result.data?.keyPersonnel,
      actual_controller: result.data?.actualController,
      dishonest_info: result.data?.dishonestInfo,
      business_exception: result.data?.businessException,
      administrative_penalty: result.data?.administrativePenalty,
      patent_info: result.data?.patentInfo,
      trademark_info: result.data?.trademarkInfo,
      bidding_info: result.data?.biddingInfo,
      qualifications: result.data?.qualifications,
      credit_evaluation: result.data?.creditEvaluation,
      raw_data: result.data,
    }
    saveTargetCompany(dataToSave)

    res.json({
      ...result,
      cacheHit: false,
    })
  } catch (error) {
    console.error('[QCC] Error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})
