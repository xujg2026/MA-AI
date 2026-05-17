/**
 * AI News Analyzer
 * 使用 AI 自动分析新闻内容，判断是否与检测行业(TIC)及兼并购相关
 */

import { getUnanalyzedArticles, updateArticleAnalysis, Article } from '../utils/newsDb.js'
import { getLLMConfig, getOpenAICompatibleBaseUrl } from '../config/llm.js'

// 分析结果接口
export interface AnalysisResult {
  is_tic: number       // 是否与检测行业相关 (0/1)
  is_ma: number        // 是否涉及兼并购 (0/1)
  category: string      // 分类
  sentiment: string     // 情感
  confidence: number    // 置信度
}

// 分析提示词
const ANALYSIS_PROMPT = `你是一个专业的TIC(检测、检验、认证)行业分析师。请分析以下新闻内容，判断其是否与检测行业及兼并购相关。

新闻标题: {title}
新闻内容: {body}

请返回 JSON 格式的分析结果:
{
  "is_tic": 0或1,        // 是否与检测行业相关 (检测、检验、认证、校准、计量等)
  "is_ma": 0或1,         // 是否涉及兼并购 (收购、股权转让、战略投资、PE/VC投资等)
  "category": "分类",    // 行业研究/技术前沿/案例分析/合规指南/市场分析/其他
  "sentiment": "情感",  // positive/negative/neutral
  "confidence": 0.0-1.0 // 判断置信度
}

注意:
- is_tic: 检测行业包括第三方检测、认证认可、检验检测、校准计量等
- is_ma: 兼并购包括收购、股权转让、战略投资、并购重组、私募投资等
- 如果无法确定，confidence 可以较低
- category 只能选择: 行业研究, 技术前沿, 案例分析, 合规指南, 市场分析, 其他`

/**
 * 调用 AI 模型进行分析
 */
async function callAI(prompt: string): Promise<AnalysisResult | null> {
  const config = getLLMConfig()

  if (!config.apiKey) {
    console.warn('[NewsAnalyzer] No LLM API key configured, using rule-based fallback')
    return null
  }

  try {
    const baseUrl = getOpenAICompatibleBaseUrl()
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: '你是一个专业的TIC行业分析师，只返回JSON格式结果。' },
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
    })

    if (!response.ok) {
      console.error('[NewsAnalyzer] AI API error:', response.status)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content?.trim()

    if (!content) {
      return null
    }

    // 解析 JSON
    // 尝试提取 JSON 对象
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      return {
        is_tic: result.is_tic ?? 0,
        is_ma: result.is_ma ?? 0,
        category: result.category || '其他',
        sentiment: result.sentiment || 'neutral',
        confidence: typeof result.confidence === 'number' ? result.confidence : 0.5,
      }
    }

    return null
  } catch (error: any) {
    console.error('[NewsAnalyzer] AI call failed:', error.message)
    return null
  }
}

/**
 * 基于规则的简单分类 (当 AI 不可用时)
 */
