type QccServerType = 'company' | 'risk' | 'ipr' | 'operation'

type QccResult = Record<string, any> | string | number | boolean | null | { error: string }

interface CompanyIntelligenceData {
  companyInfo: QccResult
  shareholderInfo: QccResult
  keyPersonnel: QccResult
  actualController: QccResult
  dishonestInfo: QccResult
  caseFilingInfo: QccResult
  businessException: QccResult
  administrativePenalty: QccResult
  patentInfo: QccResult
  trademarkInfo: QccResult
  biddingInfo: QccResult
  qualifications: QccResult
  externalInvestments: QccResult
  changeRecords: QccResult
  judicialDocuments: QccResult
  softwareCopyright: QccResult
  creditEvaluation: QccResult
  recruitmentInfo: QccResult
  judgmentDebtorInfo: QccResult
  equityFreeze: QccResult
}

interface CompanyIntelligenceResponse {
  success: boolean
  partial: boolean
  data?: CompanyIntelligenceData
  error?: string
  meta?: {
    successCount: number
    totalCount: number
  }
}

const QCC_API_CONFIG = {
  baseUrl: process.env.QCC_API_BASE_URL || 'https://agent.qcc.com/mcp',
  servers: {
    company: '/company/stream',
    risk: '/risk/stream',
    ipr: '/ipr/stream',
    operation: '/operation/stream',
  } satisfies Record<QccServerType, string>,
}

class QccApiService {
  constructor(private readonly apiKey: string) {}

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream, application/json',
    }
  }

  private async callServer(serverType: QccServerType, toolName: string, args: Record<string, unknown>): Promise<QccResult> {
    const url = `${QCC_API_CONFIG.baseUrl}${QCC_API_CONFIG.servers[serverType]}`
    const requestBody = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
      id: Date.now(),
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return { error: `QCC API错误 ${response.status}: ${errorText || 'empty response'}` }
      }

      const responseText = await response.text()
      return this.parseSseResponse(responseText)
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'QCC API request failed',
      }
    }
  }

  private parseSseResponse(text: string): QccResult {
    const lines = text.split('\n')
    let result: QccResult | null = null
    let error: string | null = null

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine || !trimmedLine.startsWith('data:')) {
        continue
      }

      const dataStr = trimmedLine.slice(5).trim()

      try {
        const jsonData = JSON.parse(dataStr)

        if (jsonData.error) {
          error = jsonData.error.message || JSON.stringify(jsonData.error)
          continue
        }

        if (jsonData.result?.content) {
          const content = jsonData.result.content
          if (Array.isArray(content) && content.length > 0) {
            const firstItem = content[0]
            if (firstItem?.text) {
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
        if (!result) {
          result = dataStr
        }
      }
    }

    if (error) {
      return { error }
    }

    if (!result) {
      return { error: 'QCC API无数据返回' }
    }

    return result
  }

  private getCompanyInfo(companyName: string) {
    return this.callServer('company', 'get_company_registration_info', { searchKey: companyName })
  }

  private getShareholderInfo(companyName: string) {
    return this.callServer('company', 'get_shareholder_info', { searchKey: companyName })
  }

  private getKeyPersonnel(companyName: string) {
    return this.callServer('company', 'get_key_personnel', { searchKey: companyName })
  }

  private getActualController(companyName: string) {
    return this.callServer('company', 'get_actual_controller', { searchKey: companyName })
  }

  private getDishonestInfo(companyName: string) {
    return this.callServer('risk', 'get_dishonest_info', { searchKey: companyName })
  }

  private getCaseFilingInfo(companyName: string) {
    return this.callServer('risk', 'get_case_filing_info', { searchKey: companyName })
  }

  private getBusinessException(companyName: string) {
    return this.callServer('risk', 'get_business_exception', { searchKey: companyName })
  }

  private getAdministrativePenalty(companyName: string) {
    return this.callServer('risk', 'get_administrative_penalty', { searchKey: companyName })
  }

  private getPatentInfo(companyName: string) {
    return this.callServer('ipr', 'get_patent_info', { searchKey: companyName })
  }

  private getTrademarkInfo(companyName: string) {
    return this.callServer('ipr', 'get_trademark_info', { searchKey: companyName })
  }

  private getBiddingInfo(companyName: string) {
    return this.callServer('operation', 'get_bidding_info', { searchKey: companyName })
  }

  private getQualifications(companyName: string) {
    return this.callServer('operation', 'get_qualifications', { searchKey: companyName })
  }

  private getExternalInvestments(companyName: string) {
    return this.callServer('company', 'get_external_investments', { searchKey: companyName })
  }

  private getChangeRecords(companyName: string) {
    return this.callServer('company', 'get_change_records', { searchKey: companyName })
  }

  private getJudicialDocuments(companyName: string) {
    return this.callServer('risk', 'get_judicial_documents', { searchKey: companyName })
  }

  private getSoftwareCopyright(companyName: string) {
    return this.callServer('ipr', 'get_software_copyright_info', { searchKey: companyName })
  }

  private getCreditEvaluation(companyName: string) {
    return this.callServer('operation', 'get_credit_evaluation', { searchKey: companyName })
  }

  private getRecruitmentInfo(companyName: string) {
    return this.callServer('operation', 'get_recruitment_info', { searchKey: companyName })
  }

  private getJudgmentDebtorInfo(companyName: string) {
    return this.callServer('risk', 'get_judgment_debtor_info', { searchKey: companyName })
  }

  private getEquityFreeze(companyName: string) {
    return this.callServer('risk', 'get_equity_freeze', { searchKey: companyName })
  }

  async getAllCompanyData(companyName: string): Promise<CompanyIntelligenceData> {
    const [
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

function hasUsableData(result: QccResult) {
  if (result === null || result === undefined) {
    return false
  }

  if (typeof result === 'object') {
    return !('error' in result) && !('无匹配项' in result)
  }

  return true
}

function getResultIssueMessage(result: QccResult) {
  if (!result || typeof result !== 'object') {
    return null
  }

  if ('error' in result && typeof result.error === 'string') {
    return result.error
  }

  if ('无匹配项' in result && typeof result['无匹配项'] === 'string') {
    return result['无匹配项']
  }

  return null
}

export function isQccConfigured() {
  return Boolean(process.env.QCC_API_KEY)
}

export async function getCompanyIntelligence(companyName: string): Promise<CompanyIntelligenceResponse> {
  if (!process.env.QCC_API_KEY) {
    return {
      success: false,
      partial: false,
      error: 'QCC_API_KEY is not configured',
    }
  }

  const service = new QccApiService(process.env.QCC_API_KEY)
  const data = await service.getAllCompanyData(companyName)
  const values = Object.values(data)
  const successCount = values.filter(hasUsableData).length
  const totalCount = values.length
  const firstIssueMessage = values.map(getResultIssueMessage).find(Boolean)

  if (successCount === 0) {
    return {
      success: false,
      partial: false,
      data,
      error: firstIssueMessage ? `企查查服务请求全部失败：${firstIssueMessage}` : '企查查服务请求全部失败',
      meta: { successCount, totalCount },
    }
  }

  const partial = successCount < totalCount

  return {
    success: true,
    partial,
    data,
    error: partial
      ? firstIssueMessage
        ? `部分企查查数据获取失败，仅成功 ${successCount}/${totalCount} 项：${firstIssueMessage}`
        : `部分企查查数据获取失败，仅成功 ${successCount}/${totalCount} 项`
      : undefined,
    meta: { successCount, totalCount },
  }
}
