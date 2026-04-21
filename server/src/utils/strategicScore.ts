/**
 * 战略协同性评分
 * 基于行业关联度、并购经验、资金支付力计算
 */

import { clampScore, safeDivide } from './screeningHelper.js'
import { StockWithScore } from './stockDb.js'
import { CompanyProfile } from './screeningHelper.js'
import { NewsData, countMAKeywords } from './akshareData.js'
import { FinancialData } from './akshareData.js'

// LLM并购分析结果接口
export interface MAAnalysisResult {
  hasMA: boolean
  count: number
  details: string
}

// 战略协同性评分结果接口
export interface StrategicScoreResult {
  score: number                      // 综合战略协同性 (0-100)
  industryMatchScore: number         // 行业关联度评分
  maExperienceScore: number          // 并购经验评分
  paymentCapacityScore: number       // 资金支付力评分
  details: {
    industryMatch: {
      value: string
      score: number
      level: string
      matchedKeywords: string[]
    }
    maExperience: {
      count: number
      score: number
      level: string
    }
    paymentCapacity: {
      ratio: number
      score: number
      level: string
    }
  }
}

/**
 * 计算行业关联度评分
 * 基于关键词匹配
 */
function calculateIndustryMatchScore(
  candidate: StockWithScore,
  profile: CompanyProfile
): {
  score: number
  details: {
    value: string
    score: number
    level: string
    matchedKeywords: string[]
  }
} {
  // 合并候选股票的关键文本
  const candidateText = `${candidate.main_business || ''} ${candidate.main_products || ''} ${candidate.business_scope || ''}`.toLowerCase()

  // 统计匹配的关键词
  const matchedKeywords: string[] = []
  const allKeywords = [...profile.keywords, ...profile.relatedIndustries, profile.mainBusiness]

  for (const keyword of allKeywords) {
    if (keyword && candidateText.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword)
    }
  }

  // 计算匹配比例
  const uniqueKeywords = [...new Set(allKeywords.filter(k => k))]
  const matchRatio = uniqueKeywords.length > 0 ? matchedKeywords.length / uniqueKeywords.length : 0

  // 评分
  let score: number
  let level: string

  if (matchRatio >= 0.6) {
    score = 100
    level = '高度相关'
  } else if (matchRatio >= 0.4) {
    score = 70
    level = '中度相关'
  } else if (matchRatio >= 0.2) {
    score = 50
    level = '低度相关'
  } else if (matchedKeywords.length > 0) {
    score = 30
    level = '弱相关'
  } else {
    score = 20
    level = '无关'
  }

  return {
    score: clampScore(score),
    details: {
      value: matchedKeywords.slice(0, 3).join(', ') || '无直接匹配',
      score: clampScore(score),
      level,
      matchedKeywords: matchedKeywords.slice(0, 5)
    }
  }
}

/**
 * 计算并购经验评分
 * 优先使用LLM分析结果，否则降级到关键词统计
 */
function calculateMAExperienceScore(
  newsList: NewsData[],
  maAnalysis?: MAAnalysisResult
): {
  score: number
  details: {
    count: number
    score: number
    level: string
  }
} {
  // 优先使用LLM分析结果
  if (maAnalysis) {
    const score = maAnalysis.count >= 3 ? 100 : maAnalysis.count >= 1 ? 70 : 30
    const level = maAnalysis.count >= 3 ? '丰富' : maAnalysis.count >= 1 ? '一般' : '无记录'
    return {
      score: clampScore(score),
      details: {
        count: maAnalysis.count,
        score: clampScore(score),
        level: `${level}（LLM分析）`
      }
    }
  }

  // 降级到关键词计数
  const maCount = countMAKeywords(newsList)

  let score: number
  let level: string

  if (maCount >= 5) {
    score = 100
    level = '丰富'
  } else if (maCount >= 3) {
    score = 80
    level = '较多'
  } else if (maCount >= 1) {
    score = 60
    level = '一般'
  } else if (maCount === 0) {
    score = 30
    level = '无记录'
  } else {
    score = 20
    level = '记录异常'
  }

  return {
    score: clampScore(score),
    details: {
      count: maCount,
      score: clampScore(score),
      level
    }
  }
}

