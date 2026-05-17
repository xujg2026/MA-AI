/**
 * TIC 企业查询 API
 *
 * 提供 TIC 企业数据的查询接口
 */

import { Router } from 'express'
import { queryTicCompanies, getTicCompanyById, getTicCompanyCount, getDb, TicCompanyFilters } from '../utils/ticCompanyDb.js'

export const ticCompaniesRouter = Router()

/**
 * GET /api/tic-companies
 * 查询 TIC 企业列表（支持分页和筛选）
 *
 * Query params:
 * - keyword: 企业名称关键字搜索
 * - industry: 行业门类筛选
 * - province: 省份筛选
 * - city: 城市筛选
 * - county: 区县筛选
 * - companyType: 企业类型筛选
 * - employeeCountMin: 最小参保人数
 * - employeeCountMax: 最大参保人数
 * - hasPhone: 联系电话筛选（有/无）
 * - hasWebsite: 网址筛选（有/无）
 * - businessScope: 经营范围模糊搜索
 * - page: 页码，默认1
 * - pageSize: 每页条数，默认20
 */
ticCompaniesRouter.get('/', (req, res) => {
  try {
    const {
      keyword,
      industry,
      province,
      city,
      county,
      companyType,
      employeeCountMin,
      employeeCountMax,
      registeredCapitalMin,
      hasPhone,
      hasWebsite,
      businessScope,
      page,
      pageSize,
    } = req.query

    // 解析分页参数
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1)
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize as string, 10) || 20))

    // 构建筛选条件
    const filters: TicCompanyFilters = {}
    if (keyword) filters.keyword = keyword as string
    if (industry) filters.industry = industry as string
    if (province) filters.province = province as string
    if (city) filters.city = city as string
    if (county) filters.county = county as string
    if (companyType) filters.companyType = companyType as string
    if (employeeCountMin) filters.employeeCountMin = parseInt(employeeCountMin as string, 10)
    if (employeeCountMax) filters.employeeCountMax = parseInt(employeeCountMax as string, 10)
    if (registeredCapitalMin) filters.registeredCapitalMin = parseInt(registeredCapitalMin as string, 10)
    if (hasPhone) filters.hasPhone = hasPhone as string
    if (hasWebsite) filters.hasWebsite = hasWebsite as string
    if (businessScope) filters.businessScope = businessScope as string

    // 执行查询
    const result = queryTicCompanies(filters, pageNum, pageSizeNum)

    res.json({
      success: true,
      data: {
        list: result.list,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      }
    })
  } catch (error) {
    console.error('[TicCompanies] query error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /api/tic-companies/count
 * 获取 TIC 企业总数
 */
ticCompaniesRouter.get('/count', (req, res) => {
  try {
    const count = getTicCompanyCount()
    res.json({
      success: true,
      data: { count }
    })
  } catch (error) {
    console.error('[TicCompanies] count error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /api/tic-companies/provinces
 * 获取所有省份列表
 */
ticCompaniesRouter.get('/provinces', (req, res) => {
  try {
    const db = getDb()
    const provinces = db.prepare(`
      SELECT DISTINCT province FROM tic_companies
      WHERE province IS NOT NULL AND province != ''
      ORDER BY province
    `).all()
    res.json({
      success: true,
      data: provinces.map((p: any) => p.province)
    })
  } catch (error) {
    console.error('[TicCompanies] provinces error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /api/tic-companies/cities
 * 获取指定省份下的城市列表
 * Query: province
 */
ticCompaniesRouter.get('/cities', (req, res) => {
  try {
    const { province } = req.query
    if (!province) {
      res.status(400).json({ success: false, error: 'province is required' })
      return
    }
    const db = getDb()
    const cities = db.prepare(`
      SELECT DISTINCT city FROM tic_companies
      WHERE province = ? AND city IS NOT NULL AND city != ''
      ORDER BY city
    `).all(province)
    res.json({
      success: true,
      data: cities.map((c: any) => c.city)
    })
  } catch (error) {
    console.error('[TicCompanies] cities error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /api/tic-companies/counties
 * 获取指定省份和城市下的区县列表
 * Query: province, city
 */
ticCompaniesRouter.get('/counties', (req, res) => {
  try {
    const { province, city } = req.query
    if (!province || !city) {
      res.status(400).json({ success: false, error: 'province and city are required' })
      return
    }
    const db = getDb()
    const counties = db.prepare(`
      SELECT DISTINCT county FROM tic_companies
      WHERE province = ? AND city = ? AND county IS NOT NULL AND county != ''
      ORDER BY county
    `).all(province, city)
    res.json({
      success: true,
      data: counties.map((c: any) => c.county)
    })
  } catch (error) {
    console.error('[TicCompanies] counties error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /api/tic-companies/:id
 * 获取单个 TIC 企业详情
 */
ticCompaniesRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const idNum = parseInt(id, 10)

    if (isNaN(idNum)) {
      res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      })
      return
    }

    const company = getTicCompanyById(idNum)

    if (!company) {
      res.status(404).json({
        success: false,
        error: 'Company not found'
      })
      return
    }

    res.json({
      success: true,
      data: company
    })
  } catch (error) {
    console.error('[TicCompanies] getById error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})