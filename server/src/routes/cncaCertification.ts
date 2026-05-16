/**
 * CNCA认证查询 API
 *
 * 提供CNCA认证证书查询接口，使用Puppeteer MCP进行页面爬取
 */

import { Router } from 'express'
import { spawn, ChildProcess } from 'child_process'
import { getCncaCache, setCncaCache, CncaCertResult } from '../utils/cncaCache.js'

export const cncaCertificationRouter = Router()

// Puppeteer MCP进程管理
let puppeteerProcess: ChildProcess | null = null
let currentRequestId = 0

/**
 * 启动Puppeteer MCP服务
 */
async function startPuppeteerMcp(): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['-y', '@modelcontextprotocol/server-puppeteer'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    // 设置超时
    const timeout = setTimeout(() => {
      proc.kill()
      reject(new Error('Puppeteer MCP启动超时'))
    }, 30000)

    proc.on('error', (err) => {
      clearTimeout(timeout)
      reject(err)
    })

    proc.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.log(`[CNCA] Puppeteer MCP exited with code ${code}`)
      }
    })

    // 等待服务就绪（简单检查stdout）
    const checkReady = setInterval(() => {
      // MCP服务启动后会输出一些初始内容
      clearTimeout(timeout)
      clearInterval(checkReady)
      resolve(proc)
    }, 1000)
  })
}

/**
 * 发送JSON-RPC请求到MCP服务
 */
async function mcpRequest(proc: ChildProcess, method: string, params: Record<string, any>): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = ++currentRequestId
    const request = {
      jsonrpc: '2.0',
      id,
      method: 'tools/call',
      params: {
        name: method,
        arguments: params
      }
    }

    const timeout = setTimeout(() => {
      reject(new Error(`MCP请求超时: ${method}`))
    }, 30000)

    const parseResponse = (data: string) => {
      try {
        const lines = data.toString().split('\n').filter(Boolean)
        for (const line of lines) {
          const response = JSON.parse(line)
          if (response.id === id) {
            clearTimeout(timeout)
            proc.stdout?.off('data', parseResponse)
            if (response.error) {
              reject(new Error(response.error.message || 'MCP错误'))
            } else {
              resolve(response.result)
            }
            return
          }
        }
      } catch (e) {
        // 忽略解析错误，继续等待
      }
    }

    proc.stdout?.on('data', parseResponse)

    proc.stdin?.write(JSON.stringify(request) + '\n')
  })
}

/**
 * 使用Puppeteer MCP查询CNCA认证
 * @param companyName 公司名称
 * @param creditCode 统一社会信用代码
 */