/**
 * 计算资金支付力评分
 * 基于货币资金与估值的比率
 */
function calculatePaymentCapacityScore(
  financialData: FinancialData,
  estimatedValue: number
): {
  score: number
  details: {
    ratio: number
    score: number
    level: string
  }
} {
  // estimatedValue单位是万元
  const estimatedValueInYuan = estimatedValue * 10000
  const paymentRatio = safeDivide(financialData.monetaryFunds, estimatedValueInYuan, 0)

  // 评分
  let score: number
  let level: string

  if (paymentRatio >= 2.0) {
    score = 100
    level = '充裕'
  } else if (paymentRatio >= 1.5) {
    score = 90
    level = '充足'
  } else if (paymentRatio >= 1.0) {
    score = 70
    level = '良好'
  } else if (paymentRatio >= 0.5) {
    score = 50
    level = '一般'
  } else if (paymentRatio >= 0.2) {
    score = 30
    level = '不足'
  } else {
    score = 20
    level = '严重不足'
  }

  return {
    score: clampScore(score),
    details: {
      ratio: paymentRatio,
      score: clampScore(score),
      level
    }
  }
}

/**
 * 计算综合战略协同性
 * @param candidate 候选股票信息
 * @param profile 目标公司画像
 * @param financialData 候选公司财务数据
 * @param newsList 候选公司新闻数据
 * @param estimatedValue 目标估值（万元）
 * @param maAnalysis LLM并购分析结果（可选）
 */
export function calculateStrategicAlignmentScore(
  candidate: StockWithScore,
  profile: CompanyProfile,
  financialData: FinancialData,
  newsList: NewsData[],
  estimatedValue: number = 50000,
  maAnalysis?: MAAnalysisResult
): StrategicScoreResult {
  // 1. 行业关联度 (30%)
  const industryMatch = calculateIndustryMatchScore(candidate, profile)

  // 2. 并购经验 (10%)，优先用LLM分析结果
  const maExperience = calculateMAExperienceScore(newsList, maAnalysis)

  // 3. 资金支付力 (10%)
  const paymentCapacity = calculatePaymentCapacityScore(financialData, estimatedValue)

  // 综合评分
  // 权重总和为50%，因为战略协同性占总评分的50%
  const totalWeight = 0.30 + 0.10 + 0.10  // 0.5 = 50%
  const score = (
    industryMatch.score * 0.30 +
    maExperience.score * 0.10 +
    paymentCapacity.score * 0.10
  ) / totalWeight

  return {
    score: clampScore(score),
    industryMatchScore: industryMatch.score,
    maExperienceScore: maExperience.score,
    paymentCapacityScore: paymentCapacity.score,
    details: {
      industryMatch: industryMatch.details,
      maExperience: maExperience.details,
      paymentCapacity: paymentCapacity.details
    }
  }
}

/**
 * 格式化战略协同性评分结果（用于API响应）
 */
export function formatStrategicScoreResult(result: StrategicScoreResult): any {
  return {
    overall: {
      value: result.score,
      grade: result.score >= 80 ? '优秀' : result.score >= 60 ? '良好' : result.score >= 40 ? '一般' : '较差'
    },
    industryMatch: {
      value: result.industryMatchScore,
      weight: '30%',
      details: {
        description: result.details.industryMatch.value,
        level: result.details.industryMatch.level,
        keywords: result.details.industryMatch.matchedKeywords.join(', ')
      }
    },
    maExperience: {
      value: result.maExperienceScore,
      weight: '10%',
      details: {
        count: `${result.details.maExperience.count}次近3年并购`,
        level: result.details.maExperience.level
      }
    },
    paymentCapacity: {
      value: result.paymentCapacityScore,
      weight: '10%',
      details: {
        ratio: `${result.details.paymentCapacity.ratio.toFixed(2)}倍`,
        level: result.details.paymentCapacity.level
      }
    }
  }
}
