/**
 * 筛选辅助工具
 * 包含企查查降级逻辑、大模型降级逻辑、默认值处理等
 */

import { isQccConfigured } from '../config/qcc.js'
import { getCompanyIntelligence } from '../services/qccApi.js'
import {
  getTargetCompanyFromDb,
  saveTargetCompany,
  extractCompanyInfoFromQcc,
  isDataExpired,
  TargetCompanyData,
  logScreeningProcess
} from './qccDataStore.js'

// 重新导出（供外部调用）
export { logScreeningProcess }

// 用户输入的表单数据接口
export interface UserInputData {
  companyName: string
  industry?: string
  mainBusiness?: string
  businessScope?: string
  estimatedValue?: number
  acquisitionMotivation?: string
  region?: string
}

// 获取目标公司信息的降级逻辑
export interface CompanyInfoResult {
  source: 'cache' | 'qcc_api' | 'user_input'
  data: TargetCompanyData
  error?: string
}

export async function getCompanyInfoWithFallback(
  companyName: string,
  userInput: UserInputData
): Promise<CompanyInfoResult> {
  const startTime = Date.now()

  // 1. 先查本地数据库
  try {
    const cachedData = getTargetCompanyFromDb(companyName)
    if (cachedData && !isDataExpired(cachedData.qcc_fetch_time)) {
      console.log(`[ScreeningHelper] 使用本地缓存数据: ${companyName}`)
      logScreeningProcess(companyName, 'qcc_cache', 'success', Date.now() - startTime)
      return {
        source: 'cache',
        data: cachedData as TargetCompanyData,
      }
    }
  } catch (error) {
    console.warn(`[ScreeningHelper] 读取缓存失败:`, error)
  }

  // 2. 企查查API可用，调用API
  if (isQccConfigured()) {
    try {
      console.log(`[ScreeningHelper] 调用企查查API: ${companyName}`)
      const result = await getCompanyIntelligence(companyName)

      if (result.success && result.data) {
        // 提取基本信息
        const companyInfo = extractCompanyInfoFromQcc(result.data)

        const targetData: TargetCompanyData = {
          company_name: companyName,
          ...companyInfo,
          shareholder_info: result.data.shareholderInfo,
          key_personnel: result.data.keyPersonnel,
          actual_controller: result.data.actualController,
          dishonest_info: result.data.dishonestInfo,
          business_exception: result.data.businessException,
          administrative_penalty: result.data.administrativePenalty,
          patent_info: result.data.patentInfo,
          trademark_info: result.data.trademarkInfo,
          bidding_info: result.data.biddingInfo,
          qualifications: result.data.qualifications,
          credit_evaluation: result.data.creditEvaluation,
          raw_data: result.data,
        }

        // 保存到本地数据库
        saveTargetCompany(targetData)
        logScreeningProcess(companyName, 'qcc_api', 'success', Date.now() - startTime)

        return {
          source: 'qcc_api',
          data: targetData,
        }
      }

      console.warn(`[ScreeningHelper] 企查查调用失败: ${result.error}`)
    } catch (error) {
      console.error(`[ScreeningHelper] 企查查调用异常:`, error)
    }
  } else {
    console.warn(`[ScreeningHelper] 企查查API未配置`)
  }

  // 3. 降级到用户输入
  logScreeningProcess(companyName, 'qcc_fallback', 'fallback', Date.now() - startTime, '企查查不可用，使用用户输入')

  return {
    source: 'user_input',
    data: {
      company_name: companyName,
      main_business: userInput.mainBusiness || userInput.industry,
      business_scope: userInput.businessScope,
      industry: userInput.industry,
      region: userInput.region,
    },
    error: '企查查API不可用，使用用户输入数据',
  }
}

// 公司画像接口
export interface CompanyProfile {
  mainBusiness: string
  detectionTypes: string[]
  relatedIndustries: string[]
  keywords: string[]
  targetBuyerProfile: string
}

// 行业默认画像映射
const DEFAULT_PROFILES: Record<string, CompanyProfile> = {
  '检测认证': {
    mainBusiness: '检测认证服务',
    detectionTypes: ['环境检测', '食品检测', '医药检测'],
    relatedIndustries: ['制造业', '化工', '汽车', '建筑'],
    keywords: ['检测', '认证', '环境', '食品', '质量', '检验'],
    targetBuyerProfile: '有检测需求的上市公司、大型企业集团',
  },
  '制造业': {
    mainBusiness: '制造加工',
    detectionTypes: [],
    relatedIndustries: ['原材料供应商', '零部件供应商', '分销商'],
    keywords: ['制造', '生产', '加工', '工厂'],
    targetBuyerProfile: '行业龙头企业、有规模扩张需求的上市公司',
  },
  '医疗健康': {
    mainBusiness: '医疗健康服务',
    detectionTypes: [],
    relatedIndustries: ['制药', '医疗器械', '医疗服务'],
    keywords: ['医疗', '医院', '医药', '健康', '制药'],
    targetBuyerProfile: '医疗集团、制药企业、健康产业投资机构',
  },
  '科技': {
    mainBusiness: '科技服务',
    detectionTypes: [],
    relatedIndustries: ['软件', '硬件', '互联网'],
    keywords: ['科技', '软件', '技术', '互联网', '数据'],
    targetBuyerProfile: '科技巨头、互联网公司、有数字化转型需求的企业',
  },
}

