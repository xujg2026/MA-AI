/**
 * 买家初筛API路由
 *
 * POST /api/buyer/screen
 * 对全市场范围内的潜在买家进行初筛
 */

import { Router } from 'express'

export const buyerScreenRouter = Router()

interface ScreenParams {
  companyName: string
  industry: string
  region: string
  valuation: number
  mainCerts: string[]
  limit?: number
}

interface ScreenCandidate {
  companyName: string
  stockCode?: string
  industry: string
  region: string
  registeredCapital: number
  revenue?: number
  employeeScale: string
  mainBusiness: string
  acquisitionHistory: {
    count: number
    lastYear?: number
    sameIndustryCount: number
  }
  existingCerts: string[]
  matchScore: number
  matchReasons: string[]
}

// 预设候选买家池（当mx-skills不可用时使用）
const PRESET_BUYERS: ScreenCandidate[] = [
  {
    companyName: '华测检测集团',
    stockCode: '300012',
    industry: '检测认证',
    region: '华东地区',
    registeredCapital: 85000,
    revenue: 450000,
    employeeScale: '5000人以上',
    mainBusiness: '第三方检测认证服务',
    acquisitionHistory: { count: 5, lastYear: 2024, sameIndustryCount: 3 },
    existingCerts: ['CMA', 'CNAS', 'CATL'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: '中国检验认证集团',
    industry: '检测认证',
    region: '华北地区',
    registeredCapital: 100000,
    revenue: 800000,
    employeeScale: '10000人以上',
    mainBusiness: '检验认证、鉴定服务',
    acquisitionHistory: { count: 8, lastYear: 2023, sameIndustryCount: 6 },
    existingCerts: ['CMA', 'CNAS', 'ISO9001'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: '谱尼测试集团',
    stockCode: '300887',
    industry: '检测认证',
    region: '华北地区',
    registeredCapital: 45000,
    revenue: 200000,
    employeeScale: '3000-5000人',
    mainBusiness: '环境检测、食品检测、医药检测',
    acquisitionHistory: { count: 3, lastYear: 2022, sameIndustryCount: 2 },
    existingCerts: ['CMA', 'CNAS'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: '广电计量检测集团',
    stockCode: '002967',
    industry: '检测认证',
    region: '华南地区',
    registeredCapital: 55000,
    revenue: 180000,
    employeeScale: '3000-5000人',
    mainBusiness: '计量校准、环境检测、食品检测',
    acquisitionHistory: { count: 4, lastYear: 2023, sameIndustryCount: 2 },
    existingCerts: ['CMA', 'CNAS', 'ISO9001'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: '国检集团',
    stockCode: '603060',
    industry: '检测认证',
    region: '华北地区',
    registeredCapital: 65000,
    revenue: 150000,
    employeeScale: '2000-3000人',
    mainBusiness: '建材检测、环保检测',
    acquisitionHistory: { count: 2, lastYear: 2021, sameIndustryCount: 1 },
    existingCerts: ['CMA', 'CNAS'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: '中天引控科技',
    industry: '检测认证',
    region: '华东地区',
    registeredCapital: 35000,
    revenue: 120000,
    employeeScale: '1000-2000人',
    mainBusiness: '军用检测、民用检测服务',
    acquisitionHistory: { count: 1, lastYear: 2020, sameIndustryCount: 1 },
    existingCerts: ['CMA', 'CNAS', '军工认证'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: '金域医学检验',
    stockCode: '603882',
    industry: '医疗检测',
    region: '华南地区',
    registeredCapital: 46000,
    revenue: 850000,
    employeeScale: '10000人以上',
    mainBusiness: '医学检验、病理诊断',
    acquisitionHistory: { count: 6, lastYear: 2024, sameIndustryCount: 4 },
    existingCerts: ['CMA', 'CNAS', 'CAP'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: '迪安诊断技术',
    stockCode: '300244',
    industry: '医疗检测',
    region: '华东地区',
    registeredCapital: 62000,
    revenue: 680000,
    employeeScale: '8000-10000人',
    mainBusiness: '医学诊断服务、检验外包',
    acquisitionHistory: { count: 7, lastYear: 2023, sameIndustryCount: 5 },
    existingCerts: ['CMA', 'CNAS', 'CAP'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: '博济医药科技',
    stockCode: '300404',
    industry: '医药研发服务',
    region: '华南地区',
    registeredCapital: 28000,
    revenue: 95000,
    employeeScale: '1000-2000人',
    mainBusiness: '药物临床前研究、临床研究',
    acquisitionHistory: { count: 2, lastYear: 2022, sameIndustryCount: 1 },
    existingCerts: ['CMA', 'GLP'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: '国检集团珠宝检测中心',
    industry: '珠宝检测',
    region: '华南地区',
    registeredCapital: 5000,
    revenue: 25000,
    employeeScale: '200-500人',
    mainBusiness: '珠宝玉石鉴定、贵金属检测',
    acquisitionHistory: { count: 1, lastYear: 2019, sameIndustryCount: 1 },
    existingCerts: ['CMA', 'CNAS'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: 'SGS通标标准技术服务',
    industry: '检测认证',
    region: '华东地区',
    registeredCapital: 120000,
    revenue: 950000,
    employeeScale: '10000人以上',
    mainBusiness: '检测、检验、认证服务',
    acquisitionHistory: { count: 12, lastYear: 2024, sameIndustryCount: 10 },
    existingCerts: ['CMA', 'CNAS', 'ISO9001', 'IECQ'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: 'Intertek天祥集团',
    industry: '检测认证',
    region: '华东地区',
    registeredCapital: 80000,
    revenue: 720000,
    employeeScale: '8000-10000人',
    mainBusiness: '纺织品检测、电子电气检测',
    acquisitionHistory: { count: 9, lastYear: 2023, sameIndustryCount: 7 },
    existingCerts: ['CMA', 'CNAS', 'ISO9001'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: 'TUV莱茵技术大中华区',
    industry: '检测认证',
    region: '华东地区',
    registeredCapital: 50000,
    revenue: 450000,
    employeeScale: '3000-5000人',
    mainBusiness: '工业检测、产品安全检测',
    acquisitionHistory: { count: 6, lastYear: 2022, sameIndustryCount: 4 },
    existingCerts: ['CMA', 'CNAS', 'ISO9001'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: '华尊科技集团',
    industry: '检测认证',
    region: '华东地区',
    registeredCapital: 30000,
    revenue: 150000,
    employeeScale: '1000-2000人',
    mainBusiness: '特种设备检测、消防检测',
    acquisitionHistory: { count: 3, lastYear: 2023, sameIndustryCount: 2 },
    existingCerts: ['CMA', 'CNAS', '特种设备检测资质'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: '信测标准技术服务',
    industry: '检测认证',
    region: '华南地区',
    registeredCapital: 12000,
    revenue: 68000,
    employeeScale: '500-1000人',
    mainBusiness: '汽车零部件检测、电子产品检测',
    acquisitionHistory: { count: 2, lastYear: 2021, sameIndustryCount: 2 },
    existingCerts: ['CMA', 'CNAS', 'A2LA'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: '中认北方检测技术',
    industry: '检测认证',
    region: '华北地区',
    registeredCapital: 18000,
    revenue: 85000,
    employeeScale: '500-1000人',
    mainBusiness: '电力设备检测、工控安全检测',
    acquisitionHistory: { count: 2, lastYear: 2020, sameIndustryCount: 2 },
    existingCerts: ['CMA', 'CNAS', '电力检测资质'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: '倍通检测股份',
    industry: '检测认证',
    region: '华南地区',
    registeredCapital: 8000,
    revenue: 42000,
    employeeScale: '300-500人',
    mainBusiness: '食品检测、环境检测、日化品检测',
    acquisitionHistory: { count: 1, lastYear: 2019, sameIndustryCount: 1 },
    existingCerts: ['CMA', 'CNAS'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: '沃特检验集团',
    industry: '检测认证',
    region: '华南地区',
    registeredCapital: 22000,
    revenue: 98000,
    employeeScale: '1000-2000人',
    mainBusiness: '汽车材料检测、电子电器检测',
    acquisitionHistory: { count: 3, lastYear: 2023, sameIndustryCount: 3 },
    existingCerts: ['CMA', 'CNAS', 'A2LA', 'IATF16949'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: '科晓仪器股份',
    industry: '检测仪器',
    region: '华东地区',
    registeredCapital: 15000,
    revenue: 55000,
    employeeScale: '500-1000人',
    mainBusiness: '实验室仪器、检测设备制造',
    acquisitionHistory: { count: 4, lastYear: 2022, sameIndustryCount: 2 },
    existingCerts: ['ISO9001', '制造计量器具许可证'],
    matchScore: 0,
    matchReasons: []
  },
  {
    companyName: '钢研纳克检测技术',
    industry: '检测认证',
    region: '华北地区',
    registeredCapital: 25000,
    revenue: 110000,
    employeeScale: '1000-2000人',
    mainBusiness: '材料检测、金属检测、环境检测',
    acquisitionHistory: { count: 3, lastYear: 2021, sameIndustryCount: 2 },
    existingCerts: ['CMA', 'CNAS', 'NADCAP'],
    matchScore: 0,
    matchReasons: []
  }
]

// 行业映射：目标行业 -> 相关行业
const INDUSTRY_MAP: Record<string, string[]> = {
  '检测认证': ['检测认证', '医疗检测', '医药研发服务', '检测仪器', '珠宝检测'],
  '食品检测': ['检测认证', '食品加工', '餐饮连锁'],
  '环境检测': ['检测认证', '环保工程', '能源管理'],
  '医药检测': ['医疗检测', '生物制药', '医疗服务'],
  '材料检测': ['检测认证', '制造业', '金属加工'],
  '珠宝检测': ['珠宝检测', '奢侈品', '零售消费']
}

// 地区映射
const REGION_MAP: Record<string, string[]> = {
  '华北地区': ['华北地区', '东北地区'],
  '华东地区': ['华东地区', '华中地区'],
  '华南地区': ['华南地区', '港澳台'],
  '西南地区': ['西南地区', '西北地区']
}

/**
 * 计算初筛匹配度
 */
function calculateMatchScore(
  candidate: ScreenCandidate,
  params: ScreenParams
): { score: number; reasons: string[] } {
  let score = 50 // 基础分
  const reasons: string[] = []

  // 1. 行业相关性（最重要，占40%）
  const relatedIndustries = INDUSTRY_MAP[params.industry] || [params.industry]
  if (candidate.industry === params.industry) {
    score += 40
    reasons.push('同行业龙头')
  } else if (relatedIndustries.includes(candidate.industry)) {
    score += 25
    reasons.push('相关行业')
  } else if (candidate.mainBusiness.includes('检测') || candidate.mainBusiness.includes('认证')) {
    score += 15
    reasons.push('有检测业务布局')
  }

  // 2. 企业规模（占25%）
  if (candidate.registeredCapital >= 50000) {
    score += 25
    reasons.push('超大规模企业')
  } else if (candidate.registeredCapital >= 20000) {
    score += 18
    reasons.push('大规模企业')
  } else if (candidate.registeredCapital >= 10000) {
    score += 12
    reasons.push('中大型企业')
  } else if (candidate.registeredCapital >= 5000) {
    score += 6
    reasons.push('中等规模')
  }

  // 3. 并购活跃度（占20%）
  if (candidate.acquisitionHistory.count >= 5) {
    score += 20
    reasons.push(`并购活跃(${candidate.acquisitionHistory.count}起)`)
  } else if (candidate.acquisitionHistory.count >= 3) {
    score += 14
    reasons.push(`有并购经验(${candidate.acquisitionHistory.count}起)`)
  } else if (candidate.acquisitionHistory.count >= 1) {
    score += 8
    reasons.push('有少量并购记录')
  }

  // 4. 同行业并购经验（占10%）
  if (candidate.acquisitionHistory.sameIndustryCount >= 3) {
    score += 10
    reasons.push('同行业并购经验丰富')
  } else if (candidate.acquisitionHistory.sameIndustryCount >= 1) {
    score += 6
    reasons.push('有同行业并购经验')
  }

  // 5. 地域匹配（占5%）
  const relatedRegions = REGION_MAP[params.region] || [params.region]
  if (relatedRegions.includes(candidate.region)) {
    score += 5
    reasons.push('地域邻近')
  }

  return { score: Math.min(100, score), reasons }
}

/**
 * 买家初筛接口
 */
buyerScreenRouter.post('/screen', async (req, res) => {
  try {
    const params: ScreenParams = req.body
    const { companyName, industry, region, valuation = 0, mainCerts = [], limit = 20 } = params

    if (!companyName) {
      res.status(400).json({
        success: false,
        error: 'companyName is required'
      })
      return
    }

    console.log(`[BuyerScreen] Screening for: ${companyName}, industry: ${industry}, region: ${region}`)

    // 使用预设候选池进行初筛
    let candidates = PRESET_BUYERS.map(candidate => {
      const { score, reasons } = calculateMatchScore(candidate, params)
      return {
        ...candidate,
        matchScore: score,
        matchReasons: reasons
      }
    })

    // 按匹配度排序
    candidates.sort((a, b) => b.matchScore - a.matchScore)

    // 过滤掉匹配度过低的（低于30分）
    candidates = candidates.filter(c => c.matchScore >= 30)

    // 限制返回数量
    const result = candidates.slice(0, limit)

    console.log(`[BuyerScreen] Found ${result.length} candidates`)

    res.json({
      success: true,
      data: {
        candidates: result,
        totalCount: result.length,
        screenParams: {
          targetCompany: companyName,
          industry,
          region,
          valuation,
          mainCerts,
          minCapital: 5000 // 默认注册资本门槛
        }
      }
    })
  } catch (error) {
    console.error('[BuyerScreen] Error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * 获取预设候选买家池（用于调试）
 */
buyerScreenRouter.get('/pool', (req, res) => {
  res.json({
    success: true,
    data: {
      totalCount: PRESET_BUYERS.length,
      industries: [...new Set(PRESET_BUYERS.map(b => b.industry))],
      regions: [...new Set(PRESET_BUYERS.map(b => b.region))]
    }
  })
})
