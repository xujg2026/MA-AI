/**
 * 买家筛选Agent路由
 *
 * POST /api/buyer/screening-agent
 * 基于新的评分体系：财务健康度(50%) + 战略协同性(50%)
 */

import { Router } from 'express'
import { searchStocks, getStockByCode, StockWithScore } from '../utils/stockDb.js'
import { getCompanyInfoWithFallback, UserInputData, CompanyProfile, logScreeningProcess } from '../utils/screeningHelper.js'
import { analyzeCompanyProfile } from '../utils/companyProfile.js'
import { getFinancialData, getNewsData, getAnnouncements, fetchAnnouncementContent, analyzeMAExperienceWithLLM, MA_KEYWORDS, FinancialData, NewsData, Announcement } from '../utils/akshareData.js'
import { calculateFinancialHealthScore, formatFinancialScoreResult } from '../utils/financialScore.js'
import { calculateStrategicAlignmentScore, formatStrategicScoreResult, MAAnalysisResult } from '../utils/strategicScore.js'

export const buyerScreeningAgentRouter = Router()

// 请求接口定义
interface TargetCompany {
  name: string
  mainBusiness?: string
  estimatedValue?: number
  acquisitionMotivation?: string
  industry?: string
  region?: string
}

interface ScreeningRequest {
  targetCompany: TargetCompany
  limit?: number
}

// 筛选结果接口
interface ScreeningResult {
  rank: number
  companyName: string
  stockCode: string
  exchange: string
  industry: string
  mainBusiness: string
  overallScore: number
  grade: 'S' | 'A' | 'B' | 'C' | 'D'
  financialHealthScore: number
  strategicAlignmentScore: number
  keyStrengths: string[]
  mainConcerns: string[]
  financialDetails: any
  strategicDetails: any
  dataSources: string[]
}

/**
 * 确定交易所
 */
function getExchange(code: string): string {
  if (code.endsWith('.SH') || code.endsWith('.SZ')) {
    return code.slice(-2)
  }
  if (code.startsWith('6')) return 'SH'
  if (code.startsWith('0') || code.startsWith('3')) return 'SZ'
  if (code.startsWith('8') || code.startsWith('4')) return 'BJ'
  return 'SZ'
}

/**
 * 分配评级
 */
function assignGrade(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (score >= 85) return 'S'
  if (score >= 75) return 'A'
  if (score >= 65) return 'B'
  if (score >= 50) return 'C'
  return 'D'
}

/**
 * 买家筛选Agent接口
 */
