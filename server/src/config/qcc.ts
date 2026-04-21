/**
 * 企查查API配置
 */

export interface QccConfig {
  apiKey: string
  baseUrl: string
  timeout: number
  retryCount: number
}

export const QCC_CONFIG: QccConfig = {
  apiKey: process.env.QCC_API_KEY || '',
  baseUrl: process.env.QCC_API_BASE_URL || 'https://agent.qcc.com/mcp',
  timeout: parseInt(process.env.QCC_TIMEOUT || '30000', 10),
  retryCount: parseInt(process.env.QCC_RETRY_COUNT || '3', 10),
}

// 企查查工具名称映射
export const QCC_TOOLS = {
  // 企业信息
  getCompanyRegistrationInfo: {
    server: 'company',
    tool: 'get_company_registration_info',
    description: '获取企业工商信息',
  },
  getShareholderInfo: {
    server: 'company',
    tool: 'get_shareholder_info',
    description: '获取股东信息',
  },
  getKeyPersonnel: {
    server: 'company',
    tool: 'get_key_personnel',
    description: '获取关键人员',
  },
  getActualController: {
    server: 'company',
    tool: 'get_actual_controller',
    description: '获取实际控制人',
  },
  getExternalInvestments: {
    server: 'company',
    tool: 'get_external_investments',
    description: '获取对外投资',
  },
  getChangeRecords: {
    server: 'company',
    tool: 'get_change_records',
    description: '获取变更记录',
  },

  // 风险信息
  getDishonestInfo: {
    server: 'risk',
    tool: 'get_dishonest_info',
    description: '获取失信信息',
  },
  getBusinessException: {
    server: 'risk',
    tool: 'get_business_exception',
    description: '获取经营异常',
  },
  getAdministrativePenalty: {
    server: 'risk',
    tool: 'get_administrative_penalty',
    description: '获取行政处罚',
  },
  getCaseFilingInfo: {
    server: 'risk',
    tool: 'get_case_filing_info',
    description: '获取立案信息',
  },
  getJudgmentDebtorInfo: {
    server: 'risk',
    tool: 'get_judgment_debtor_info',
    description: '获取司法信息',
  },
  getEquityFreeze: {
    server: 'risk',
    tool: 'get_equity_freeze',
    description: '获取股权冻结',
  },

  // 知识产权
  getPatentInfo: {
    server: 'ipr',
    tool: 'get_patent_info',
    description: '获取专利信息',
  },
  getTrademarkInfo: {
    server: 'ipr',
    tool: 'get_trademark_info',
    description: '获取商标信息',
  },
  getSoftwareCopyright: {
    server: 'ipr',
    tool: 'get_software_copyright_info',
    description: '获取软件著作权',
  },

  // 经营信息
  getBiddingInfo: {
    server: 'operation',
    tool: 'get_bidding_info',
    description: '获取招投标信息',
  },
  getQualifications: {
    server: 'operation',
    tool: 'get_qualifications',
    description: '获取资质信息',
  },
  getCreditEvaluation: {
    server: 'operation',
    tool: 'get_credit_evaluation',
    description: '获取信用评价',
  },
  getRecruitmentInfo: {
    server: 'operation',
    tool: 'get_recruitment_info',
    description: '获取招聘信息',
  },
}

// 判断企查查API是否已配置
export function isQccConfigured(): boolean {
  return Boolean(QCC_CONFIG.apiKey)
}

// 获取企查查配置
export function getQccConfig(): QccConfig {
  return QCC_CONFIG
}
