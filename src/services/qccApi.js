/**
 * 企查查 API 服务
 * 基于企查查智能体数据平台 MCP API
 */

const QCC_API_CONFIG = {
  baseUrl: 'https://agent.qcc.com/mcp',
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
    this.session = null
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    }
  }

  async callServer(serverType, query) {
    const url = `${QCC_API_CONFIG.baseUrl}${QCC_API_CONFIG.servers[serverType]}`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return { error: `API错误 ${response.status}: ${errorText}` }
      }

      // 解析 SSE 流式响应
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let result = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const jsonData = JSON.parse(line.slice(5))
              if (jsonData.event === 'error' || jsonData.error) {
                return { error: jsonData.message || jsonData.error }
              }
              if (jsonData.event === 'end') {
                return result ? JSON.parse(result) : { error: '无数据返回' }
              }
              if (jsonData.data) {
                result = typeof jsonData.data === 'string' ? jsonData.data : JSON.stringify(jsonData.data)
              }
            } catch (e) {
              // 继续处理下一行
            }
          }
        }
      }

      return result ? JSON.parse(result) : { error: '无数据返回' }
    } catch (error) {
      return { error: `请求失败: ${error.message}` }
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
