/**
 * 买家画像API路由
 *
 * GET /api/buyer/profile?companyName=xxx&stockCode=xxx
 * 获取买家的综合画像数据
 */

import { Router } from 'express'
import { runMXSkillSimple } from '../utils/mxSkillRunner.js'

export const buyerProfileRouter = Router()

/**
 * 获取买家画像
 *
 * Query参数:
 * - companyName: 公司名称
 * - stockCode: 股票代码（可选）
 */
buyerProfileRouter.get('/profile', async (req, res) => {
  try {
    const { companyName, stockCode } = req.query

    if (!companyName) {
      res.status(400).json({
        success: false,
        error: 'companyName is required'
      })
      return
    }

    console.log(`[BuyerProfile] Fetching profile for: ${companyName}`)

    // 并行调用多个mx-skills获取数据
    const [financialResult, newsResult] = await Promise.all([
      runMXSkillSimple(
        'mx-finance-data',
        'get_data.py',
        `${companyName} 主营业务构成 资产负债率 现金流 货币资金`,
        { noSave: true }
      ),
      runMXSkillSimple(
        'mx-finance-search',
        'get_data.py',
        `${companyName} 并购 收购 战略扩张 投资`,
        { noSave: true }
      )
    ])

    // 如果API调用失败，返回错误
    if (!financialResult.success) {
      // 返回模拟数据用于演示
      console.warn('[BuyerProfile] mx-skills failed, returning mock data:', financialResult.error)
      res.json({
        success: true,
        data: getMockBuyerProfile(companyName as string, stockCode as string | undefined),
        _mock: true,
        _warning: 'mx-skills not available, using mock data'
      })
      return
    }

    // 解析返回数据构建买家画像
    const profile = parseBuyerProfile(companyName as string, stockCode as string | undefined, {
      financials: financialResult.data,
      news: newsResult.data
    })

    res.json({
      success: true,
      data: profile
    })
  } catch (error) {
    console.error('[BuyerProfile] Error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * 解析买家画像数据
 */
function parseBuyerProfile(
  companyName: string,
  stockCode: string | undefined,
  rawData: { financials?: any; news?: any }
) {
  // 实际应该解析financials和news数据
  // 这里简化处理，演示用

  return {
    companyName,
    stockCode,
    industry: '检测认证',
    address: '上海市浦东新区',
    employeeScale: '1000-5000人',
    establishmentDate: '2015-03-20',
    contact: '400-888-8888',
    mainBusiness: '第三方检测认证服务',
    registeredCapital: '50000万元',

    financials: {
      monetaryFunds: 150000,
      tradingFinancialAssets: 80000,
      targetValuation: 200000,
      assetLiabilityRatio: 45,
      unusedCredit: 100000,
      equityPledgeRatio: 20,
      operatingCashFlows: [
        { year: 2025, amount: 25000 },
        { year: 2024, amount: 22000 },
        { year: 2023, amount: 20000 }
      ],
      netProfits: [
        { year: 2025, amount: 18000 },
        { year: 2024, amount: 16000 },
        { year: 2023, amount: 14000 }
      ],
      revenue: 80000,
      netAsset: 120000,
      totalAsset: 250000
    },

    certifications: [
      { type: 'CMA', scope: ['食品检测', '环境检测'], issueDate: '2020-01-15' },
      { type: 'CNAS', scope: ['食品检测', '环境检测', '消费品检测'], issueDate: '2019-06-20' }
    ],

    maHistory: [
      {
        year: 2024,
        target: '某检测公司',
        amount: 15000,
        performanceCommitment: 2000,
        actualPerformance: 2200
      },
      {
        year: 2023,
        target: '某认证机构',
        amount: 8000,
        performanceCommitment: 1000,
        actualPerformance: 1100
      }
    ],

    shareholderStructure: {
      largestShareholderRatio: 45
    },

    avgDecisionCycle: 4,

    integrationResults: {
      customerRetention: 92,
      techRetention: 88,
      revenueGrowth: 15,
      industryAvgGrowth: 10
    },

    hasMADepartment: true,
    hasExperiencedExecutive: true,

    complianceRecords: {
      hasViolation: false,
      violationLevel: 'none' as const,
      hasAntiMonopolyIssue: false,
      hasMajorLitigation: false,
      hasDebtDefault: false
    },

    regionalPresence: [
      { province: '上海', labCount: 5, marketShare: 15 },
      { province: '北京', labCount: 3, marketShare: 10 },
      { province: '广东', labCount: 4, marketShare: 12 }
    ],

    _rawData: rawData
  }
}

/**
 * 获取模拟买家画像（当mx-skills不可用时）
 */
function getMockBuyerProfile(companyName: string, stockCode?: string) {
  return parseBuyerProfile(companyName, stockCode, {})
}
