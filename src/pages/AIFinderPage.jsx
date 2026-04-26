import { useState } from 'react'
import { Search, Building2, Key, Users, TrendingUp, FileText, Sparkles, Filter, ArrowRight, Shield, Award, MapPin, CheckCircle, FolderPlus } from 'lucide-react'
import { Card, Button, Input, Badge } from '../components/ui'
import ProjectSelector from '../components/projects/ProjectSelector'

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
    industry: '',
    keyword: '',
    companyType: '',
    socialSecurity: '',
    registeredCapital: '',
    establishmentDate: '',
    // TIC资质
    hasCMA: false,
    hasCNAS: false,
    certCount: '',
    labArea: '',
    testingScope: '',
    mainTestingArea: '',
    customerIndustry: '',
    // 融资相关
    hasFinancing: '',
    financingDate: '',
    investor: '',
    financingAmount: '',
    // 风险
    riskLevel: '',
    changeRecords: '',
    contactPerson: '',
    contactMethod: '',
  })
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showTICFields, setShowTICFields] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [showProjectSelector, setShowProjectSelector] = useState(false)

  useState(() => {
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSearch = () => {
    setIsSearching(true)
    setHasSearched(true)

    setTimeout(() => {
      const filtered = mockDeals.filter((deal) => {
        if (formData.industry && deal.industry !== formData.industry) return false
        if (formData.keyword && !deal.company.includes(formData.keyword) && !deal.title.includes(formData.keyword)) return false
        return true
      })
      setSearchResults(filtered.slice(0, 6))
      setIsSearching(false)
    }, 1500)
  }

  const handleReset = () => {
    setFormData({
      industry: '',
      keyword: '',
      companyType: '',
      socialSecurity: '',
      registeredCapital: '',
      establishmentDate: '',
      hasCMA: false,
      hasCNAS: false,
      certCount: '',
      labArea: '',
      testingScope: '',
      mainTestingArea: '',
      customerIndustry: '',
      hasFinancing: '',
      financingDate: '',
      investor: '',
      financingAmount: '',
      riskLevel: '',
      changeRecords: '',
      contactPerson: '',
      contactMethod: '',
    })
    setSearchResults([])
    setHasSearched(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <Badge variant="primary" className="mb-4 inline-flex items-center gap-2">
            <Sparkles size={14} />
            <span>AI智能觅售</span>
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            快速筛选<span className="gradient-text">优质出售项目</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            基于人工智能技术，提高并购交易效率，降低信息不对称成本
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
                label="所属行业"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                as="select"
              >
                <option value="">请选择行业</option>
                <option value="科技">科技</option>
                <option value="医疗健康">医疗健康</option>
                <option value="金融服务">金融服务</option>
                <option value="制造业">制造业</option>
                <option value="零售消费">零售消费</option>
                <option value="能源环保">能源环保</option>
                <option value="教育培训">教育培训</option>
                <option value="TIC检测认证">TIC检测认证</option>
              </Input>

              <Input
                label="关键字搜索"
                name="keyword"
                value={formData.keyword}
                onChange={handleInputChange}
                placeholder="输入企业名称或关键词"
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

              <Input
                label="注册资本（万元）"
                name="registeredCapital"
                value={formData.registeredCapital}
                onChange={handleInputChange}
                placeholder="如：5000"
                icon={Key}
              />

              <Input
                label="成立日期"
                name="establishmentDate"
                value={formData.establishmentDate}
                onChange={handleInputChange}
                type="date"
              />

              {/* TIC行业专属字段 - 折叠 */}
              <div className="border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowTICFields(!showTICFields)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <Shield size={18} className="text-primary" />
                    <span className="font-medium text-gray-900">TIC行业专属筛选</span>
                  </div>
                  <span className={`text-gray-400 transition-transform ${showTICFields ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {showTICFields && (
                  <div className="mt-4 space-y-4 animate-fade-in">
                    {/* 资质复选框 */}
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="hasCMA"
                          checked={formData.hasCMA}
                          onChange={handleInputChange}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">CMA资质认定</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="hasCNAS"
                          checked={formData.hasCNAS}
                          onChange={handleInputChange}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">CNAS认可</span>
                      </label>
                    </div>

                    <Input
                      label="认可证书数量（个）"
                      name="certCount"
                      value={formData.certCount}
                      onChange={handleInputChange}
                      placeholder="如：120"
                      icon={Award}
                    />

                    <Input
                      label="实验室面积（平方米）"
                      name="labArea"
                      value={formData.labArea}
                      onChange={handleInputChange}
                      placeholder="如：5000"
                      icon={Building2}
                    />

                    <Input
                      label="主营检测领域"
                      name="mainTestingArea"
                      value={formData.mainTestingArea}
                      onChange={handleInputChange}
                      as="select"
                    >
                      <option value="">请选择主营检测领域</option>
                      {testingAreas.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </Input>

                    <Input
                      label="主要客户行业分布"
                      name="customerIndustry"
                      value={formData.customerIndustry}
                      onChange={handleInputChange}
                      as="select"
                    >
                      <option value="">请选择客户行业</option>
                      {customerIndustries.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </Input>
                  </div>
                )}
              </div>

              <Input
                label="是否有过融资"
                name="hasFinancing"
                value={formData.hasFinancing}
                onChange={handleInputChange}
                as="select"
              >
                <option value="">请选择</option>
                <option value="是">是</option>
                <option value="否">否</option>
              </Input>

              <Input
                label="融资时间"
                name="financingDate"
                value={formData.financingDate}
                onChange={handleInputChange}
                type="date"
              />

              <Input
                label="投资方"
                name="investor"
                value={formData.investor}
                onChange={handleInputChange}
                placeholder="请输入投资方名称"
              />

              <Input
                label="融资金额（万元）"
                name="financingAmount"
                value={formData.financingAmount}
                onChange={handleInputChange}
                placeholder="如：5000"
              />

              {/* 风险系数 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  风险系数
                </label>
                <div className="flex gap-2">
                  {[
                    { value: '1', label: '低', color: 'bg-green-500', hover: 'hover:bg-green-600', ring: 'ring-green-500' },
                    { value: '2', label: '较低', color: 'bg-lime-500', hover: 'hover:bg-lime-600', ring: 'ring-lime-500' },
                    { value: '3', label: '中等', color: 'bg-yellow-500', hover: 'hover:bg-yellow-600', ring: 'ring-yellow-500' },
                    { value: '4', label: '较高', color: 'bg-orange-500', hover: 'hover:bg-orange-600', ring: 'ring-orange-500' },
                    { value: '5', label: '高', color: 'bg-red-500', hover: 'hover:bg-red-600', ring: 'ring-red-500' },
                  ].map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, riskLevel: level.value })}
                      className={`flex-1 py-3 rounded-xl text-white text-sm font-medium transition-all duration-300 ${formData.riskLevel === level.value ? `${level.color} ring-2 ${level.ring} shadow-lg scale-105` : `${level.color} ${level.hover} opacity-70 hover:opacity-100`}`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="工商变更记录"
                name="changeRecords"
                value={formData.changeRecords}
                onChange={handleInputChange}
                as="select"
              >
                <option value="">请选择变更记录</option>
                {changeRecordOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Input>

              <Input
                label="联系人"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                placeholder="请输入联系人姓名"
              />

              <Input
                label="联系方式"
                name="contactMethod"
                value={formData.contactMethod}
                onChange={handleInputChange}
                placeholder="请输入手机号或邮箱"
              />

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
                    <span className="font-bold text-gray-900 text-lg">找到 {searchResults.length} 个匹配项目</span>
                  </div>
                  <Badge variant="success" className="px-3 py-1">精选推荐</Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {searchResults.map((deal, index) => (
                    <Card
                      key={deal.id}
                      padding="none"
                      hover
                      className="cursor-pointer overflow-hidden group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                              {deal.company.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{deal.company}</h3>
                              <p className="text-sm text-gray-500">{deal.title}</p>
                            </div>
                          </div>
                          <Badge variant={deal.matchScore >= 90 ? 'success' : 'primary'} className="text-sm font-bold">
                            {deal.matchScore}分
                          </Badge>
                        </div>

                        {/* TIC资质标签 */}
                        {deal.industry === 'TIC检测认证' && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {deal.hasCMA && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                                <CheckCircle size={12} />
                                CMA
                              </span>
                            )}
                            {deal.hasCNAS && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">
                                <CheckCircle size={12} />
                                CNAS
                              </span>
                            )}
                            {deal.certCount && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full">
                                <Award size={12} />
                                {deal.certCount}个证书
                              </span>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="text-center p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
                            <p className="text-xs text-gray-500 mb-1">交易金额</p>
                            <p className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{deal.amount}</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
                            <p className="text-xs text-gray-500 mb-1">行业</p>
                            <p className="font-semibold text-gray-700 text-sm">{deal.industry}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <MapPin size={12} />
                            {deal.region}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedDeal(deal)
                                setShowProjectSelector(true)
                              }}
                              icon={FolderPlus}
                            >
                              加入项目
                            </Button>
                            <Button variant="ghost" size="sm" className="group-hover:text-primary">
                              查看详情 <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
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
