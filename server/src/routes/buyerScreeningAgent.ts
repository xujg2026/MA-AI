/**
 * 买家筛选Agent路由
 *
 * POST /api/buyer/screening-agent
 * 结合AI和mx-skills进行全市场潜在买家初筛
 */

import { Router } from 'express'
import { runMXSkillSimple } from '../utils/mxSkillRunner.js'

export const buyerScreeningAgentRouter = Router()

type CandidateCompany = {
  code: string
  name: string
  exchange: string
  industry: string
  business: string
}

// 行业候选池基础配置（按行业分组）
const INDUSTRY_BASE_POOLS: Record<string, CandidateCompany[]> = {
  '检测认证': [
    { code: '300012', name: '华测检测', exchange: 'SZ', industry: '检测认证', business: '第三方检测认证服务' },
    { code: '300887', name: '谱尼测试', exchange: 'SZ', industry: '检测认证', business: '环境检测、食品检测、医药检测' },
    { code: '002967', name: '广电计量', exchange: 'SZ', industry: '检测认证', business: '计量校准、环境检测、食品检测' },
    { code: '603060', name: '国检集团', exchange: 'SH', industry: '检测认证', business: '建材检测、环保检测' },
    { code: '300244', name: '迪安诊断', exchange: 'SZ', industry: '医疗检测', business: '医学诊断服务、检验外包' },
    { code: '603882', name: '金域医学', exchange: 'SH', industry: '医疗检测', business: '医学检验、病理诊断' },
    { code: 'HK01363', name: '康圣环球', exchange: 'HK', industry: '医疗检测', business: '医学检验服务' },
    { code: 'NYSE:B', name: 'Bureau Veritas', exchange: 'US', industry: '检测认证', business: '检测、检验、认证服务' },
    { code: 'NYSE:SGS', name: 'SGS Group', exchange: 'US', industry: '检测认证', business: '检测、检验、认证服务' },
  ],
  '制造业': [
    { code: '600104', name: '上汽集团', exchange: 'SH', industry: '汽车制造', business: '汽车整车制造' },
    { code: '000625', name: '长安汽车', exchange: 'SZ', industry: '汽车制造', business: '汽车整车制造' },
    { code: '601127', name: '赛力斯', exchange: 'SH', industry: '汽车制造', business: '新能源汽车' },
    { code: '600741', name: '华域汽车', exchange: 'SH', industry: '汽车零部件', business: '汽车零部件' },
    { code: '002230', name: '科大讯飞', exchange: 'SZ', industry: '智能制造', business: '人工智能' },
    { code: '000333', name: '美的集团', exchange: 'SZ', industry: '家电制造', business: '家电制造' },
    { code: '600690', name: '海尔智家', exchange: 'SH', industry: '家电制造', business: '家电制造' },
    { code: '002024', name: '海尔电器', exchange: 'SZ', industry: '家电制造', business: '家电制造' },
  ],
  '医疗健康': [
    { code: '600276', name: '恒瑞医药', exchange: 'SH', industry: '医药制造', business: '创新药研发' },
    { code: '000538', name: '云南白药', exchange: 'SZ', industry: '医药制造', business: '医药制造' },
    { code: '603259', name: '药明康德', exchange: 'SH', industry: '医药研发服务', business: '医药外包' },
    { code: '300760', name: '迈瑞医疗', exchange: 'SZ', industry: '医疗器械', business: '医疗设备' },
    { code: '688271', name: '联影医疗', exchange: 'SH', industry: '医疗器械', business: '医学影像设备' },
    { code: '300015', name: '爱尔眼科', exchange: 'SZ', industry: '医疗服务', business: '眼科连锁医院' },
    { code: '300003', name: '乐普医疗', exchange: 'SZ', industry: '医疗器械', business: '心血管医疗器械' },
  ],
  '科技': [
    { code: '600570', name: '恒生电子', exchange: 'SH', industry: '软件服务', business: '金融科技' },
    { code: '300496', name: '中科创达', exchange: 'SZ', industry: '软件服务', business: '智能操作系统' },
    { code: '002415', name: '海康威视', exchange: 'SZ', industry: '电子制造', business: '安防设备' },
    { code: '000977', name: '浪潮信息', exchange: 'SZ', industry: 'IT基础设施', business: '服务器' },
    { code: '600588', name: '用友网络', exchange: 'SH', industry: '软件服务', business: '企业软件' },
    { code: '688111', name: '金山办公', exchange: 'SH', industry: '软件服务', business: '办公软件' },
  ],
  '金融服务': [
    { code: '600036', name: '招商银行', exchange: 'SH', industry: '银行', business: '商业银行' },
    { code: '601318', name: '中国平安', exchange: 'SH', industry: '保险', business: '金融保险' },
    { code: '600030', name: '中信证券', exchange: 'SH', industry: '证券', business: '证券经纪' },
    { code: '601601', name: '中国太保', exchange: 'SH', industry: '保险', business: '保险' },
    { code: '000001', name: '平安银行', exchange: 'SZ', industry: '银行', business: '商业银行' },
  ],
  '零售消费': [
    { code: '600519', name: '贵州茅台', exchange: 'SH', industry: '食品饮料', business: '白酒' },
    { code: '000858', name: '五粮液', exchange: 'SZ', industry: '食品饮料', business: '白酒' },
    { code: '603288', name: '海天味业', exchange: 'SH', industry: '食品饮料', business: '调味品' },
    { code: '002594', name: '比亚迪', exchange: 'SZ', industry: '汽车消费', business: '新能源汽车' },
    { code: '601888', name: '中国中免', exchange: 'SH', industry: '零售', business: '免税零售' },
  ],
  '能源环保': [
    { code: '600900', name: '长江电力', exchange: 'SH', industry: '电力', business: '水电' },
    { code: '600028', name: '中国石化', exchange: 'SH', industry: '能源', business: '石油化工' },
    { code: '601225', name: '陕西煤业', exchange: 'SH', industry: '煤炭', business: '煤炭开采' },
    { code: '002078', name: '太阳纸业', exchange: 'SZ', industry: '造纸', business: '纸制品' },
    { code: '601069', name: '首创股份', exchange: 'SH', industry: '环保', business: '水务处理' },
  ],
  '教育培训': [
    { code: '600661', name: '昂立教育', exchange: 'SH', industry: '教育培训', business: '教育培训' },
    { code: '300010', name: '豆神教育', exchange: 'SZ', industry: '教育培训', business: '教育服务' },
    { code: '002607', name: '中公教育', exchange: 'SZ', industry: '职业培训', business: '职业培训' },
  ],
}

