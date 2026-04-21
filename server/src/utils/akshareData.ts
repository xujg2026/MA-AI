/**
 * AKShare数据获取工具
 * 用于获取A股上市公司的财务数据和新闻数据
 */

import { spawn } from 'child_process'
import { getDefaultFinancialData } from './screeningHelper.js'

// 财务数据接口
export interface FinancialData {
  monetaryFunds: number      // 货币资金(元)
  debtRatio: number         // 资产负债率(%)
  roe: number              // ROE(%)
  grossMargin: number       // 毛利率(%)
  netProfit: number        // 净利润(元)
  operatingCashFlow: number // 经营现金流(元)
}

// 新闻数据接口
export interface NewsData {
  title: string
  content?: string
  publishDate?: string
}

// AKShare调用结果封装
interface AKShareResult {
  success: boolean
  data?: any
  error?: string
}

/**
 * 调用Python脚本执行AKShare
 */
function runAkShare(script: string, args: string[]): Promise<AKShareResult> {
  return new Promise((resolve) => {
    console.log(`[AKShare] [Python] 启动python进程`)
    const pythonProcess = spawn('python', ['-c', script, ...args], {
      timeout: 30000,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONLEGACYWILDCARDSSLERC: '1' },
    })

    let stdout = ''
    let stderr = ''

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    pythonProcess.on('close', (code) => {
      if (code === 0 && stdout) {
        try {
          const data = JSON.parse(stdout)
          console.log(`[AKShare] [Python] 成功, stdout长度: ${stdout.length}`)
          resolve({ success: true, data })
        } catch {
          console.log(`[AKShare] [Python] 成功(非JSON), stdout: ${stdout.slice(0, 200)}`)
          resolve({ success: true, data: stdout.trim() })
        }
      } else {
        console.warn(`[AKShare] [Python] 失败, code=${code}, stderr: ${stderr.slice(0, 300)}`)
        resolve({
          success: false,
          error: stderr || `Python进程退出码: ${code}`
        })
      }
    })

    pythonProcess.on('error', (err) => {
      console.warn(`[AKShare] [Python] 进程错误: ${err.message}`)
      resolve({ success: false, error: err.message })
    })

    // 30秒超时
    setTimeout(() => {
      pythonProcess.kill()
      resolve({ success: false, error: 'AKShare调用超时' })
    }, 30000)
  })
}

/**
 * 获取股票财务数据
 * 使用AKShare的同花顺财务指标接口
 */
export async function getFinancialData(stockCode: string): Promise<FinancialData> {
  console.log(`[AKShare] getFinancialData called for: ${stockCode}`)
  // 移除后缀（如.SZ, .SH）
  const cleanCode = stockCode.replace(/\.(SZ|SH|BJ|US|HK)/, '')

  const script = `
import akshare as ak
import json

try:
    # 获取同花顺财务指标
    df = ak.stock_financial_benefit_ths(symbol="${cleanCode}")

    if df is not None and len(df) > 0:
        # 取最新一期数据
        latest = df.iloc[0]

        # 查找关键指标
        result = {
            'monetaryFunds': 0,  # 货币资金
            'debtRatio': 50,     # 资产负债率
            'roe': 0,           # ROE
            'grossMargin': 0,   # 毛利率
            'netProfit': 0,     # 净利润
        }

        # 在列名中查找对应指标
        for col in df.columns:
            col_lower = str(col).lower()
            val = latest[col]

            if '货币资金' in col_lower and isinstance(val, (int, float)):
                result['monetaryFunds'] = float(val)
            elif '资产负债率' in col_lower and isinstance(val, (int, float)):
                result['debtRatio'] = float(val)
            elif 'roe' in col_lower and isinstance(val, (int, float)):
                result['roe'] = float(val)
            elif '毛利率' in col_lower and isinstance(val, (int, float)):
                result['grossMargin'] = float(val)
            elif '净利润' in col_lower and isinstance(val, (int, float)):
                result['netProfit'] = float(val)

        print(json.dumps(result))
    else:
        print('{}')
except Exception as e:
    print(f"Error: {e}", file=__import__('sys').stderr)
`

  try {
    const result = await runAkShare(script, [])

    if (result.success && result.data && typeof result.data === 'object') {
      const data = result.data as Partial<FinancialData>
      return {
        monetaryFunds: data.monetaryFunds || 1_000_000_000,
        debtRatio: data.debtRatio || 50,
        roe: data.roe || 10,
        grossMargin: data.grossMargin || 20,
        netProfit: data.netProfit || 100_000_000,
        operatingCashFlow: 0,
      }
    }
  } catch (error) {
    console.warn(`[AKShare] getFinancialData(${stockCode}) failed:`, error)
  }

  // 返回默认值
  const defaults = getDefaultFinancialData()
  return {
    ...defaults,
    operatingCashFlow: 0
  }
}