function ruleBasedAnalysis(title: string, body: string | null | undefined): AnalysisResult {
  const text = (title + ' ' + (body || '')).toLowerCase()

  // TIC 关键词
  const ticKeywords = [
    '检测', '检验', '认证', '核查', '校准', '计量', '评测', '质检',
    't ic', 'cmas', 'cnas', '出具检测', '检验检测', '认证认可',
  ]

  // 兼并购关键词
  const maKeywords = [
    '并购', '收购', '股权转让', '战略投资', 'pe', 'vc', '私募',
    '投资', '融资', '上市', 'ipo', '混改', '重组', '并购重组',
  ]

  // 分类关键词
  const categoryKeywords: Record<string, string[]> = {
    '行业研究': ['行业报告', '市场规模', '趋势分析', '竞争格局', '分析', '研究', '报告'],
    '技术前沿': ['ai', '人工智能', '区块链', '大数据', '技术突破', '创新', '研发'],
    '案例分析': ['收购案例', '并购复盘', '整合', '尽调', '案例', '复盘'],
    '合规指南': ['合规', '监管', '政策', '规范', '反垄断', '处罚', '整改'],
    '市场分析': ['市场动态', '投资机会', '融资', '财报', '业绩', '增长'],
  }

  // 判断 is_tic
  let isTic = 0
  for (const kw of ticKeywords) {
    if (text.includes(kw)) {
      isTic = 1
      break
    }
  }

  // 判断 is_ma
  let isMa = 0
  for (const kw of maKeywords) {
    if (text.includes(kw)) {
      isMa = 1
      break
    }
  }

  // 判断分类
  let category = '其他'
  let maxHits = 0
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    let hits = 0
    for (const kw of keywords) {
      if (text.includes(kw)) hits++
    }
    if (hits > maxHits) {
      maxHits = hits
      category = cat
    }
  }

  // 判断情感
  let sentiment = 'neutral'
  const positiveWords = ['增长', '盈利', '突破', '创新', '合作', '成功', '扩张', '提升']
  const negativeWords = ['下降', '亏损', '风险', '违规', '处罚', '失败', '裁员', '下滑']

  for (const w of positiveWords) {
    if (text.includes(w)) {
      sentiment = 'positive'
      break
    }
  }
  if (sentiment === 'neutral') {
    for (const w of negativeWords) {
      if (text.includes(w)) {
        sentiment = 'negative'
        break
      }
    }
  }

  const confidence = (isTic || isMa) ? 0.7 : 0.4

  return { is_tic: isTic, is_ma: isMa, category, sentiment, confidence }
}

/**
 * 分析单篇文章
 */
export async function analyzeArticle(article: Article): Promise<AnalysisResult> {
  const prompt = ANALYSIS_PROMPT
    .replace('{title}', article.title)
    .replace('{body}', article.body?.substring(0, 1000) || '')

  // 尝试使用 AI
  const aiResult = await callAI(prompt)

  if (aiResult) {
    console.log(`[NewsAnalyzer] AI analyzed article ${article.id}: is_tic=${aiResult.is_tic}, is_ma=${aiResult.is_ma}`)
    return aiResult
  }

  // Fallback 到规则分析
  console.log(`[NewsAnalyzer] Using rule-based analysis for article ${article.id}`)
  return ruleBasedAnalysis(article.title, article.body || null)
}

/**
 * 批量分析未处理的文章
 */
export async function batchAnalyze(limit: number = 50): Promise<number> {
  const articles = getUnanalyzedArticles(limit)

  if (articles.length === 0) {
    console.log('[NewsAnalyzer] No unanalyzed articles')
    return 0
  }

  console.log(`[NewsAnalyzer] Batch analyzing ${articles.length} articles`)

  let successCount = 0

  for (const article of articles) {
    try {
      const result = await analyzeArticle(article)
      updateArticleAnalysis(article.id!, {
        is_tic: result.is_tic,
        is_ma: result.is_ma,
        sentiment: result.sentiment,
        category: result.category,
        ai_confidence: result.confidence,
      })
      successCount++

      // 避免请求过快
      await sleep(500)
    } catch (error: any) {
      console.error(`[NewsAnalyzer] Failed to analyze article ${article.id}:`, error.message)
    }
  }

  console.log(`[NewsAnalyzer] Batch analysis complete: ${successCount}/${articles.length} successful`)
  return successCount
}

/**
 * 工具函数：睡眠
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 定期分析任务
let analyzeTimer: NodeJS.Timeout | null = null

/**
 * 启动定期 AI 分析任务
 */
export function startPeriodicAnalysis(intervalMinutes: number = 60): void {
  if (analyzeTimer) {
    clearInterval(analyzeTimer)
  }

  const intervalMs = intervalMinutes * 60 * 1000

  analyzeTimer = setInterval(() => {
    console.log('[NewsAnalyzer] Starting periodic analysis...')
    batchAnalyze(100).catch(console.error)
  }, intervalMs)

  console.log(`[NewsAnalyzer] Periodic analysis started, interval: ${intervalMinutes} minutes`)
}

/**
 * 停止定期分析任务
 */
export function stopPeriodicAnalysis(): void {
  if (analyzeTimer) {
    clearInterval(analyzeTimer)
    analyzeTimer = null
    console.log('[NewsAnalyzer] Periodic analysis stopped')
  }
}