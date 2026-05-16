import { useState, useEffect } from 'react'
import { Search, Building2, Key, Users, TrendingUp, FileText, Sparkles, Filter, ArrowRight, Shield, Award, MapPin, CheckCircle, FolderPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, Button, Input, Badge } from '../components/ui'
import ProjectSelector from '../components/projects/ProjectSelector'
import { getApi } from '../services/api'

const companyTypes = ['民营企业', '国有企业', '外资企业', '合资企业', '上市公司', '非上市公司']

const socialSecurityOptions = ['50人以下', '50-100人', '100-500人', '500-1000人', '1000人以上']

const changeRecordOptions = ['无变更', '法定代表人变更', '股权变更', '经营范围变更', '注册资本变更', '注册地址变更', '其他变更']

// TIC行业检测领域
const testingAreas = [
  '食品检测', '环境检测', '消费品检测', '工业品检测', '医疗器械检测',
  '建筑工程检测', '材料检测', '电子产品检测', '汽车检测', '新能源检测',
  '计量校准', '特种设备检测', '其他'
]

// TIC行业客户分布
const customerIndustries = [
  '制造业', '政府监管', '零售消费', '食品饮料', '医药健康',
  '建筑工程', '环保能源', '交通运输', '电子电器', '其他'
]

const mockDeals = [
  {
    id: 1,
    title: '人工智能软件开发公司出售',
    company: '北京智云科技有限公司',
    amount: '¥15亿',
    industry: '科技',
    region: '华北地区',
    matchScore: 92,
  },
  {
    id: 2,
    title: '创新药研发企业股权转让',
    company: '上海生物医药有限公司',
    amount: '¥28亿',
    industry: '医疗健康',
    region: '华东地区',
    matchScore: 85,
  },
  {
    id: 3,
    title: '高端制造企业寻求战略投资',
    company: '深圳精密制造集团',
    amount: '¥8亿',
    industry: '制造业',
    region: '华南地区',
    matchScore: 78,
  },
  {
    id: 4,
    title: 'TIC检测认证机构出售',
    company: '广州中检质量技术服务有限公司',
    amount: '¥5亿',
    industry: 'TIC检测认证',
    region: '华南地区',
    matchScore: 95,
    hasCMA: true,
    hasCNAS: true,
    certCount: 120,
    labArea: '5000',
    testingScope: '食品检测、环境检测',
  },
  {
    id: 5,
    title: '教育培训集团股权转让',
    company: '成都启明星教育科技有限公司',
    amount: '¥3.5亿',
    industry: '教育培训',
    region: '西南地区',
    matchScore: 72,
  },
  {
    id: 6,
    title: '新能源储能企业融资',
    company: '苏州绿能储能科技有限公司',
    amount: '¥12亿',
    industry: '能源环保',
    region: '华东地区',
    matchScore: 88,
  },
]

