/**
 * 企查查 API 服务
 * 基于企查查智能体数据平台 API
 */

const QCC_API_CONFIG = {
  // 使用 Vite 代理路径
  baseUrl: '/qcc-api/mcp',
  servers: {
    company: '/company/stream',
    risk: '/risk/stream',
    ipr: '/ipr/stream',
    operation: '/operation/stream',
  },
}

class QccApiService {
  constructor(apiKey) {
    this.apiKey = apiKey
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream, application/json',
    }
  }

  async callServer(serverType, query) {
    const url = `${QCC_API_CONFIG.baseUrl}${QCC_API_CONFIG.servers[serverType]}`

    console.log(`[QCC API] 请求 ${serverType}: ${query}`)
    console.log(`[QCC API] URL: ${url}`)

    // 企查查MCP API 使用简单对象格式
    const requestBody = { query: query }

    console.log(`[QCC API] 请求体:`, JSON.stringify(requestBody))

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
      })

      console.log(`[QCC API] 响应状态: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.log(`[QCC API] 错误响应: ${errorText}`)

        // 检查是否是 CORS 错误
        if (response.type === 'opaque' || response.status === 0) {
          return { error: 'CORS错误: API不支持跨域请求，请通过后端代理访问' }
        }

        return { error: `API错误 ${response.status}: ${errorText}` }
      }

      // 获取响应文本
      const responseText = await response.text()
      console.log(`[QCC API] 原始响应长度: ${responseText.length}`)
      console.log(`[QCC API] 原始响应: ${responseText.substring(0, 500)}...`)

      // 尝试解析为 JSON
      try {
        const jsonData = JSON.parse(responseText)
        console.log(`[QCC API] 解析成功:`, jsonData)
        return jsonData
      } catch (parseError) {
        // 如果不是 JSON，尝试解析 SSE 格式
        console.log(`[QCC API] 尝试解析 SSE 格式...`)
        return this.parseSSEResponse(responseText)
      }

    } catch (error) {
      console.error(`[QCC API] 请求异常:`, error)

      // 检测 CORS 错误
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        return { error: 'CORS错误或网络问题: API不支持跨域请求，需要后端代理' }
      }

      return { error: `请求失败: ${error.message}` }
    }
  }

  parseSSEResponse(text) {
    const lines = text.split('\n')
    let result = ''
    let error = null

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue

      if (trimmedLine.startsWith('data:')) {
        const dataStr = trimmedLine.slice(5).trim()
        try {
          const jsonData = JSON.parse(dataStr)

          if (jsonData.event === 'error' || jsonData.error) {
            error = jsonData.message || jsonData.error
            continue
          }

          if (jsonData.event === 'end') {
            break
          }

          if (jsonData.data) {
            if (typeof jsonData.data === 'string') {
              result = jsonData.data
            } else {
              result = JSON.stringify(jsonData.data)
            }
          } else {
            // 直接返回数据对象
            result = dataStr
          }
        } catch (e) {
          // 如果解析失败，保存原始数据
          if (!result) {
            result = dataStr
          }
        }
      }
    }

    if (error) {
      return { error }
    }

    if (!result) {
      return { error: '无数据返回' }
    }

    // 尝试解析结果为 JSON
    try {
      return JSON.parse(result)
    } catch (e) {
      return { data: result }
    }
  }

  // 获取公司基本信息
  async getCompanyInfo(companyName) {
    return this.callServer('company', companyName)
  }

  // 获取风险信息
  async getRiskInfo(companyName) {
    return this.callServer('risk', companyName)
  }

  // 获取知识产权信息
  async getIPRInfo(companyName) {
    return this.callServer('ipr', companyName)
  }

  // 获取经营信息
  async getOperationInfo(companyName) {
    return this.callServer('operation', companyName)
  }

  // 并行获取所有信息
  async getAllCompanyData(companyName) {
    const [companyInfo, riskInfo, iprInfo, operationInfo] = await Promise.all([
      this.getCompanyInfo(companyName),
      this.getRiskInfo(companyName),
      this.getIPRInfo(companyName),
      this.getOperationInfo(companyName),
    ])

    return {
      companyInfo,
      riskInfo,
      iprInfo,
      operationInfo,
    }
  }
}

// 导出单例
let qccApiInstance = null

export function getQccApi(apiKey) {
  if (!qccApiInstance && apiKey) {
    qccApiInstance = new QccApiService(apiKey)
  }
  return qccApiInstance
}

export function setQccApiKey(apiKey) {
  qccApiInstance = new QccApiService(apiKey)
}

export default QccApiService