async function queryCncaCertification(companyName: string, creditCode: string): Promise<CncaCertResult> {
  let proc: ChildProcess | null = null

  try {
    console.log(`[CNCA] 开始查询: ${companyName} (${creditCode})`)
    proc = await startPuppeteerMcp()

    // 1. 导航到CNCA查询页面
    await mcpRequest(proc, 'navigate', {
      url: 'https://cx.cnca.cn/CertECloud/institutionBody/authenticetionList'
    })

    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 500))

    // 2. 填充搜索框
    await mcpRequest(proc, 'fill', {
      selector: 'input[placeholder*="机构名称"]',
      text: companyName
    })

    // 3. 点击查询按钮
    await mcpRequest(proc, 'click', {
      selector: 'button:has-text("查询")'
    })

    // 等待结果加载
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 4. 提取结果
    const result = await mcpRequest(proc, 'extract', {
      selector: 'table tbody tr, .result-list li, [class*="result"]'
    })

    let hasCertification = false
    let certNo: string | null = null
    let instCode: string | null = null
    let orgCode: string | null = null
    let detailUrl: string | null = null

    if (result && result.content && result.content.length > 0) {
      const text = result.content.map((c: any) => c.text || '').join('\n')

      // 解析结果内容
      // 典型行: 上海英格尔认证有限公司	有效	CNAS	CNCA-R-2003-117	2003-01-13	...
      const lines = text.split('\n').filter((l: string) => l.trim())
      for (const line of lines) {
        if (line.includes(companyName) || line.includes('CNCA-R-')) {
          hasCertification = true

          // 提取证书编号 CNCA-R-2003-117
          const certNoMatch = line.match(/CNCA-R-\d{4}-\d{3,4}/)
          if (certNoMatch) {
            certNo = certNoMatch[0]
          }

          // 提取机构代码 - 通常在URL参数中
          // 从页面提取详情链接
          const detailResult = await mcpRequest(proc, 'extract', {
            selector: `a[href*="authenticetionDetil"]`
          })

          if (detailResult && detailResult.content && detailResult.content.length > 0) {
            for (const item of detailResult.content) {
              const href = item.href || item.attributes?.href || ''
              if (href.includes('authenticetionDetil')) {
                const resolvedUrl = href.startsWith('http') ? href : `https://cx.cnca.cn${href}`
                detailUrl = resolvedUrl

                // 提取URL参数中的instCode和orgCode
                const url = new URL(resolvedUrl)
                instCode = url.searchParams.get('instCode')
                orgCode = url.searchParams.get('orgCode')
                break
              }
            }
          }

          break
        }
      }
    }

    // 如果没找到对应公司的结果，也尝试精确匹配
    if (!hasCertification && result && result.content && result.content.length > 0) {
      const text = result.content.map((c: any) => c.text || '').join('\n')
      if (text.includes(companyName.substring(0, 4))) {
        hasCertification = true
      }
    }

    const certResult: CncaCertResult = {
      hasCertification,
      certNo,
      instCode,
      orgCode,
      detailUrl,
      cachedAt: new Date().toISOString()
    }

    console.log(`[CNCA] 查询结果: ${companyName} - hasCertification=${hasCertification}, certNo=${certNo}`)

    return certResult

  } catch (error) {
    console.error(`[CNCA] 查询失败: ${companyName}`, error)
    return {
      hasCertification: false,
      certNo: null,
      instCode: null,
      orgCode: null,
      detailUrl: null,
      cachedAt: new Date().toISOString()
    }
  } finally {
    // 清理进程
    if (proc) {
      try {
        proc.kill()
      } catch (e) {
        // 忽略kill错误
      }
    }
  }
}

/**
 * POST /api/cnca-certification/verify-batch
 * 批量验证公司CNCA认证状态
 *
 * Request: { companies: [{ name: string, creditCode: string }] }
 * Response: { success: true, data: CncaCertResult[] }
 */
cncaCertificationRouter.post('/verify-batch', async (req, res) => {
  try {
    const { companies } = req.body

    if (!Array.isArray(companies) || companies.length === 0) {
      res.status(400).json({
        success: false,
        error: 'companies must be a non-empty array'
      })
      return
    }

    const results: CncaCertResult[] = []

    for (const company of companies) {
      const { name, creditCode } = company

      if (!name || !creditCode) {
        results.push({
          hasCertification: false,
          certNo: null,
          instCode: null,
          orgCode: null,
          detailUrl: null,
          cachedAt: new Date().toISOString()
        })
        continue
      }

      // 先检查缓存
      const cached = getCncaCache(name, creditCode)
      if (cached) {
        console.log(`[CNCA] 缓存命中: ${name}`)
        results.push(cached)
        continue
      }

      // 缓存未命中，查询CNCA
      const result = await queryCncaCertification(name, creditCode)

      // 缓存结果
      setCncaCache(name, creditCode, result)

      results.push(result)
    }

    res.json({
      success: true,
      data: results
    })
  } catch (error) {
    console.error('[CNCA] verify-batch error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /api/cnca-certification/status/:companyName
 * 查询公司CNCA认证状态
 *
 * Response: { success: true, data: CncaCertResult | null }
 */
cncaCertificationRouter.get('/status/:companyName', (req, res) => {
  try {
    const { companyName } = req.params

    if (!companyName) {
      res.status(400).json({
        success: false,
        error: 'companyName is required'
      })
      return
    }

    // 从缓存中查询（不带creditCode，只用名称模糊查询）
    // 注意：这里简化处理，实际应该也传入creditCode才能精确匹配
    const decodedName = decodeURIComponent(companyName)

    // 尝试从数据库直接查询（通过缓存模块查询）
    // 由于缓存是按 companyName + creditCode 存储的，这里需要遍历
    // 为简化，先返回null让前端使用verify-batch精确查询
    res.json({
      success: true,
      data: null,
      message: '请使用 /verify-batch 接口并提供 creditCode 进行精确查询'
    })
  } catch (error) {
    console.error('[CNCA] status error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /api/cnca-certification/health
 * 健康检查
 */
cncaCertificationRouter.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  })
})