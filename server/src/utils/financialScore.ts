/**
 * 财务健康度评分
 * 基于AKShare获取的财务数据计算
 */

import { FinancialData } from './akshareData.js'
import { clampScore, safeDivide } from './screeningHelper.js'

// 财务评分结果接口
export interface FinancialScoreResult {
  score: number              // 综合财务健康度 (0-100)
  profitabilityScore: number  // 盈利能力评分
  cashStrengthScore: number  // 现金实力评分
  debtSafetyScore: number   // 负债安全评分
  details: {
    roe: { value: number; score: number; level: string }
    grossMargin: { value: number; score: number; level: string }
    netProfit: { value: number; score: number; level: string }
    cashRatio: { value: number; score: number; level: string }
    debtRatio: { value: number; score: number; level: string }
  }
}

/**
 * 计算ROE评分
 */
function scoreROE(roe: number): { score: number; level: string } {
  if (roe >= 20) return { score: 100, level: '优秀' }
  if (roe >= 15) return { score: 80, level: '良好' }
  if (roe >= 10) return { score: 60, level: '一般' }
  if (roe >= 5) return { score: 40, level: '较差' }
  return { score: 30, level: '极差' }
}

/**
 * 计算毛利率评分
 */
function scoreGrossMargin(margin: number): { score: number; level: string } {
  if (margin >= 40) return { score: 100, level: '优秀' }
  if (margin >= 20) return { score: 70, level: '良好' }
  if (margin >= 10) return { score: 50, level: '一般' }
  if (margin >= 5) return { score: 30, level: '较差' }
  return { score: 20, level: '极差' }
}

/**
 * 计算净利润规模评分
 * @param netProfit 净利润（元）
 */
function scoreNetProfit(netProfit: number): { score: number; level: string } {
  if (netProfit >= 10_000_000_000) return { score: 100, level: '优秀' }      // ≥100亿
  if (netProfit >= 1_000_000_000) return { score: 80, level: '良好' }      // 10-100亿
  if (netProfit >= 100_000_000) return { score: 60, level: '一般' }       // 1-10亿
  if (netProfit >= 10_000_000) return { score: 40, level: '较差' }       // 0.1-1亿
  if (netProfit >= 0) return { score: 30, level: '亏损' }
  return { score: 20, level: '大幅亏损' }
}

/**
 * 计算现金比率评分
 * @param cashRatio 货币资金/目标估值
 */
function scoreCashRatio(cashRatio: number): { score: number; level: string } {
  if (cashRatio >= 1.5) return { score: 100, level: '充裕' }
  if (cashRatio >= 1.0) return { score: 80, level: '充足' }
  if (cashRatio >= 0.5) return { score: 60, level: '一般' }
  if (cashRatio >= 0.2) return { score: 40, level: '不足' }
  return { score: 25, level: '严重不足' }
}

/**
 * 计算资产负债率评分
 */
function scoreDebtRatio(debtRatio: number): { score: number; level: string } {
  if (debtRatio <= 30) return { score: 100, level: '优秀' }
  if (debtRatio <= 50) return { score: 80, level: '良好' }
  if (debtRatio <= 60) return { score: 60, level: '一般' }
  if (debtRatio <= 70) return { score: 40, level: '较高' }
  return { score: 20, level: '过高' }
}

/**
 * 计算盈利能力评分 (满分100，权重25%)
 */
function calculateProfitabilityScore(data: FinancialData): {
  score: number
  details: {
    roe: { value: number; score: number; level: string }
    grossMargin: { value: number; score: number; level: string }
    netProfit: { value: number; score: number; level: string }
  }
} {
  const roeResult = scoreROE(data.roe)
  const marginResult = scoreGrossMargin(data.grossMargin)
  const profitResult = scoreNetProfit(data.netProfit)

  // 加权平均：ROE 40%，毛利率 30%，净利润规模 30%
  const score = roeResult.score * 0.4 + marginResult.score * 0.3 + profitResult.score * 0.3

  return {
    score: clampScore(score),
    details: {
      roe: { value: data.roe, ...roeResult },
      grossMargin: { value: data.grossMargin, ...marginResult },
      netProfit: { value: data.netProfit / 100_000_000, score: profitResult.score, level: profitResult.level }, // 转换为亿元显示
    }
  }
}