export default function AIFinderPage() {
  const [formData, setFormData] = useState({
    keyword: '',
    companyType: '',
    socialSecurity: '',
    registeredCapitalMin: 0,
    registeredCapitalMax: 10000,
    establishmentDate: '',
    hasPhone: '',
    hasWebsite: '',
    businessScope: '',
    province: '',
    city: '',
    county: '',
  })

  // Region cascade state
  const [provinces, setProvinces] = useState([])
  const [cities, setCities] = useState([])
  const [counties, setCounties] = useState([])
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCounty, setSelectedCounty] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showTICFields, setShowTICFields] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [showProjectSelector, setShowProjectSelector] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize] = useState(20)

  // CNCA 认证状态
  const [cncaResults, setCncaResults] = useState({}) // { companyName: CncaCertResult }
  const [isVerifyingCnca, setIsVerifyingCnca] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100)
    loadProvinces()
  }, [])

  // Load provinces on mount
  const loadProvinces = async () => {
    try {
      const api = getApi()
      const response = await api.get('/tic-companies/provinces')
      if (response.success && response.data) {
        setProvinces(response.data)
      }
    } catch (error) {
      console.error('Failed to load provinces:', error)
    }
  }

  // Load cities when province changes
  const loadCities = async (provinceName) => {
    if (!provinceName) {
      setCities([])
      setCounties([])
      return
    }
    try {
      const api = getApi()
      const response = await api.get('/tic-companies/cities', { province: provinceName })
      if (response.success && response.data) {
        setCities(response.data)
        setCounties([])
      }
    } catch (error) {
      console.error('Failed to load cities:', error)
    }
  }

  // Load counties when city changes
  const loadCounties = async (provinceName, cityName) => {
    if (!provinceName || !cityName) {
      setCounties([])
      return
    }
    try {
      const api = getApi()
      const response = await api.get('/tic-companies/counties', { province: provinceName, city: cityName })
      if (response.success && response.data) {
        setCounties(response.data)
      }
    } catch (error) {
      console.error('Failed to load counties:', error)
    }
  }

  // Handle province change
  const handleProvinceChange = (e) => {
    const value = e.target.value
    setSelectedProvince(value)
    setSelectedCity('')
    setSelectedCounty('')
    setFormData({
      ...formData,
      province: value,
      city: '',
      county: ''
    })
    loadCities(value)
  }

  // Handle city change
  const handleCityChange = (e) => {
    const value = e.target.value
    setSelectedCity(value)
    setSelectedCounty('')
    setFormData({
      ...formData,
      city: value,
      county: ''
    })
    loadCounties(selectedProvince, value)
  }

  // Handle county change
  const handleCountyChange = (e) => {
    const value = e.target.value
    setSelectedCounty(value)
    setFormData({
      ...formData,
      county: value
    })
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage)
    // Re-run search with new page
    const doSearch = async () => {
      setIsSearching(true)
      try {
        const api = getApi()
        const params = buildApiParams(newPage)
        const response = await api.getTicCompanies(params)
        if (response.success && response.data) {
          setSearchResults(response.data.list || [])
        }
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsSearching(false)
      }
    }
    doSearch()
  }

  // Build API params helper
  const buildApiParams = (page = currentPage) => {
    const params = {
      keyword: formData.keyword || undefined,
      companyType: formData.companyType || undefined,
      province: formData.province || undefined,
      city: formData.city || undefined,
      county: formData.county || undefined,
      page: page,
      pageSize: pageSize,
    }
    if (formData.socialSecurity === '50人以下') {
      params.employeeCountMax = 50
    } else if (formData.socialSecurity === '50-100人') {
      params.employeeCountMin = 50
      params.employeeCountMax = 100
    } else if (formData.socialSecurity === '100-500人') {
      params.employeeCountMin = 100
      params.employeeCountMax = 500
    } else if (formData.socialSecurity === '500-1000人') {
      params.employeeCountMin = 500
      params.employeeCountMax = 1000
    } else if (formData.socialSecurity === '1000人以上') {
      params.employeeCountMin = 1000
    }
    if (formData.registeredCapitalMin > 0) {
      params.registeredCapitalMin = formData.registeredCapitalMin
    }
    if (formData.hasPhone) {
      params.hasPhone = formData.hasPhone === '有' ? 'true' : 'false'
    }
    if (formData.hasWebsite) {
      params.hasWebsite = formData.hasWebsite === '有' ? 'true' : 'false'
    }
    if (formData.businessScope) params.businessScope = formData.businessScope
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key])
    return params
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSearch = async () => {
    setIsSearching(true)
    setHasSearched(true)

    try {
      const api = getApi()
      const params = buildApiParams(1)
      const response = await api.getTicCompanies(params)
      if (response.success && response.data) {
        setSearchResults(response.data.list || [])
        setTotalCount(response.data.total || 0)
        setTotalPages(response.data.totalPages || 0)
        setCurrentPage(1)
      } else {
        setSearchResults([])
        setTotalCount(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleReset = () => {
    setFormData({
      keyword: '',
      companyType: '',
      socialSecurity: '',
      registeredCapitalMin: 0,
      registeredCapitalMax: 10000,
      establishmentDate: '',
      hasPhone: '',
      hasWebsite: '',
      businessScope: '',
      province: '',
      city: '',
      county: '',
    })
    setSelectedProvince('')
    setSelectedCity('')
    setSelectedCounty('')
    setCities([])
    setCounties([])
    setSearchResults([])
    setHasSearched(false)
    setCurrentPage(1)
    setTotalPages(0)
    setTotalCount(0)
  }

  // View details - open qcc.com
  const handleViewDetails = (companyName) => {
    const url = `https://www.qcc.com/web/search?key=${encodeURIComponent(companyName)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Join project handler
  const handleJoinProject = (deal) => {
    const dealForProject = {
      company: deal.company_name,
      industry: deal.industry_category,
      region: [deal.province, deal.city, deal.county].filter(Boolean).join('-'),
      amount: deal.registered_capital ? `¥${deal.registered_capital}` : '-',
      matchScore: null,
    }
    setSelectedDeal(dealForProject)
    setShowProjectSelector(true)
  }

  // Parse risk status
  const getRiskTags = (deal) => {
    const tags = []
    if (deal.dishonest_status === '有') tags.push({ label: '失信被执行人', color: 'red' })
    if (deal.被执行_status === '有') tags.push({ label: '被执行人', color: 'orange' })
    if (deal.high_consumer_status === '有') tags.push({ label: '限制高消费', color: 'orange' })
    if (deal.judicial_freeze_status === '有') tags.push({ label: '司法冻结', color: 'red' })
    if (deal.business_exception_status === '有') tags.push({ label: '经营异常', color: 'yellow' })
    return tags
  }

  // Truncate business scope
  const truncateBusinessScope = (text, maxLength = 100) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  // Format region display
  const formatRegion = (province, city, county) => {
    const parts = [province, city, county].filter(Boolean)
    return parts.join('-') || '-'
  }

  // CNCA refresh handler
  const handleRefreshCnca = async () => {
    if (searchResults.length === 0) return
    setIsVerifyingCnca(true)
    try {
      const companies = searchResults.map(deal => ({
        name: deal.company_name || deal.company,
        creditCode: deal.credit_code || ''
      }))
      const api = getApi()
      const response = await api.verifyCncaCertification(companies)
      if (response.success && response.data) {
        const newResults = {}
        response.data.forEach(cert => {
          newResults[cert.name] = cert
        })
        setCncaResults(prev => ({ ...prev, ...newResults }))
      }
    } catch (error) {
      console.error('CNCA verification failed:', error)
    } finally {
      setIsVerifyingCnca(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <Badge variant="primary" className="mb-4 inline-flex items-center gap-2">
            <Sparkles size={14} />
            <span>TIC企业查询</span>
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            快速筛选<span className="gradient-text">TIC检测认证企业</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            基于人工智能技术，快速查找优质的TIC检测认证企业
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search Form */}
          <Card padding="lg" className={`lg:col-span-1 shadow-soft-lg transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Card.Title className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <Filter size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold">项目筛选条件</span>
            </Card.Title>

            <div className="space-y-5">
              <Input
                label="关键字搜索"
                name="keyword"
                value={formData.keyword}
                onChange={handleInputChange}
                placeholder="输入企业名称"
                icon={Search}
              />

              <Input
                label="企业性质"
                name="companyType"
                value={formData.companyType}
                onChange={handleInputChange}
                as="select"
              >
                <option value="">请选择企业性质</option>
                {companyTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Input>

              <Input
                label="社保缴纳人数"
                name="socialSecurity"
                value={formData.socialSecurity}
                onChange={handleInputChange}
                as="select"
              >
                <option value="">请选择社保缴纳人数</option>
                {socialSecurityOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Input>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  注册资本（万元）
                </label>
                <div className="px-1">
                  <input
                    type="range"
                    name="registeredCapital"
                    min="0"
                    max="10000"
                    step="100"
                    value={formData.registeredCapitalMin}
                    onChange={(e) => setFormData({ ...formData, registeredCapitalMin: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0万</span>
                  <span className="font-medium text-primary">
                    {formData.registeredCapitalMin === 0 ? '不限' : `≥${formData.registeredCapitalMin}万`}
                  </span>
                  <span>10000+万</span>
                </div>
              </div>

              <Input
                label="成立日期"
                name="establishmentDate"
                value={formData.establishmentDate}
                onChange={handleInputChange}
                type="date"
              />

              <Input
                label="联系电话"
                name="hasPhone"
                value={formData.hasPhone}
                onChange={handleInputChange}
                as="select"
              >
                <option value="">请选择</option>
                <option value="有">有</option>
                <option value="无">无</option>
              </Input>

              <Input
                label="网址"
                name="hasWebsite"
                value={formData.hasWebsite}
                onChange={handleInputChange}
                as="select"
              >
                <option value="">请选择</option>
                <option value="有">有</option>
                <option value="无">无</option>
              </Input>

              <Input
                label="经营范围"
                name="businessScope"
                value={formData.businessScope}
                onChange={handleInputChange}
                placeholder="输入经营范围关键字"
                icon={FileText}
              />

              {/* 地区 - 三级联动 */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  地区
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    name="province"
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="">省</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>

                  <select
                    name="city"
                    value={selectedCity}
                    onChange={handleCityChange}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    disabled={!selectedProvince}
                  >
                    <option value="">市</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select
                    name="county"
                    value={selectedCounty}
                    onChange={handleCountyChange}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    disabled={!selectedCity}
                  >
                    <option value="">区/县</option>
                    {counties.map((co) => (
                      <option key={co} value={co}>{co}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="primary"
                  className="flex-1 shadow-lg hover:shadow-xl transition-all duration-300"
                  icon={Search}
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? '搜索中...' : '开始搜索'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  className="px-4"
                >
                  重置
                </Button>
              </div>
            </div>
          </Card>

          {/* Results */}
          <div className={`lg:col-span-2 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {isSearching ? (
              <Card padding="lg" className="text-center">
                <div className="animate-pulse">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <Sparkles className="relative mx-auto text-primary mb-4" size={56} />
                  </div>
                  <p className="text-gray-600 text-lg mb-2">AI正在分析全市场项目...</p>
                  <p className="text-sm text-gray-400">基于300+维度进行精准筛选</p>
                </div>
              </Card>
            ) : hasSearched && searchResults.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp size={20} className="text-white" />
                    </div>
                    <span className="font-bold text-gray-900 text-lg">找到 {totalCount} 个匹配企业</span>
                  </div>
                  <Badge variant="success" className="px-3 py-1">精选推荐</Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {searchResults.map((deal, index) => {
                    const riskTags = getRiskTags(deal)
                    return (<Card key={deal.id || index} padding="none" hover className="cursor-pointer overflow-hidden group" style={{ animationDelay: `${index * 100}ms` }}><div className="h-1 bg-gradient-to-r from-primary to-secondary" /><div className="p-6"><div className="flex items-start justify-between mb-4"><div className="flex items-center space-x-3"><div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">{deal.company_name ? deal.company_name.charAt(0) : '?'}</div><div><h3 className={`font-bold text-gray-900 group-hover:text-primary transition-colors ${cncaResults[deal.company_name]?.hasCertification ? 'cursor-pointer' : ''}`} onClick={() => { const cert = cncaResults[deal.company_name]; if (cert?.hasCertification && cert?.detailUrl) { window.open(cert.detailUrl, '_blank', 'noopener,noreferrer') } }}>{deal.company_name}</h3><p className="text-sm text-gray-500">{deal.business_status || '-'}</p></div></div></div>{riskTags.length > 0 && (<div className="flex flex-wrap gap-2 mb-4">{riskTags.map((tag, tagIndex) => (<span key={tagIndex} className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${tag.color === 'red' ? 'bg-red-50 text-red-600' : tag.color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-yellow-50 text-yellow-600'}`}><Shield size={12} />{tag.label}</span>))}</div>)}{cncaResults[deal.company_name] !== undefined && (<div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-primary"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Shield size={16} className={cncaResults[deal.company_name]?.hasCertification === true ? 'text-green-600' : cncaResults[deal.company_name]?.hasCertification === false ? 'text-red-500' : 'text-gray-400'} /><span className="text-sm font-medium">{cncaResults[deal.company_name]?.hasCertification ? '已认证' : '无认证'}</span>{cncaResults[deal.company_name]?.certNo && (<span className="text-xs text-gray-500 ml-2">{cncaResults[deal.company_name].certNo}</span>)}</div>{cncaResults[deal.company_name]?.detailUrl && (<a href={cncaResults[deal.company_name].detailUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1" onClick={(e) => e.stopPropagation()}>查看详情 <ArrowRight size={12} /></a>)}</div></div>)}{<div className="grid grid-cols-2 gap-3 mb-4 text-sm"><div className="p-2 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500 mb-1">法定代表人</p><p className="font-medium text-gray-700">{deal.legal_representative || '-'}</p></div><div className="p-2 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500 mb-1">注册资本</p><p className="font-medium text-gray-700">{deal.registered_capital || '-'}</p></div><div className="p-2 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500 mb-1">成立日期</p><p className="font-medium text-gray-700">{deal.establishment_date || '-'}</p></div><div className="p-2 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500 mb-1">行业</p><p className="font-medium text-gray-700 text-xs">{deal.industry_category || '-'}</p></div><div className="p-2 bg-gray-50 rounded-lg col-span-2"><p className="text-xs text-gray-500 mb-1">地区</p><p className="font-medium text-gray-700">{formatRegion(deal.province, deal.city, deal.county)}</p></div><div className="p-2 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500 mb-1">参保人数</p><p className="font-medium text-gray-700">{deal.employee_count || '-'}</p></div><div className="p-2 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500 mb-1">统一社会信用代码</p><p className="font-medium text-gray-700 text-xs font-mono">{deal.credit_code || '-'}</p></div></div>}<div className="flex items-center justify-between"><span className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={12} />{formatRegion(deal.province, deal.city, deal.county)}</span><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleJoinProject(deal) }} icon={FolderPlus}>加入项目</Button><Button variant="ghost" size="sm" onClick={() => handleViewDetails(deal.company_name)}>查看详情 <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" /></Button></div></div></div></Card>)
                  })}
                </div>

                {/* Floating CNCA Refresh Button */}
                {hasSearched && searchResults.length > 0 && (
                  <button
                    onClick={handleRefreshCnca}
                    disabled={isVerifyingCnca || isSearching}
                    className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifyingCnca ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      <Shield size={16} />
                    )}
                    {isVerifyingCnca ? '验证中...' : '刷新认证状态'}
                  </button>
                )}
              </div>
            ) : hasSearched && searchResults.length === 0 ? (
              <Card padding="lg" className="text-center">
                <Building2 className="mx-auto text-gray-300 mb-4" size={56} />
                <p className="text-gray-500 text-lg">未找到匹配项目</p>
                <p className="text-sm text-gray-400 mt-2">尝试调整筛选条件</p>
              </Card>
            ) : (
              <Card padding="lg" className="text-center h-full flex flex-col justify-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center">
                    <Search size={40} className="text-primary" />
                  </div>
                </div>
                <p className="text-gray-500 text-lg mb-2">填写左侧条件开始搜索项目</p>
                <p className="text-sm text-gray-400">
                  行业、企业性质等信息越详细，搜索越精准
                </p>
                <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl inline-block mx-auto">
                  <p className="text-xs text-gray-500">传统人工筛选需1-3个月</p>
                  <p className="text-xs text-primary font-medium">AI智能筛选仅需3-7天</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Project Selector Modal */}
      <ProjectSelector
        isOpen={showProjectSelector}
        onClose={() => {
          setShowProjectSelector(false)
          setSelectedDeal(null)
        }}
        deal={selectedDeal}
        onSuccess={() => {
          // Optionally show a success message or refresh data
        }}
      />
    </div>
  )
}