/**
 * 获取个股新闻（用于并购经验统计）
 * 使用AKShare的东方财富个股新闻接口
 */
export async function getNewsData(stockCode: string, limit: number = 100): Promise<NewsData[]> {
  // 移除后缀
  const cleanCode = stockCode.replace(/\.(SZ|SH|BJ|US|HK)/, '')

  const script = `
import akshare as ak
import json

try:
    df = ak.stock_news_em(symbol="${cleanCode}")

    if df is not None and len(df) > 0:
        news_list = []
        for idx, row in df.head(${limit}).iterrows():
            news_list.append({
                'title': str(row.get('新闻标题', '')),
                'content': str(row.get('新闻内容', '')),
                'publishDate': str(row.get('发布时间', ''))
            })

        print(json.dumps(news_list, ensure_ascii=False))
    else:
        print('[]')
except Exception as e:
    print(f"Error: {e}", file=__import__('sys').stderr)
`

  try {
    const result = await runAkShare(script, [])

    if (result.success && result.data) {
      if (Array.isArray(result.data)) {
        return result.data.slice(0, limit)
      }
    }
  } catch (error) {
    console.warn(`[AKShare] getNewsData(${stockCode}) failed:`, error)
  }

  return []
}

/**
 * 统计并购相关关键词出现次数
 */
export function countMAKeywords(newsList: NewsData[]): number {
  const keywords = ['并购', '收购', '战略投资', '资产重组', '股权转让', '认购', '定增', '重大资产']
  let count = 0

  for (const news of newsList) {
    const text = `${news.title} ${news.content || ''}`
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        count++
        break // 同一新闻只计一次
      }
    }
  }

  return count
}

// 公告记录接口
export interface Announcement {
  title: string
  type: string
  date: string
  url: string
}

/**
 * 获取个股公告（按关键词筛选）
 * 使用AKShare的个股公告接口
 * @param stockCode 股票代码（如 603028.SZ）
 * @param keywords 筛选关键词数组
 * @param beginDate 开始日期 YYYYMMDD
 * @param endDate 结束日期 YYYYMMDD
 */
export async function getAnnouncements(
  stockCode: string,
  keywords: string[],
  beginDate: string = '20200101',
  endDate: string = '20260420'
): Promise<Announcement[]> {
  const cleanCode = stockCode.replace(/\.(SZ|SH|BJ|US|HK)/, '')
  const kwList = keywords.map(k => `"${k}"`).join(', ')

  const script = `
import akshare as ak
import json

try:
    all_results = []
    df = ak.stock_individual_notice_report(security="${cleanCode}", symbol="全部", begin_date="${beginDate}", end_date="${endDate}")
    if df is not None and len(df) > 0:
        for idx, row in df.iterrows():
            vals = list(row)
            # 列顺序: 0=代码, 1=公司名, 2=公告标题, 3=公告类型, 4=公告日期, 5=地址(URL)
            title = str(vals[2]) if len(vals) > 2 else ''
            ann_type = str(vals[3]) if len(vals) > 3 else ''
            date = str(vals[4]) if len(vals) > 4 else ''
            url = str(vals[5]) if len(vals) > 5 else ''
            if title:
                all_results.append({
                    'title': title,
                    'type': ann_type,
                    'date': date,
                    'url': url
                })
    print(json.dumps(all_results, ensure_ascii=False))
except Exception as e:
    print(f"Error: {e}", file=__import__('sys').stderr)
`

  try {
    const result = await runAkShare(script, [])
    if (result.success && Array.isArray(result.data)) {
      const allAnnouncements: Announcement[] = result.data
      if (keywords.length === 0) return allAnnouncements
      // 按关键词过滤
      const lowerKeywords = keywords.map(k => k.toLowerCase())
      return allAnnouncements.filter(a => {
        const text = `${a.title} ${a.type}`.toLowerCase()
        return lowerKeywords.some(kw => text.includes(kw))
      })
    }
  } catch (error) {
    console.warn(`[AKShare] getAnnouncements(${stockCode}) failed:`, error)
  }
  return []
}