// 默认通用候选池（当行业不在列表中时使用）
const DEFAULT_POOL = [
  { code: '600036', name: '招商银行', exchange: 'SH', industry: '金融服务', business: '商业银行' },
  { code: '600104', name: '上汽集团', exchange: 'SH', industry: '汽车制造', business: '汽车整车制造' },
  { code: '000333', name: '美的集团', exchange: 'SZ', industry: '家电制造', business: '家电制造' },
  { code: '600519', name: '贵州茅台', exchange: 'SH', industry: '食品饮料', business: '白酒' },
  { code: '600028', name: '中国石化', exchange: 'SH', industry: '能源', business: '石油化工' },
  { code: '601318', name: '中国平安', exchange: 'SH', industry: '金融服务', business: '金融保险' },
]

/**
 * 根据目标行业获取候选公司列表
 */
function getCandidatesForIndustry(targetIndustry: string): CandidateCompany[] {
  // 精确匹配
  if (INDUSTRY_BASE_POOLS[targetIndustry]) {
    return INDUSTRY_BASE_POOLS[targetIndustry]
  }

  // 模糊匹配
  for (const [industry, companies] of Object.entries(INDUSTRY_BASE_POOLS)) {
    if (targetIndustry.includes(industry) || industry.includes(targetIndustry)) {
      return companies
    }
  }

  // 返回默认候选池
  return DEFAULT_POOL
}

