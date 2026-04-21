/**
 * 公司画像分析工具
 * 调用LLM分析目标公司业务特征
 */

import { getLLMConfig, isLLMConfigured, getOpenAICompatibleBaseUrl } from '../config/llm.js'
import { CompanyProfile, logScreeningProcess, getDefaultCompanyProfile } from './screeningHelper.js'

// LLM提示词
const COMPANY_ANALYSIS_PROMPT = `你是一个专业的并购顾问AI。请分析目标公司的业务特征，输出一份结构化的公司画像。

目标公司名称：{companyName}

企业工商信息：
- 主营业务：{mainBusiness}
- 经营范围：{businessScope}
- 所属行业：{industry}
- 注册资本：{registeredCapital}

请返回以下格式的JSON（只返回JSON，不要其他内容）：

{
  "mainBusiness": "主营业务一句话描述",
  "detectionTypes": ["检测种类1", "检测种类2"],
  "relatedIndustries": ["相关行业1", "相关行业2", "相关行业3"],
  "keywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"],
  "targetBuyerProfile": "目标买家特征描述（如：汽车制造企业、上市公司、有并购经验等）"
}

规则：
- detectionTypes: 如果公司不是检测行业则返回空数组[]
- relatedIndustries: 列出目标公司可能的上下游行业或关联行业
- keywords: 用于在A股数据库中搜索匹配公司，必须涵盖主营业务、检测类型、相关行业
- 至少返回5个关键词

只返回JSON，不要有任何解释。`

/**
 * 填充提示词模板
 */
function fillPromptTemplate(template: string, data: {
  companyName: string
  mainBusiness?: string
  businessScope?: string
  industry?: string
  registeredCapital?: string
}): string {
  return template
    .replace('{companyName}', data.companyName || '')
    .replace('{mainBusiness}', data.mainBusiness || '未知')
    .replace('{businessScope}', data.businessScope || '未知')
    .replace('{industry}', data.industry || '未知')
    .replace('{registeredCapital}', data.registeredCapital || '未知')
}

/**
 * 解析LLM返回的JSON
 */
function parseLLMResponse(text: string): CompanyProfile | null {
  try {
    // 尝试提取JSON（处理可能的markdown代码块）
    let jsonStr = text.trim()

    // 移除markdown代码块标记
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7)
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3)
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3)
    }

    jsonStr = jsonStr.trim()

    const parsed = JSON.parse(jsonStr)

    // 验证必要字段
    if (!parsed.mainBusiness || !Array.isArray(parsed.keywords)) {
      console.warn('[CompanyProfile] LLM返回格式不完整')
      return null
    }

    return {
      mainBusiness: parsed.mainBusiness,
      detectionTypes: Array.isArray(parsed.detectionTypes) ? parsed.detectionTypes : [],
      relatedIndustries: Array.isArray(parsed.relatedIndustries) ? parsed.relatedIndustries : [],
      keywords: parsed.keywords.slice(0, 10), // 最多10个关键词
      targetBuyerProfile: parsed.targetBuyerProfile || '',
    }
  } catch (error) {
    console.error('[CompanyProfile] 解析LLM响应失败:', error)
    console.error('[CompanyProfile] 原始响应:', text.slice(0, 500))
    return null
  }
}

/**
 * 调用OpenAI兼容API（带重试）
 */
async function callOpenAIAPI(prompt: string, config: any): Promise<string> {
  const baseUrl = getOpenAICompatibleBaseUrl()
  const url = `${baseUrl}/chat/completions`
  const TIMEOUT_MS = 60000  // 60秒超时

  let lastError: Error | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: '你是一个专业的并购顾问AI，只返回JSON，不要其他内容。' },
            { role: 'user', content: prompt },
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OpenAI API错误 ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || ''
    } catch (err) {
      lastError = err as Error
      console.warn(`[CompanyProfile] OpenAI调用失败(第${attempt + 1}次):`, lastError.message)
      if (attempt < 2) {
        const delay = (attempt + 1) * 2000  // 2s, 4s 重试
        await new Promise(r => setTimeout(r, delay))
      }
    }
  }
  throw lastError || new Error('OpenAI API全部重试失败')
}