// 并购相关关键词（用于公告筛选）
export const MA_KEYWORDS = ['并购', '收购', '资产重组', '定增', '股权转让', '战略投资', '重大资产', '吸收合并', '发行股份购买']

/**
 * 获取东方财富公告正文
 * 使用官方API获取结构化内容，避免JS渲染问题
 * @param url 公告URL（如 https://data.eastmoney.com/notices/detail/920837/AN202604131821159190.html）
 */
export async function fetchAnnouncementContent(url: string): Promise<string> {
  // 从URL提取公告ID
  const match = url.match(/AN\d+\.html/)
  if (!match) {
    // 尝试从URL中提取任意ID
    const idMatch = url.match(/\/([^\/]+)\.html/)
    if (!idMatch) return ''
    const noticeId = idMatch[1]
    return fetchByNoticeId(noticeId)
  }

  const noticeId = match[0].replace('.html', '')
  return fetchByNoticeId(noticeId)
}

async function fetchByNoticeId(noticeId: string): Promise<string> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const apiUrl = `https://np-cnotice-stock.eastmoney.com/api/content/ann?art_code=${noticeId}&client_source=web`
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://data.eastmoney.com/',
        'Accept': 'application/json, text/plain, */*',
      }
    })

    clearTimeout(timeout)

    if (!response.ok) return ''

    const data = await response.json() as any
    const content = data?.data?.notice_content || data?.data?.content || ''

    if (typeof content === 'string' && content.length > 50) {
      // 去除HTML标签，保留纯文本
      return content
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 5000)
    }

    return ''
  } catch (error) {
    console.warn(`[AKShare] fetchAnnouncementContent(${noticeId}) failed:`, error)
    return ''
  }
}

/**
 * 使用LLM分析个股的并购经验
 * @param companyName 公司名称
 * @param announcements 公告列表（已按关键词筛选）
 * @param contentMap 公告URL -> 公告正文 的映射
 */
export async function analyzeMAExperienceWithLLM(
  companyName: string,
  announcements: Announcement[],
  contentMap: Record<string, string>
): Promise<{ hasMA: boolean; count: number; details: string }> {
  const { isLLMConfigured, getLLMConfig, getOpenAICompatibleBaseUrl } = await import('../config/llm.js')

  if (!isLLMConfigured()) {
    const count = announcements.length
    return {
      hasMA: count > 0,
      count,
      details: count > 0 ? `通过关键词匹配到 ${count} 条相关公告` : '无相关公告记录'
    }
  }

  const config = getLLMConfig()
  const baseUrl = getOpenAICompatibleBaseUrl()

  const validAnnouncements = announcements.filter(a => contentMap[a.url]).slice(0, 10)

  if (validAnnouncements.length === 0) {
    const count = announcements.length
    return {
      hasMA: count > 0,
      count,
      details: count > 0 ? `标题匹配到 ${count} 条相关公告（无正文详情）` : '无相关公告记录'
    }
  }

  const announcementTexts = validAnnouncements.map((a, i) =>
    `[公告${i + 1}] ${a.date} ${a.type}\n标题：${a.title}\n正文摘要：${contentMap[a.url].slice(0, 500)}`
  ).join('\n\n')

  const prompt = `你是一个专业的并购顾问AI。请分析以下公司（${companyName}）的公告，判断其是否有过真实的并购/收购经历。

公告内容：
${announcementTexts}

请分析并返回以下格式的JSON（只返回JSON，不要其他内容）：
{
  "hasMAExperience": true或false,
  "MACount": 数字（该公司作为收购方完成的并购次数）,
  "summary": "简要说明该公司的并购经历，如无并购经历则说明'无并购经历'"
}

判断标准：
- 只有该公司作为收购方（买入其他公司）才算并购经历
- 仅仅是被收购、股权转让、资产出售不算
- 定增募资用于并购可以算
- 必须从公告正文中找到明确提到"收购X公司"、"并购X"等表述才算

只返回JSON。`

  const TIMEOUT_MS = 60000

  const doLLMCall = async (): Promise<string> => {
    if (config.provider === 'anthropic') {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), TIMEOUT_MS)
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0,
          max_tokens: 500,
        }),
        signal: controller.signal,
      })
      clearTimeout(t)
      if (!response.ok) throw new Error(`Anthropic错误 ${response.status}`)
      const data = await response.json()
      return data.content?.[0]?.text || ''
    } else {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), TIMEOUT_MS)
      const response = await fetch(`${baseUrl}/chat/completions`, {
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
          temperature: 0,
          max_tokens: 500,
        }),
        signal: controller.signal,
      })
      clearTimeout(t)
      if (!response.ok) throw new Error(`OpenAI错误 ${response.status}`)
      const data = await response.json()
      return data.choices?.[0]?.message?.content || ''
    }
  }

  // 重试逻辑
  let lastError: Error | null = null
  let responseText = ''
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      responseText = await doLLMCall()
      break
    } catch (err) {
      lastError = err as Error
      console.warn(`[AKShare] LLM并购分析失败(第${attempt + 1}次):`, lastError.message)
      if (attempt < 2) await new Promise(r => setTimeout(r, (attempt + 1) * 2000))
    }
  }

  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0])
    return {
      hasMA: Boolean(parsed.hasMAExperience),
      count: Number(parsed.MACount) || 0,
      details: parsed.summary || ''
    }
  }

  const count = announcements.length
  return { hasMA: count > 0, count, details: `LLM解析失败，关键词匹配 ${count} 条` }
}

