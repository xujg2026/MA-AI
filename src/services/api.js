/**
 * 后端 Server API 服务
 * 对接 server/src/routes/ 中的所有接口
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

class ApiService {
  constructor() {
    this.baseUrl = API_BASE
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
    }
  }

  async request(method, path, body = null, params = null) {
    let url = `${this.baseUrl}${path}`

    // GET 请求追加 query 参数
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value)
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    const options = {
      method,
      headers: this.getHeaders(),
    }

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url, options)
      const data = await response.json()
      return data
    } catch (error) {
      console.error(`[API] 请求失败 [${method}] ${url}:`, error)
      return {
        success: false,
        error: error.message || '网络请求失败',
      }
    }
  }

  get(path, params) {
    return this.request('GET', path, null, params)
  }

  post(path, body) {
    return this.request('POST', path, body)
  }

  // ========== 买家画像 ==========

  /**
   * 获取买家综合画像
   * GET /api/buyer/profile?companyName=xxx&stockCode=xxx
   */
  getBuyerProfile(companyName, stockCode) {
    return this.get('/buyer/profile', { companyName, stockCode })
  }

  // ========== 买家筛选 ==========

  /**
   * 筛选潜在买家
   * POST /api/buyer/screen
   */
  screenBuyers(params) {
    const { companyName, industry, region, valuation, mainCerts, limit } = params
    return this.post('/buyer/screen', {
      companyName,
      industry,
      region,
      valuation,
      mainCerts: mainCerts || [],
      limit: limit || 20,
    })
  }

  /**
   * AI 智能筛选买家（通过 mx-skills）
   * POST /api/buyer/screening-agent
   */
  getScreeningAgent(params) {
    const {
      targetCompany,
      limit,
      forceRefresh,
    } = params
    return this.post('/buyer/screening-agent', {
      targetCompany,
      limit: limit || 10,
      forceRefresh: forceRefresh || false,
    })
  }

  // ========== 财务数据 ==========

  /**
   * 查询财务数据
   * POST /api/financial/query
   */
  queryFinancialData(query) {
    return this.post('/financial/query', { query })
  }

  /**
   * 获取公司财务概览
   * GET /api/financial/overview?company=xxx
   */
  getFinancialOverview(company) {
    return this.get('/financial/overview', { company })
  }

  // ========== 财务搜索 ==========

  /**
   * 搜索财经新闻/信息
   * POST /api/search/news
   */
  searchFinancialNews(query) {
    return this.post('/search/news', { query })
  }

  /**
   * 搜索公司并购相关新闻
   * GET /api/search/ma?company=xxx
   */
  searchMANews(company) {
    return this.get('/search/ma', { company })
  }

  // ========== 股票诊断 ==========

  /**
   * 诊断单只股票
   * POST /api/diagnosis/stock
   */
  diagnoseStock(query) {
    return this.post('/diagnosis/stock', { query })
  }

  /**
   * 批量诊断股票
   * POST /api/diagnosis/batch
   */
  batchDiagnose(queries) {
    return this.post('/diagnosis/batch', { queries })
  }

  // ========== QCC ==========

  /**
   * 获取企业综合情报数据
   * POST /api/qcc/company-intelligence
   */
  getQccCompanyIntelligence(companyName) {
    return this.post('/qcc/company-intelligence', { companyName })
  }

  // ========== 协议管理 ==========

  /**
   * 获取协议列表
   * GET /api/protocol/list
   */
  getProtocolList(params) {
    const { transactionId, companyName } = params || {}
    return this.get('/protocol/list', { transactionId, companyName })
  }

  /**
   * 上传协议
   * POST /api/protocol/upload
   */
  uploadProtocol(formData) {
    return this.post('/protocol/upload', formData)
  }

  /**
   * 签署协议
   * POST /api/protocol/sign
   */
  signProtocol(protocolId, signerInfo) {
    return this.post('/protocol/sign', { protocolId, signerInfo })
  }

  /**
   * 删除协议
   * DELETE /api/protocol/:id
   */
  deleteProtocol(protocolId) {
    return this.request('DELETE', `/protocol/${protocolId}`)
  }

  // ========== 项目管理 ==========

  /**
   * 创建项目
   * POST /api/projects
   */
  createProject(projectData) {
    return this.post('/projects', projectData)
  }

  /**
   * 获取项目列表
   * GET /api/projects
   */
  getProjects(params) {
    return this.get('/projects', params)
  }

  /**
   * 获取项目详情
   * GET /api/projects/:id
   */
  getProject(id) {
    return this.get(`/projects/${id}`)
  }

  /**
   * 更新项目
   * PUT /api/projects/:id
   */
  updateProject(id, projectData) {
    return this.request('PUT', `/projects/${id}`, projectData)
  }

  /**
   * 删除项目
   * DELETE /api/projects/:id
   */
  deleteProject(id) {
    return this.request('DELETE', `/projects/${id}`)
  }

  // ========== 项目阶段 ==========

  /**
   * 保存项目阶段数据
   * POST /api/projects/:id/phases
   * @param {string} projectId - 项目ID
   * @param {string} phase - 阶段标识: protocol, due-diligence, valuation, match, report
   * @param {object} outputData - 阶段产出数据
   */
  saveProjectPhase(projectId, phase, outputData) {
    return this.post(`/projects/${projectId}/phases`, {
      phase,
      output_data: outputData,
    })
  }

  /**
   * 获取项目阶段数据
   * GET /api/projects/:id/phases
   */
  getProjectPhases(projectId) {
    return this.get(`/projects/${projectId}/phases`)
  }

  /**
   * 归集觅售结果到项目
   * POST /api/projects/:id/finder-result
   */
  saveFinderResult(projectId, finderResult) {
    return this.post(`/projects/${projectId}/finder-result`, finderResult)
  }

  // ========== Excel 导入 ==========

  /**
   * 同步导入数据到服务器
   * POST /api/imports/sync
   * @param {Array} records - 要同步的记录数组
   */
  syncImportRecords(records) {
    return this.post('/imports/sync', { records })
  }

  /**
   * 获取导入的项目列表
   * GET /api/imports/excel-projects
   */
  getExcelProjects() {
    return this.get('/imports/excel-projects')
  }
}

// 导出单例
let apiInstance = null

export function getApi() {
  if (!apiInstance) {
    apiInstance = new ApiService()
  }
  return apiInstance
}

export default ApiService