// 获取默认公司画像
export function getDefaultCompanyProfile(industryOrMainBusiness?: string): CompanyProfile {
  if (industryOrMainBusiness) {
    const upperInput = industryOrMainBusiness.toUpperCase()
    // 先精确匹配key（如输入"检测认证"匹配"检测认证"）
    for (const [key, profile] of Object.entries(DEFAULT_PROFILES)) {
      if (upperInput === key.toUpperCase() || upperInput.includes(key.toUpperCase())) {
        return profile
      }
    }
    // 模糊匹配：用输入中的每个词去匹配key（如输入"检测"匹配"检测认证"）
    const inputWords = industryOrMainBusiness.split(/[,，\s]/)
    for (const [key, profile] of Object.entries(DEFAULT_PROFILES)) {
      const keyWords = key.split(/[,，]/)
      if (inputWords.some(iw => keyWords.some(kw => kw.toUpperCase().includes(iw.trim().toUpperCase())))) {
        return profile
      }
    }
  }

  // 返回通用默认画像
  return {
    mainBusiness: industryOrMainBusiness || '综合业务',
    detectionTypes: [],
    relatedIndustries: [],
    keywords: industryOrMainBusiness ? [industryOrMainBusiness] : [],
    targetBuyerProfile: '有并购意向的上市公司',
  }
}

// 财务数据默认值
export interface DefaultFinancialData {
  monetaryFunds: number      // 货币资金(元)，默认10亿
  debtRatio: number         // 资产负债率(%)，默认50
  roe: number              // ROE(%)，默认10
  grossMargin: number       // 毛利率(%)，默认20
  netProfit: number        // 净利润(元)，默认1亿
}

export function getDefaultFinancialData(): DefaultFinancialData {
  return {
    monetaryFunds: 1_000_000_000,   // 10亿
    debtRatio: 50,                   // 50%
    roe: 10,                        // 10%
    grossMargin: 20,                 // 20%
    netProfit: 100_000_000,        // 1亿
  }
}

// 行业头部公司备选池（当没有匹配结果时使用）
const FALLBACK_CANDIDATE_POOLS: Record<string, string[]> = {
  '检测认证': ['300012', '300887', '002967', '603060', '300244', '603882'],
  '制造业': ['600104', '000625', '601127', '600741', '002230', '000333'],
  '医疗健康': ['600276', '000538', '603259', '300760', '688271', '300015'],
  '科技': ['600570', '300496', '002415', '000977', '600588', '688111'],
  '金融服务': ['600036', '601318', '600030', '601601', '000001'],
  'default': ['600036', '600104', '000333', '600519', '600028', '601318'],
}

export function getFallbackCandidateCodes(industry?: string): string[] {
  if (!industry) {
    return FALLBACK_CANDIDATE_POOLS['default']
  }

  const upperIndustry = industry.toUpperCase()
  for (const [key, codes] of Object.entries(FALLBACK_CANDIDATE_POOLS)) {
    if (upperIndustry.includes(key.toUpperCase())) {
      return codes
    }
  }

  return FALLBACK_CANDIDATE_POOLS['default']
}

// 评分边界处理
export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10))
}

// 安全除法
export function safeDivide(numerator: number, denominator: number, defaultValue: number = 0): number {
  if (denominator === 0 || isNaN(denominator) || !isFinite(denominator)) {
    return defaultValue
  }
  return numerator / denominator
}

// 错误类型定义
export interface ScreeningError {
  code: string
  message: string
  recoverable: boolean
}

// 错误码定义
export const ERROR_CODES: Record<string, ScreeningError> = {
  QCC_NOT_CONFIGED: {
    code: 'QCC_NOT_CONFIGED',
    message: '企查查API未配置，使用输入数据进行分析',
    recoverable: true,
  },
  LLM_FAILED: {
    code: 'LLM_FAILED',
    message: 'AI分析服务暂时不可用，使用默认分析结果',
    recoverable: true,
  },
  DB_CONNECTION_FAILED: {
    code: 'DB_CONNECTION_FAILED',
    message: '数据库连接失败，请稍后重试',
    recoverable: false,
  },
  AKSHARE_LIMITED: {
    code: 'AKSHARE_LIMITED',
    message: '行情数据服务受限，部分数据可能不完整',
    recoverable: true,
  },
  NO_MATCH_RESULT: {
    code: 'NO_MATCH_RESULT',
    message: '未找到匹配公司，请尝试扩大搜索范围',
    recoverable: true,
  },
}