/**
 * 获取主营介绍
 * 使用AKShare的同花顺主营介绍接口
 */
export async function getMainBusinessInfo(stockCode: string): Promise<{
  mainBusiness: string
  products: string[]
} | null> {
  // 移除后缀
  const cleanCode = stockCode.replace(/\.(SZ|SH|BJ|US|HK)/, '')

  const script = `
import akshare as ak
import json

try:
    df = ak.stock_zyjs_ths(symbol="${cleanCode}")

    if df is not None and len(df) > 0:
        first_row = df.iloc[0]
        result = {
            'mainBusiness': str(first_row.get('主营业务', '')),
            'products': []
        }

        # 产品名称可能在多列
        for col in df.columns:
            if '产品名称' in str(col) or '产品类型' in str(col):
                val = first_row.get(col, '')
                if val and str(val).strip():
                    result['products'].append(str(val).strip())

        print(json.dumps(result, ensure_ascii=False))
    else:
        print('null')
except Exception as e:
    print(f"Error: {e}", file=__import__('sys').stderr)
`

  try {
    const result = await runAkShare(script, [])

    if (result.success && result.data && typeof result.data === 'object') {
      return {
        mainBusiness: result.data.mainBusiness || '',
        products: Array.isArray(result.data.products) ? result.data.products : [],
      }
    }
  } catch (error) {
    console.warn(`[AKShare] getMainBusinessInfo(${stockCode}) failed:`, error)
  }

  return null
}

/**
 * 获取股票实时行情
 */
export async function getStockQuote(stockCode: string): Promise<{
  name: string
  price: number
  marketCap: number
} | null> {
  // 移除后缀
  const cleanCode = stockCode.replace(/\.(SZ|SH|BJ|US|HK)/, '')

  const script = `
import akshare as ak
import json

try:
    df = ak.stock_zh_a_spot_em()

    # 查找对应股票
    row = df[df['代码'] == "${cleanCode}"]

    if len(row) > 0:
        r = row.iloc[0]
        result = {
            'name': str(r.get('名称', '')),
            'price': float(r.get('最新价', 0)) if r.get('最新价') else 0,
            'marketCap': float(r.get('总市值', 0)) if r.get('总市值') else 0
        }
        print(json.dumps(result))
    else:
        print('null')
except Exception as e:
    print(f"Error: {e}", file=__import__('sys').stderr)
`

  try {
    const result = await runAkShare(script, [])

    if (result.success && result.data && typeof result.data === 'object') {
      return {
        name: result.data.name || '',
        price: result.data.price || 0,
        marketCap: result.data.marketCap || 0,
      }
    }
  } catch (error) {
    console.warn(`[AKShare] getStockQuote(${stockCode}) failed:`, error)
  }

  return null
}

/**
 * 批量获取财务数据（带并发控制）
 */
export async function batchGetFinancialData(
  stockCodes: string[],
  concurrency: number = 5
): Promise<Map<string, FinancialData>> {
  const results = new Map<string, FinancialData>()

  // 分批处理
  for (let i = 0; i < stockCodes.length; i += concurrency) {
    const batch = stockCodes.slice(i, i + concurrency)
    const promises = batch.map(async (code) => {
      const data = await getFinancialData(code)
      return { code, data }
    })

    const batchResults = await Promise.all(promises)
    for (const { code, data } of batchResults) {
      results.set(code, data)
    }

    console.log(`[AKShare] 财务数据批量获取: ${Math.min(i + concurrency, stockCodes.length)}/${stockCodes.length}`)
  }

  return results
}