buyerScreeningAgentRouter.post('/screening-agent', async (req, res) => {
  const startTime = Date.now()

  try {
    const { targetCompany, limit = 10 }: ScreeningRequest = req.body

    if (!targetCompany?.name) {
      res.status(400).json({
        success: false,
        error: 'targetCompany.name is required'
      })
      return
    }

    console.log(`[ScreeningAgent] 开始筛选: ${targetCompany.name}`)

    // ========== 步骤1: 获取目标公司信息（企查查+降级） ==========
    const userInput: UserInputData = {
      companyName: targetCompany.name,
      industry: targetCompany.industry,
      mainBusiness: targetCompany.mainBusiness,
      estimatedValue: targetCompany.estimatedValue,
      acquisitionMotivation: targetCompany.acquisitionMotivation,
      region: targetCompany.region,
    }

    const companyInfoResult = await getCompanyInfoWithFallback(targetCompany.name, userInput)
    console.log(`[ScreeningAgent] 步骤1完成，信息来源: ${companyInfoResult.source}`)

    // ========== 步骤2: 大模型分析公司画像 ==========
    const profile: CompanyProfile = await analyzeCompanyProfile(targetCompany.name, {
      mainBusiness: companyInfoResult.data.main_business || targetCompany.mainBusiness,
      businessScope: companyInfoResult.data.business_scope,
      industry: companyInfoResult.data.industry || targetCompany.industry,
      registeredCapital: companyInfoResult.data.registered_capital,
    })
    console.log(`[ScreeningAgent] 步骤2完成，画像:`, profile.mainBusiness, profile.keywords.slice(0, 3))

    // ========== 步骤3: 从本地数据库查询候选公司 ==========
    const candidates: StockWithScore[] = searchStocks(profile.keywords, 50)
    console.log(`[ScreeningAgent] 步骤3完成，找到 ${candidates.length} 个候选`)

    // 如果没有匹配结果，使用默认候选池
    if (candidates.length === 0) {
      const { getFallbackCandidateCodes } = await import('../utils/screeningHelper.js')
      const fallbackCodes = getFallbackCandidateCodes(targetCompany.industry)

      for (const code of fallbackCodes) {
        const stock = getStockByCode(code)
        if (stock) {
          candidates.push({ ...stock, match_score: 10 })
        }
      }
      console.log(`[ScreeningAgent] 使用默认候选池: ${candidates.length} 个`)
    }

    // ========== 步骤4: 获取财务数据和新闻数据 ==========
    const estimatedValue = targetCompany.estimatedValue || 50000 // 默认5亿

    // 并行获取所有候选的财务数据和新闻数据
    const financialDataMap = new Map<string, FinancialData>()
    const newsDataMap = new Map<string, NewsData[]>()

    // 分批处理以避免并发过高
    const BATCH_SIZE = 5
    for (let i = 0; i < Math.min(candidates.length, 30); i += BATCH_SIZE) {
      const batch = candidates.slice(i, i + BATCH_SIZE)

      const promises = batch.map(async (c) => {
        try {
          console.log(`[ScreeningAgent] [AKShare] 开始获取 ${c.code} ${c.name} 的财务和新闻数据`)
          const [financialData, newsData] = await Promise.all([
            getFinancialData(c.code),
            getNewsData(c.code, 50),
          ])
          console.log(`[ScreeningAgent] [AKShare] ${c.code} 财务数据:`, JSON.stringify(financialData))
          console.log(`[ScreeningAgent] [AKShare] ${c.code} 新闻数据: ${newsData.length} 条`)
          financialDataMap.set(c.code, financialData)
          newsDataMap.set(c.code, newsData)
        } catch (error) {
          console.warn(`[ScreeningAgent] 获取 ${c.code} 数据失败:`, error)
        }
      })

      await Promise.all(promises)
    }
    console.log(`[ScreeningAgent] 步骤4完成，获取 ${financialDataMap.size} 个财务数据`)

    // ========== 步骤4.5: 获取公告数据并用LLM分析并购经验 ==========
    const maAnalysisMap = new Map<string, MAAnalysisResult>()
    console.log(`[ScreeningAgent] 步骤4.5: 获取公告数据并分析并购经验`)

    for (let i = 0; i < Math.min(candidates.length, 30); i += BATCH_SIZE) {
      const batch = candidates.slice(i, i + BATCH_SIZE)

      const maPromises = batch.map(async (c) => {
        try {
          // 1. 获取并购相关公告
          console.log(`[ScreeningAgent] [Announcement] 获取 ${c.code} ${c.name} 的并购相关公告`)
          const announcements = await getAnnouncements(c.code, MA_KEYWORDS, '20200101', '20260420')
          console.log(`[ScreeningAgent] [Announcement] ${c.code} 找到 ${announcements.length} 条相关公告`)

          if (announcements.length === 0) {
            maAnalysisMap.set(c.code, { hasMA: false, count: 0, details: '无相关公告记录' })
            return
          }

          // 2. 抓取公告正文（最多5条，去重URL）
          const uniqueUrls = [...new Set(announcements.map(a => a.url))].slice(0, 5)
          const contentFetchPromises = uniqueUrls.map(url => fetchAnnouncementContent(url))
          const contents = await Promise.all(contentFetchPromises)

          // 3. 构建 URL -> content 映射
          const contentMap: Record<string, string> = {}
          uniqueUrls.forEach((url, idx) => {
            if (contents[idx]) contentMap[url] = contents[idx]
          })

          // 4. LLM分析并购经验
          console.log(`[ScreeningAgent] [LLM] 开始分析 ${c.code} 的并购经验`)
          const analysis = await analyzeMAExperienceWithLLM(c.name, announcements, contentMap)
          console.log(`[ScreeningAgent] [LLM] ${c.code} 并购分析结果:`, JSON.stringify(analysis))
          maAnalysisMap.set(c.code, analysis)
        } catch (error) {
          console.warn(`[ScreeningAgent] ${c.code} 并购分析失败:`, error)
          maAnalysisMap.set(c.code, { hasMA: false, count: 0, details: '分析失败' })
        }
      })

      await Promise.all(maPromises)
    }
    console.log(`[ScreeningAgent] 步骤4.5完成，完成 ${maAnalysisMap.size} 个候选的并购分析`)

    // ========== 步骤5: 计算评分 ==========
    const scoredCandidates: ScreeningResult[] = []

    for (const candidate of candidates) {
      const financialData = financialDataMap.get(candidate.code) || {
        monetaryFunds: 1_000_000_000,
        debtRatio: 50,
        roe: 10,
        grossMargin: 20,
        netProfit: 100_000_000,
        operatingCashFlow: 0,
      }

      const newsData = newsDataMap.get(candidate.code) || []

      // 计算财务健康度 (50%)
      const financialScore = calculateFinancialHealthScore(financialData, estimatedValue)

      // 计算战略协同性 (50%)，传入LLM并购分析结果
      const maAnalysis = maAnalysisMap.get(candidate.code)
      const strategicScore = calculateStrategicAlignmentScore(
        candidate,
        profile,
        financialData,
        newsData,
        estimatedValue,
        maAnalysis
      )

      // 综合评分
      const overallScore = financialScore.score * 0.5 + strategicScore.score * 0.5

      // 构建亮点和顾虑
      const keyStrengths: string[] = []
      const mainConcerns: string[] = []

      if (financialScore.details.roe.value >= 60) {
        keyStrengths.push(`ROE表现${financialScore.details.roe.level}`)
      }
      if (financialScore.cashStrengthScore >= 70) {
        keyStrengths.push(`现金实力${financialScore.details.cashRatio.level}`)
      }
      if (strategicScore.industryMatchScore >= 70) {
        keyStrengths.push(`行业${strategicScore.details.industryMatch.level}`)
      }
      if (strategicScore.maExperienceScore >= 60) {
        keyStrengths.push(`并购经验${strategicScore.details.maExperience.level}`)
      }

      if (financialScore.debtSafetyScore < 50) {
        mainConcerns.push(`资产负债率偏高 (${financialScore.details.debtRatio.value.toFixed(1)}%)`)
      }
      if (strategicScore.industryMatchScore < 50) {
        mainConcerns.push(`行业关联度${strategicScore.details.industryMatch.level}`)
      }

      scoredCandidates.push({
        rank: 0,
        companyName: candidate.name,
        stockCode: candidate.code,
        exchange: getExchange(candidate.code),
        industry: candidate.main_business?.slice(0, 50) || '未知',
        mainBusiness: candidate.main_business || '',
        overallScore: Math.round(overallScore * 10) / 10,
        grade: assignGrade(overallScore),
        financialHealthScore: Math.round(financialScore.score * 10) / 10,
        strategicAlignmentScore: Math.round(strategicScore.score * 10) / 10,
        keyStrengths,
        mainConcerns,
        financialDetails: formatFinancialScoreResult(financialScore, estimatedValue),
        strategicDetails: formatStrategicScoreResult(strategicScore),
        dataSources: ['AKShare财务数据', 'AKShare新闻数据', '本地A股数据库'].filter(Boolean),
      })
    }

    // ========== 步骤6: 排序输出 ==========
    scoredCandidates.sort((a, b) => b.overallScore - a.overallScore)
    scoredCandidates.forEach((c, i) => {
      c.rank = i + 1
    })

    const finalResults = scoredCandidates.slice(0, limit)

    const duration = Date.now() - startTime
    logScreeningProcess(targetCompany.name, 'screening_complete', 'success', duration, undefined, {
      candidatesFound: candidates.length,
      resultsReturned: finalResults.length,
    })

    console.log(`[ScreeningAgent] 筛选完成，耗时: ${duration}ms，返回 ${finalResults.length} 个结果`)

    res.json({
      success: true,
      data: {
        screeningReport: {
          targetCompany: targetCompany.name,
          targetIndustry: targetCompany.industry || profile.mainBusiness,
          screeningDate: new Date().toISOString().split('T')[0],
          totalCandidates: candidates.length,
          passedFirstStep: scoredCandidates.length,
          finalRecommendations: finalResults,
        }
      }
    })

  } catch (error) {
    console.error('[ScreeningAgent] Error:', error)
    const duration = Date.now() - startTime

    const { targetCompany } = req.body
    if (targetCompany?.name) {
      logScreeningProcess(targetCompany.name, 'screening_error', 'failed', duration, String(error))
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * 获取候选公司列表（调试用）
 */
buyerScreeningAgentRouter.get('/candidates', (req, res) => {
  const { industry } = req.query

  if (!industry || typeof industry !== 'string') {
    res.json({
      success: true,
      data: {
        message: '请提供 industry 参数',
        example: '/api/buyer/screening-agent/candidates?industry=检测'
      }
    })
    return
  }

  const candidates = searchStocks([industry], 20)

  res.json({
    success: true,
    data: {
      industry,
      count: candidates.length,
      candidates: candidates.map(c => ({
        code: c.code,
        name: c.name,
        mainBusiness: c.main_business,
        matchScore: c.match_score,
      }))
    }
  })
})

/**
 * 健康检查
 */
buyerScreeningAgentRouter.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      features: {
        qccIntegration: Boolean(process.env.QCC_API_KEY),
        llmIntegration: Boolean(process.env.LLM_API_KEY),
        akshareIntegration: true,
      }
    }
  })
})
