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

  async callServer(serverType, toolName, args) {
    const url = `${QCC_API_CONFIG.baseUrl}${QCC_API_CONFIG.servers[serverType]}`

    console.log(`[QCC API] 请求 ${serverType}: ${toolName}`)
    console.log(`[QCC API] URL: ${url}`)

    // 企查查MCP API 使用JSON-RPC 2.0格式
    const requestBody = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args
      },
      id: Date.now()
    }

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

      // 解析SSE格式响应
      const result = this.parseSSEResponse(responseText)
      console.log(`[QCC API] 解析结果:`, result)
      return result

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

          // 检查JSON-RPC错误
          if (jsonData.error) {
            error = jsonData.error.message || JSON.stringify(jsonData.error)
            continue
          }

          // 解析result.content
          if (jsonData.result && jsonData.result.content) {
            const content = jsonData.result.content
            if (Array.isArray(content) && content.length > 0) {
              // content是数组，取第一个元素的text字段
              const firstItem = content[0]
              if (firstItem.text) {
                // text是字符串化的JSON，需要二次解析
                try {
                  result = JSON.parse(firstItem.text)
                } catch {
                  result = firstItem.text
                }
              } else {
                result = firstItem
              }
            }
          } else if (jsonData.result) {
            result = jsonData.result
          }
        } catch {
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

    return result
  }

  // 获取公司工商信息
  async getCompanyInfo(companyName) {
    return this.callServer('company', 'get_company_registration_info', { searchKey: companyName })
  }

  // 获取股东信息
  async getShareholderInfo(companyName) {
    return this.callServer('company', 'get_shareholder_info', { searchKey: companyName })
  }

  // 获取主要人员信息
  async getKeyPersonnel(companyName) {
    return this.callServer('company', 'get_key_personnel', { searchKey: companyName })
  }

  // 获取实控人信息
  async getActualController(companyName) {
    return this.callServer('company', 'get_actual_controller', { searchKey: companyName })
  }

  // 获取企业年报
  async getAnnualReports(companyName) {
    return this.callServer('company', 'get_annual_reports', { searchKey: companyName })
  }

  // 获取失信信息
  async getDishonestInfo(companyName) {
    return this.callServer('risk', 'get_dishonest_info', { searchKey: companyName })
  }

  // 获取立案信息
  async getCaseFilingInfo(companyName) {
    return this.callServer('risk', 'get_case_filing_info', { searchKey: companyName })
  }

  // 获取经营异常
  async getBusinessException(companyName) {
    return this.callServer('risk', 'get_business_exception', { searchKey: companyName })
  }

  // 获取行政处罚
  async getAdministrativePenalty(companyName) {
    return this.callServer('risk', 'get_administrative_penalty', { searchKey: companyName })
  }

  // 获取专利信息
  async getPatentInfo(companyName) {
    return this.callServer('ipr', 'get_patent_info', { searchKey: companyName })
  }

  // 获取商标信息
  async getTrademarkInfo(companyName) {
    return this.callServer('ipr', 'get_trademark_info', { searchKey: companyName })
  }

  // 获取招投标信息
  async getBiddingInfo(companyName) {
    return this.callServer('operation', 'get_bidding_info', { searchKey: companyName })
  }

  // 获取资质证书
  async getQualifications(companyName) {
    return this.callServer('operation', 'get_qualifications', { searchKey: companyName })
  }

  // 获取对外投资
  async getExternalInvestments(companyName) {
    return this.callServer('company', 'get_external_investments', { searchKey: companyName })
  }

  // 获取变更记录
  async getChangeRecords(companyName) {
    return this.callServer('company', 'get_change_records', { searchKey: companyName })
  }

  // 获取裁判文书
  async getJudicialDocuments(companyName) {
    return this.callServer('risk', 'get_judicial_documents', { searchKey: companyName })
  }

  // 获取开庭公告
  async getHearingNotice(companyName) {
    return this.callServer('risk', 'get_hearing_notice', { searchKey: companyName })
  }

  // 获取软件著作权
  async getSoftwareCopyright(companyName) {
    return this.callServer('ipr', 'get_software_copyright_info', { searchKey: companyName })
  }

  // 获取信用评价
  async getCreditEvaluation(companyName) {
    return this.callServer('operation', 'get_credit_evaluation', { searchKey: companyName })
  }

  // 获取招聘信息
  async getRecruitmentInfo(companyName) {
    return this.callServer('operation', 'get_recruitment_info', { searchKey: companyName })
  }

  // 获取新闻舆情
  async getNewsSentiment(companyName) {
    return this.callServer('operation', 'get_news_sentiment', { searchKey: companyName })
  }

  // 获取行政许可
  async getAdministrativeLicense(companyName) {
    return this.callServer('operation', 'get_administrative_license', { searchKey: companyName })
  }

  // 获取被执行人信息
  async getJudgmentDebtorInfo(companyName) {
    return this.callServer('risk', 'get_judgment_debtor_info', { searchKey: companyName })
  }

  // 获取限制高消费
  async getHighConsumptionRestriction(companyName) {
    return this.callServer('risk', 'get_high_consumption_restriction', { searchKey: companyName })
  }

  // 获取股权冻结
  async getEquityFreeze(companyName) {
    return this.callServer('risk', 'get_equity_freeze', { searchKey: companyName })
  }

  // 获取税务异常
  async getTaxAbnormal(companyName) {
    return this.callServer('risk', 'get_tax_abnormal', { searchKey: companyName })
  }

  // 并行获取所有公司信息
  async getAllCompanyData(companyName) {
    const [
      companyInfo, shareholderInfo, keyPersonnel, actualController,
      dishonestInfo, caseFilingInfo, businessException, administrativePenalty,
      patentInfo, trademarkInfo, biddingInfo, qualifications,
      externalInvestments, changeRecords, judicialDocuments, softwareCopyright,
      creditEvaluation, recruitmentInfo, judgmentDebtorInfo, equityFreeze
    ] = await Promise.all([
      this.getCompanyInfo(companyName),
      this.getShareholderInfo(companyName),
      this.getKeyPersonnel(companyName),
      this.getActualController(companyName),
      this.getDishonestInfo(companyName),
      this.getCaseFilingInfo(companyName),
      this.getBusinessException(companyName),
      this.getAdministrativePenalty(companyName),
      this.getPatentInfo(companyName),
      this.getTrademarkInfo(companyName),
      this.getBiddingInfo(companyName),
      this.getQualifications(companyName),
      this.getExternalInvestments(companyName),
      this.getChangeRecords(companyName),
      this.getJudicialDocuments(companyName),
      this.getSoftwareCopyright(companyName),
      this.getCreditEvaluation(companyName),
      this.getRecruitmentInfo(companyName),
      this.getJudgmentDebtorInfo(companyName),
      this.getEquityFreeze(companyName),
    ])

    return {
      companyInfo,
      shareholderInfo,
      keyPersonnel,
      actualController,
      dishonestInfo,
      caseFilingInfo,
      businessException,
      administrativePenalty,
      patentInfo,
      trademarkInfo,
      biddingInfo,
      qualifications,
      externalInvestments,
      changeRecords,
      judicialDocuments,
      softwareCopyright,
      creditEvaluation,
      recruitmentInfo,
      judgmentDebtorInfo,
      equityFreeze,
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