interface TargetCompany {
  name: string
  mainBusiness?: string
  coreCerts?: string[]
  region?: string
  estimatedValue?: number  // 万元
  annualProfit?: number   // 万元
  employeeScale?: string
  acquisitionMotivation?: string  // 并购动机
  industry?: string       // 目标行业
}

interface ScreeningResult {
  rank: number
  companyName: string
  stockCode: string
  exchange: string
  industry: string
  mainBusiness: string
  overallScore: number
  grade: 'S' | 'A' | 'B' | 'C' | 'D'
  keyStrengths: string[]
  mainConcerns: string[]
  coreMetrics: {
    paymentCapacity: { value: string; ratio: number; pass: boolean }
    debtRatio: { value: string; pass: boolean }
    cashFlow: { value: string; pass: boolean }
    maExperience: { count: number; pass: boolean }
    strategicAlignment: { value: string; pass: boolean }
  }
  motivationMatch?: {
    motivation: string
    matchScore: number
    reason: string
  }
  dataSources: string[]
  exclusionReasons?: string[]  // 如果被排除，标注原因
}

interface AgentRequest {
  targetCompany: TargetCompany
  limit?: number
}

/**
 * 解析财务数据
 * mx-finance-data返回Excel数据，格式为: { "sheetName": [[headers], [row1], [row2], ...] }
 */
function parseFinancialData(excelData: any): {
  monetaryFunds: number
  tradingFinancialAssets: number
  debtRatio: number
  netProfit: number
  operatingCashFlow: number
} {
  const defaultResult = {
    monetaryFunds: 100000,
    tradingFinancialAssets: 50000,
    debtRatio: 50,
    netProfit: 0,
    operatingCashFlow: 0
  }

  if (!excelData || typeof excelData !== 'object') {
    console.log('[ScreeningAgent] Invalid Excel data format')
    return defaultResult
  }

  try {
    // 获取所有sheet名称
    const sheetNames = Object.keys(excelData)
    console.log('[ScreeningAgent] Available sheets:', sheetNames)

    let debtRatio = 50
    let monetaryFunds = 100000

    for (const sheetName of sheetNames) {
      const sheetData = excelData[sheetName]
      if (!Array.isArray(sheetData)) continue

      // 解析资产负债率
      if (sheetName.includes('资产负债率')) {
        for (const row of sheetData) {
          if (!Array.isArray(row)) continue
          const firstCell = String(row[0] || '')
          if (firstCell.includes('资产负债率')) {
            // 第二列通常是最新一期数据（2025年报）
            const ratioStr = String(row[1] || '50')
            const match = ratioStr.match(/(\d+\.?\d*)/)
            if (match) {
              debtRatio = parseFloat(match[1])
              console.log('[ScreeningAgent] Found debt ratio:', debtRatio, '%')
            }
            break
          }
        }
      }

      // 解析货币资金
      if (sheetName.includes('货币资金')) {
        for (const row of sheetData) {
          if (!Array.isArray(row)) continue
          const firstCell = String(row[0] || '')
          // 查找"合计"行
          if (firstCell.includes('合计')) {
            const valueStr = String(row[1] || '0')
            // 解析数值和单位
            const numMatch = valueStr.match(/([\d.]+)\s*(亿|万|元)?/)
            if (numMatch) {
              let value = parseFloat(numMatch[1])
              const unit = numMatch[2] || ''
              // 统一转换为"万元"
              if (unit === '亿') {
                monetaryFunds = value * 10000
              } else if (unit === '万') {
                monetaryFunds = value
              } else if (unit === '元') {
                monetaryFunds = value / 10000
              } else {
                // 默认假设是亿
                monetaryFunds = value * 10000
              }
              console.log('[ScreeningAgent] Found monetary funds:', monetaryFunds, '万元 (from:', valueStr, ')')
            }
            break
          }
        }
      }
    }

    console.log('[ScreeningAgent] Parsed financials:', { monetaryFunds, debtRatio })
    return {
      monetaryFunds,
      tradingFinancialAssets: 50000, // 默认值
      debtRatio,
      netProfit: 0,
      operatingCashFlow: 0
    }
  } catch (error) {
    console.error('[ScreeningAgent] Error parsing financial data:', error)
    return defaultResult
  }
}