/**
 * 调用Anthropic API（带重试）
 */
async function callAnthropicAPI(prompt: string, config: any): Promise<string> {
  const url = 'https://api.anthropic.com/v1/messages'
  const TIMEOUT_MS = 60000  // 60秒超时

  let lastError: Error | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'user', content: prompt },
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Anthropic API错误 ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      return data.content?.[0]?.text || ''
    } catch (err) {
      lastError = err as Error
      console.warn(`[CompanyProfile] Anthropic调用失败(第${attempt + 1}次):`, lastError.message)
      if (attempt < 2) {
        const delay = (attempt + 1) * 2000
        await new Promise(r => setTimeout(r, delay))
      }
    }
  }
  throw lastError || new Error('Anthropic API全部重试失败')
}

/**
 * 分析公司画像
 */
export async function analyzeCompanyProfile(
  companyName: string,
  companyInfo: {
    mainBusiness?: string
    businessScope?: string
    industry?: string
    registeredCapital?: string
  }
): Promise<CompanyProfile> {
  const startTime = Date.now()

  // 1. 检查LLM是否配置
  if (!isLLMConfigured()) {
    console.warn('[CompanyProfile] LLM未配置，使用默认画像')
    logScreeningProcess(companyName, 'llm', 'fallback', Date.now() - startTime, 'LLM未配置')
    // 优先使用传入的行业，其次使用目标公司行业
    const industryToUse = companyInfo.industry || companyInfo.mainBusiness || undefined
    return getDefaultProfile(industryToUse)
  }

  const config = getLLMConfig()

  // 2. 填充提示词
  const prompt = fillPromptTemplate(COMPANY_ANALYSIS_PROMPT, {
    companyName,
    mainBusiness: companyInfo.mainBusiness,
    businessScope: companyInfo.businessScope,
    industry: companyInfo.industry,
    registeredCapital: companyInfo.registeredCapital,
  })

  // 3. 调用LLM
  try {
    let responseText: string

    if (config.provider === 'anthropic') {
      responseText = await callAnthropicAPI(prompt, config)
    } else {
      responseText = await callOpenAIAPI(prompt, config)
    }

    // 4. 解析响应
    const profile = parseLLMResponse(responseText)

    if (profile) {
      console.log(`[CompanyProfile] LLM分析成功: ${companyName}`)
      logScreeningProcess(companyName, 'llm', 'success', Date.now() - startTime)
      return profile
    }

    console.warn(`[CompanyProfile] LLM响应解析失败，使用默认画像`)
    logScreeningProcess(companyName, 'llm', 'fallback', Date.now() - startTime, '响应解析失败')
    const industryToUse = companyInfo.industry || companyInfo.mainBusiness || undefined
    return getDefaultProfile(industryToUse)

  } catch (error) {
    console.error(`[CompanyProfile] LLM调用失败:`, error)
    logScreeningProcess(companyName, 'llm', 'failed', Date.now() - startTime, String(error))
    const industryToUse = companyInfo.industry || companyInfo.mainBusiness || undefined
    return getDefaultProfile(industryToUse)
  }
}

// 获取默认画像的辅助函数
function getDefaultProfile(industry?: string): CompanyProfile {
  return getDefaultCompanyProfile(industry)
}

/**
 * 批量分析公司画像（用于未来扩展）
 */
export async function batchAnalyzeCompanyProfile(
  companies: Array<{
    companyName: string
    mainBusiness?: string
    businessScope?: string
    industry?: string
  }>
): Promise<CompanyProfile[]> {
  const results = await Promise.all(
    companies.map(c => analyzeCompanyProfile(c.companyName, {
      mainBusiness: c.mainBusiness,
      businessScope: c.businessScope,
      industry: c.industry,
    }))
  )
  return results
}