/**
 * 计算现金实力评分 (满分100，权重15%)
 */
function calculateCashStrengthScore(data: FinancialData, estimatedValue: number): {
  score: number
  details: {
    cashRatio: { value: number; score: number; level: string }
  }
} {
  const cashRatio = safeDivide(data.monetaryFunds, estimatedValue, 0)
  const ratioResult = scoreCashRatio(cashRatio)

  return {
    score: clampScore(ratioResult.score),
    details: {
      cashRatio: { value: cashRatio, ...ratioResult }
    }
  }
}

/**
 * 计算负债安全评分 (满分100，权重10%)
 */
function calculateDebtSafetyScore(data: FinancialData): {
  score: number
  details: {
    debtRatio: { value: number; score: number; level: string }
  }
} {
  const ratioResult = scoreDebtRatio(data.debtRatio)

  return {
    score: clampScore(ratioResult.score),
    details: {
      debtRatio: { value: data.debtRatio, ...ratioResult }
    }
  }
}

/**
 * 计算综合财务健康度
 * @param data 财务数据
 * @param estimatedValue 目标估值（万元），用于计算现金比率
 */
export function calculateFinancialHealthScore(
  data: FinancialData,
  estimatedValue: number = 50000
): FinancialScoreResult {
  // estimatedValue单位是万元，转换为元
  const estimatedValueInYuan = estimatedValue * 10000

  // 1. 盈利能力 (25%)
  const profitability = calculateProfitabilityScore(data)

  // 2. 现金实力 (15%)
  const cashStrength = calculateCashStrengthScore(data, estimatedValueInYuan)

  // 3. 负债安全 (10%)
  const debtSafety = calculateDebtSafetyScore(data)

  // 综合评分 = 盈利能力*25% + 现金实力*15% + 负债安全*10%
  // 注意：权重总和为50%，因为财务健康度占总评分的50%
  const totalWeight = 0.25 + 0.15 + 0.10  // 0.5 = 50%
  const score = (
    profitability.score * 0.25 +
    cashStrength.score * 0.15 +
    debtSafety.score * 0.10
  ) / totalWeight

  return {
    score: clampScore(score),
    profitabilityScore: profitability.score,
    cashStrengthScore: cashStrength.score,
    debtSafetyScore: debtSafety.score,
    details: {
      roe: profitability.details.roe,
      grossMargin: profitability.details.grossMargin,
      netProfit: profitability.details.netProfit,
      cashRatio: cashStrength.details.cashRatio,
      debtRatio: debtSafety.details.debtRatio,
    }
  }
}

/**
 * 格式化财务评分结果（用于API响应）
 */
export function formatFinancialScoreResult(result: FinancialScoreResult, estimatedValue: number): any {
  return {
    overall: {
      value: result.score,
      grade: result.score >= 80 ? '优秀' : result.score >= 60 ? '良好' : result.score >= 40 ? '一般' : '较差'
    },
    profitability: {
      value: result.profitabilityScore,
      weight: '25%',
      details: {
        roe: `${result.details.roe.value.toFixed(1)}% → ${result.details.roe.level}`,
        grossMargin: `${result.details.grossMargin.value.toFixed(1)}% → ${result.details.grossMargin.level}`,
        netProfit: `${result.details.netProfit.value.toFixed(1)}亿 → ${result.details.netProfit.level}`
      }
    },
    cashStrength: {
      value: result.cashStrengthScore,
      weight: '15%',
      details: {
        cashRatio: `${result.details.cashRatio.value.toFixed(2)}倍 → ${result.details.cashRatio.level}`
      }
    },
    debtSafety: {
      value: result.debtSafetyScore,
      weight: '10%',
      details: {
        debtRatio: `${result.details.debtRatio.value.toFixed(1)}% → ${result.details.debtRatio.level}`
      }
    }
  }
}