/**
 * 获取公司财务数据
 */
async function getCompanyFinancials(companyName: string): Promise<any> {
  const result = await runMXSkillSimple(
    'mx-finance-data',
    'get_data.py',
    `${companyName} 货币资金 交易性金融资产 资产负债率 净利润 经营现金流`
  )
  if (result.success && result.data) {
    // 如果返回的是Excel数据，解析它
    if (typeof result.data === 'object' && !Array.isArray(result.data)) {
      return parseFinancialData(result.data)
    }
    return result.data
  }
  return null
}

/**
 * 获取公司并购历史
 */
async function getCompanyMAHistory(companyName: string): Promise<any> {
  const result = await runMXSkillSimple(
    'mx-finance-search',
    'get_data.py',
    `${companyName} 并购 收购 同行业`
  )
  // mx-finance-search返回文本数据，需要解析
  if (result.success && result.data) {
    return {
      rawData: result.data,
      // 简单统计并购相关关键词出现次数
      maCount: String(result.data).split(/并购|收购/).length - 1
    }
  }
  return null
}

/**
 * 动态搜索相关行业的上市公司
 */
async function searchCompaniesByIndustry(targetIndustry: string, limit: number = 10): Promise<Array<{ code: string; name: string; exchange: string; industry: string; business: string }>> {
  const searchResults: Array<{ code: string; name: string; exchange: string; industry: string; business: string }> = []

  try {
    // 使用mx-finance-search搜索目标行业的公司
    const result = await runMXSkillSimple(
      'mx-finance-search',
      'get_data.py',
      `${targetIndustry} 上市公司 A股 主板 科创板`
    )

    if (result.success && result.data) {
      const dataStr = String(result.data)
      console.log(`[ScreeningAgent] Dynamic search found data for industry: ${targetIndustry}`)

      // 尝试解析搜索结果中的公司信息
      // 格式可能是 "公司名 (股票代码) - 描述" 或类似格式
      const lines = dataStr.split(/\n|;/).filter(line => line.trim())
      for (const line of lines.slice(0, limit)) {
        // 匹配股票代码格式: 6位数字 或 HK代码 或 NYSE:代码
        const codeMatch = line.match(/(\d{6}|HK\d+|NYSE:\w+|NASDAQ:\w+)/)
        // 匹配公司名
        const nameMatch = line.match(/^([^\(【\[]+)/)
        if (codeMatch && nameMatch) {
          const code = codeMatch[1]
          const name = nameMatch[1].trim()
          let exchange = 'SZ'
          if (code.startsWith('6')) exchange = 'SH'
          else if (code.startsWith('HK')) exchange = 'HK'
          else if (code.startsWith('NYSE')) exchange = 'US'
          else if (code.startsWith('NASDAQ')) exchange = 'US'

          searchResults.push({
            code,
            name,
            exchange,
            industry: targetIndustry,
            business: line.substring(line.indexOf(')') + 1).trim() || targetIndustry
          })
        }
      }
      console.log(`[ScreeningAgent] Dynamic search parsed ${searchResults.length} companies`)
    }
  } catch (error) {
    console.error(`[ScreeningAgent] Dynamic search error:`, error)
  }

  return searchResults
}

/**
 * 获取上市公司基本信息
 */
async function getStockInfo(stockCode: string): Promise<any> {
  const result = await runMXSkillSimple(
    'stock-diagnosis',
    'get_data.py',
    stockCode
  )
  return result.success ? result.data : null
}

/**
 * 评估单一候选公司
 */
async function evaluateCandidate(
  candidate: CandidateCompany,
  target: TargetCompany
): Promise<ScreeningResult | null> {
  const motivation = target.acquisitionMotivation || 'scale'  // 默认扩张动机
  const exclusionReasons: string[] = []

  try {
    // 并行获取数据
    const [financials, maHistory, stockInfo] = await Promise.all([
      getCompanyFinancials(candidate.name),
      getCompanyMAHistory(candidate.name),
      getStockInfo(candidate.code)
    ])

    console.log('[ScreeningAgent] Financials for', candidate.name, ':', financials)

    // 第一步：快速排除检查
    const estimatedValue = target.estimatedValue || 50000
    const dealVal = estimatedValue  // 目标公司估值（用于动机评估）

    // 1.1 检查关联业务营收占比（简化：假设检测行业公司都满足）
    // 1.2 检查即时支付能力
    const monetaryFunds = financials?.monetaryFunds || 100000
    const tradingFinancialAssets = financials?.tradingFinancialAssets || 50000
    const debtRatio = financials?.debtRatio || 50

    const paymentRatio = (monetaryFunds + tradingFinancialAssets) / estimatedValue
    console.log('[ScreeningAgent] Payment ratio:', paymentRatio, '( funds:', monetaryFunds, '+', tradingFinancialAssets, ') / ', estimatedValue)
    if (paymentRatio < 0.8) {
      exclusionReasons.push(`即时支付能力不足（${paymentRatio.toFixed(2)}倍 < 0.8倍）`)
    }

    // 1.3 检查资产负债率
    console.log('[ScreeningAgent] Debt ratio:', debtRatio)
    if (debtRatio > 80) {
      exclusionReasons.push(`资产负债率过高（${debtRatio}% > 80%）`)
    }

    // 1.4 检查并购经验
    const maCount = maHistory?.maCount || 0
    console.log('[ScreeningAgent] MA count:', maCount)

    // 如果被排除，返回null
    if (exclusionReasons.length > 0) {
      return null
    }

    // 第二步：核心评估
    let coreScore = 0

    // 战略匹配度（20%）
    let strategicScore = 50
    if (candidate.industry === '检测认证') {
      strategicScore = 100
    } else if (candidate.industry === '医疗检测') {
      strategicScore = 70
    }
    coreScore += strategicScore * 0.2

    // 即时支付能力（25%）
    let paymentScore = 50
    if (paymentRatio >= 1.5) {
      paymentScore = 100
    } else if (paymentRatio >= 1.2) {
      paymentScore = 80
    } else if (paymentRatio >= 1.0) {
      paymentScore = 60
    }
    coreScore += paymentScore * 0.25

    // 融资储备能力（15%）
    let financingScore = 60
    if (debtRatio <= 60) {
      financingScore = 100
    } else if (debtRatio <= 70) {
      financingScore = 70
    }
    coreScore += financingScore * 0.15

    // 现金流健康度（15%）
    let cashFlowScore = 60
    if (financials) {
      const cashMatch = JSON.stringify(financials).match(/经营现金流[^\d]*(\d+)/)
      if (cashMatch && parseInt(cashMatch[1]) > 0) {
        cashFlowScore = 100
      }
    }
    coreScore += cashFlowScore * 0.15

    // 决策效率（10%）
    let decisionScore = 60
    // 假设上市公司大股东持股相对集中
    if (candidate.exchange === 'SH' || candidate.exchange === 'SZ') {
      decisionScore = 70
    }
    coreScore += decisionScore * 0.1

    // 并购经验（15%）
    let maScore = 30
    if (maCount >= 3) {
      maScore = 100
    } else if (maCount >= 1) {
      maScore = 70
    }
    coreScore += maScore * 0.15

    // 第三步：基于并购动机的强化评估
    let motivationBonus = 0
    let motivationMatchReason = ''
    const keyStrengths: string[] = []

    switch (motivation) {
      case 'scale': // 快速扩大规模
        if (dealVal >= 10) {
          motivationBonus += 15
          motivationMatchReason = '规模大，适合快速扩大规模'
        } else if (dealVal >= 5) {
          motivationBonus += 10
          motivationMatchReason = '中型规模，有扩张潜力'
        }
        if (maCount >= 2) {
          motivationBonus += 10
          keyStrengths.push(`丰富的规模扩张经验(${maCount}起并购)`)
        }
        break

      case 'resources': // 获取核心资源
        motivationBonus += 5
        motivationMatchReason = '可提供资源整合机会'
        if (target.coreCerts && target.coreCerts.length > 0) {
          motivationBonus += 10
          keyStrengths.push('资质可形成互补')
          motivationMatchReason = '资质高度互补，可快速获取核心资源'
        }
        break

      case 'integration': // 产业链整合
        if (candidate.industry === target.mainBusiness) {
          motivationBonus += 15
          motivationMatchReason = '同行业，产业链整合协同性强'
        }
        if (maCount >= 2) {
          motivationBonus += 10
          keyStrengths.push(`丰富的整合经验(${maCount}起)`)
          motivationMatchReason += motivationMatchReason ? '，整合能力强' : '整合能力强'
        }
        break

      case 'diversification': // 业务多元化
        if (candidate.industry !== target.mainBusiness) {
          motivationBonus += 10
          motivationMatchReason = '跨行业布局，适合多元化战略'
        }
        if (maCount >= 1) {
          motivationBonus += 5
          keyStrengths.push('有多元化投资经验')
        }
        break

      case 'financial': // 财务优化
        if (paymentRatio >= 2.0) {
          motivationBonus += 15
          motivationMatchReason = '现金流充裕，适合财务优化'
        } else if (paymentRatio >= 1.5) {
          motivationBonus += 10
          motivationMatchReason = '支付能力良好'
        }
        if (debtRatio <= 50) {
          motivationBonus += 5
          keyStrengths.push('资产负债率低，财务结构健康')
        }
        break

      default:
        motivationMatchReason = '基本符合并购条件'
    }

    const motivationMatch = {
      motivation,
      matchScore: 50 + motivationBonus,
      reason: motivationMatchReason || '基本符合并购条件'
    }

    // 第四步：加分评估
    let bonusScore = 0

    // 行业地位
    if (['华测检测', 'SGS Group', 'Bureau Veritas'].includes(candidate.name)) {
      bonusScore += 15
      keyStrengths.push('行业龙头地位')
    }

    // 并购经验加分
    if (maCount >= 3) {
      bonusScore += 10
      keyStrengths.push(`丰富并购经验(${maCount}起)`)
    } else if (maCount >= 1) {
      bonusScore += 5
      keyStrengths.push(`有并购经验(${maCount}起)`)
    }

    // 资质互补性
    if (target.coreCerts && target.coreCerts.length > 0) {
      bonusScore += 5
      keyStrengths.push('资质可形成互补')
    }

    // 加上动机加分
    bonusScore += motivationBonus

    // 第四步：综合得分
    const overallScore = Math.min(100, coreScore + bonusScore)

    // 评级
    let grade: 'S' | 'A' | 'B' | 'C' | 'D' = 'D'
    if (overallScore >= 80) grade = 'S'
    else if (overallScore >= 70) grade = 'A'
    else if (overallScore >= 60) grade = 'B'
    else if (overallScore >= 50) grade = 'C'

    // 主要顾虑
    const mainConcerns: string[] = []
    if (paymentRatio < 1.2) mainConcerns.push('支付能力有待验证')
    if (debtRatio > 60) mainConcerns.push('负债率偏高')
    if (maCount === 0) mainConcerns.push('无同行业并购经验')

    return {
      rank: 0, // 待排序后填充
      companyName: candidate.name,
      stockCode: candidate.code,
      exchange: candidate.exchange,
      industry: candidate.industry,
      mainBusiness: candidate.business,
      overallScore: Math.round(overallScore),
      grade,
      keyStrengths,
      mainConcerns,
      coreMetrics: {
        paymentCapacity: {
          value: `${paymentRatio.toFixed(2)}倍`,
          ratio: paymentRatio,
          pass: paymentRatio >= 1.0
        },
        debtRatio: {
          value: `${debtRatio}%`,
          pass: debtRatio <= 70
        },
        cashFlow: {
          value: '正向',
          pass: cashFlowScore >= 60
        },
        maExperience: {
          count: maCount,
          pass: maCount >= 1
        },
        strategicAlignment: {
          value: candidate.industry,
          pass: strategicScore >= 60
        }
      },
      motivationMatch,
      dataSources: ['mx-finance-data API', 'mx-finance-search API', 'stock-diagnosis API']
    }

  } catch (error) {
    console.error(`[ScreeningAgent] Error evaluating ${candidate.name}:`, error)
    return null
  }
}

/**
 * 买家筛选Agent接口
 */
buyerScreeningAgentRouter.post('/screening-agent', async (req, res) => {
  try {
    const { targetCompany, limit = 10 }: AgentRequest = req.body

    if (!targetCompany?.name) {
      res.status(400).json({
        success: false,
        error: 'targetCompany.name is required'
      })
      return
    }

    const targetIndustry = targetCompany.mainBusiness || targetCompany.industry || ''
    console.log(`[ScreeningAgent] Screening for target: ${targetCompany.name}, industry: ${targetIndustry}`)

    // 步骤1: 获取基础候选池（根据目标行业）
    const baseCandidates = getCandidatesForIndustry(targetIndustry)
    console.log(`[ScreeningAgent] Base pool: ${baseCandidates.length} companies for industry "${targetIndustry}"`)

    // 步骤2: 动态搜索相关行业上市公司
    let dynamicCandidates: Array<{ code: string; name: string; exchange: string; industry: string; business: string }> = []
    if (targetIndustry) {
      try {
        dynamicCandidates = await searchCompaniesByIndustry(targetIndustry, 15)
        console.log(`[ScreeningAgent] Dynamic search: found ${dynamicCandidates.length} companies`)
      } catch (error) {
        console.warn('[ScreeningAgent] Dynamic search failed, using base pool only:', error)
      }
    }

    // 步骤3: 合并候选池并去重
    const allCandidatesMap = new Map()
    ;[...baseCandidates, ...dynamicCandidates].forEach(c => {
      if (!allCandidatesMap.has(c.code)) {
        allCandidatesMap.set(c.code, c)
      }
    })
    const allCandidates = Array.from(allCandidatesMap.values())
    console.log(`[ScreeningAgent] Total candidates after merge: ${allCandidates.length}`)

    // 步骤4: 并行评估所有候选公司
    const evaluations = await Promise.all(
      allCandidates.map(candidate => evaluateCandidate(candidate, targetCompany))
    )

    // 过滤通过筛选的候选公司
    const passedCandidates = evaluations
      .filter((result): result is ScreeningResult => result !== null)
      .sort((a, b) => b.overallScore - a.overallScore)

    // 分配排名
    passedCandidates.forEach((candidate, index) => {
      candidate.rank = index + 1
    })

    // 限制返回数量
    const recommendations = passedCandidates.slice(0, limit)

    console.log(`[ScreeningAgent] Found ${passedCandidates.length} candidates, returning top ${recommendations.length}`)

    res.json({
      success: true,
      data: {
        screeningReport: {
          targetCompany: targetCompany.name,
          targetIndustry: targetIndustry,
          screeningDate: new Date().toISOString().split('T')[0],
          totalCandidates: allCandidates.length,
          basePoolSize: baseCandidates.length,
          dynamicSearchSize: dynamicCandidates.length,
          passedFirstStep: passedCandidates.length,
          finalRecommendations: recommendations
        }
      }
    })
  } catch (error) {
    console.error('[ScreeningAgent] Error:', error)
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
  let candidates: any[] = []

  if (industry && typeof industry === 'string') {
    candidates = getCandidatesForIndustry(industry)
  } else {
    // 返回所有行业的候选池
    for (const [ind, companies] of Object.entries(INDUSTRY_BASE_POOLS)) {
      candidates.push(...companies.map(c => ({ ...c, poolIndustry: ind })))
    }
  }

  res.json({
    success: true,
    data: {
      totalCount: candidates.length,
      industryPools: Object.keys(INDUSTRY_BASE_POOLS),
      candidates: candidates.map(c => ({
        name: c.name,
        code: c.code,
        exchange: c.exchange,
        industry: c.industry
      }))
    }
  })
})
