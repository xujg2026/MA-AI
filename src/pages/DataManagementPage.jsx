import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ExcelImporter from '../components/ai/ExcelImporter'
import useExcelDataStore from '../data/excelData'
import { mockDeals } from '../data/mockData'
import {
  Building2, Calendar, Wallet, Users, TrendingUp, BarChart3,
  Target, Sparkles, Save, RotateCcw, Check, ChevronRight,
  Heart, Zap, Shield, Briefcase, ExternalLink, AlertCircle,
  User, Clock, TrendingDown, DollarSign, Percent,
  FileSpreadsheet, Table, Trash2, ArrowRight, Database, Upload, List
} from 'lucide-react'
import { Card, Badge, Button, Input } from '../components/ui'

// 出售动机选项
const motivationOptions = [
  {
    value: 'succession',
    label: '个人与传承因素',
    desc: '创始人/实控人退休、无合适接班人、健康问题，或家庭变故需要变现',
    icon: Heart,
    color: 'rose',
  },
  {
    value: 'strategy',
    label: '战略聚焦与止损',
    desc: '剥离非核心业务，集中资源发展主业；或因行业竞争加剧、前景看淡，及时止损离场',
    icon: Shield,
    color: 'blue',
  },
  {
    value: 'financial',
    label: '财务困境与压力',
    desc: '资金链紧张、债务沉重、融资困难，被迫出售以偿债或续命',
    icon: AlertCircle,
    color: 'red',
  },
  {
    value: 'capital',
    label: '资本退出与环境',
    desc: 'PE/VC投资周期结束，强制退出；IPO无望或估值倒挂，转售更划算；宏观经济下行，卖家趁市场尚好提前落袋',
    icon: TrendingDown,
    color: 'purple',
  },
  {
    value: 'external',
    label: '外部与突发驱动',
    desc: '共同股东分歧、监管政策变化、技术迭代冲击，或突发意外事件',
    icon: ExternalLink,
    color: 'orange',
  },
  {
    value: 'other',
    label: '其他原因',
    desc: '其他原因，请填写说明',
    icon: MoreIcon,
    color: 'gray',
    requireInput: true,
  },
]

function MoreIcon({ size = 20, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}

const employeeScaleOptions = [
  '50人以下', '50-100人', '100-500人', '500-1000人', '1000-5000人', '5000人以上',
]

const dataEntrySteps = [
  { key: 'basic', label: '基本信息', icon: Building2 },
  { key: 'financial', label: '财务信息', icon: DollarSign },
  { key: 'motivation', label: '出售动机', icon: Target },
]

export default function DataManagementPage() {
  const [showImporter, setShowImporter] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState('import') // import, entry, list
  const navigate = useNavigate()
  const { importedDeals, removeImportedDeal, clearImportedDeals, getImportStats } =
    useExcelDataStore()
  const stats = getImportStats()

  // 信息录入表单状态
  const [currentStep, setCurrentStep] = useState('basic')
  const [formData, setFormData] = useState({
    companyName: '', establishmentDate: '', registeredCapital: '', employeeScale: '',
    revenue1: '', revenue2: '', revenue3: '',
    netProfit1: '', netProfit2: '', netProfit3: '',
    netAssetsDate: '', netAssets: '', totalAssetsDate: '', totalAssets: '',
    motivations: [], motivationOther: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleImportComplete = (newDeals) => {
    setShowImporter(false)
    setActiveTab('list')
  }

  const handleViewDeals = () => {
    navigate('/ai-finder')
  }

  const statCards = [
    { label: '已导入项目', value: stats.totalImported, icon: Database, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50' },
    { label: '导入文件数', value: stats.totalFiles, icon: FileSpreadsheet, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50' },
    { label: '示例数据', value: mockDeals.length, icon: Table, color: 'from-purple-500 to-violet-500', bgColor: 'bg-purple-50' },
    { label: '可用项目总数', value: mockDeals.length + stats.totalImported, icon: Sparkles, color: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-50' },
  ]

  // 信息录入相关函数
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const handleMotivationToggle = (value) => {
    setFormData((prev) => ({
      ...prev,
      motivations: prev.motivations.includes(value)
        ? prev.motivations.filter((m) => m !== value)
        : [...prev.motivations, value],
    }))
  }

  const validateStep = () => {
    const newErrors = {}
    if (currentStep === 'basic') {
      if (!formData.companyName.trim()) newErrors.companyName = '请输入企业名称'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      const stepOrder = ['basic', 'financial', 'motivation']
      const currentIndex = stepOrder.indexOf(currentStep)
      if (currentIndex < stepOrder.length - 1) {
        setCurrentStep(stepOrder[currentIndex + 1])
      }
    }
  }

  const handlePrev = () => {
    const stepOrder = ['basic', 'financial', 'motivation']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 3000)
    }, 1500)
  }

  const handleReset = () => {
    setFormData({
      companyName: '', establishmentDate: '', registeredCapital: '', employeeScale: '',
      revenue1: '', revenue2: '', revenue3: '',
      netProfit1: '', netProfit2: '', netProfit3: '',
      netAssetsDate: '', netAssets: '', totalAssetsDate: '', totalAssets: '',
      motivations: [], motivationOther: '',
    })
    setErrors({})
  }

  const getStepProgress = () => {
    let filled = 0
    let total = 0

    if (currentStep === 'basic') {
      total = 4
      if (formData.companyName) filled++
      if (formData.establishmentDate) filled++
      if (formData.registeredCapital) filled++
      if (formData.employeeScale) filled++
    } else if (currentStep === 'financial') {
      total = 8
      if (formData.revenue1) filled++
      if (formData.revenue2) filled++
      if (formData.revenue3) filled++
      if (formData.netProfit1) filled++
      if (formData.netProfit2) filled++
      if (formData.netProfit3) filled++
      if (formData.netAssets) filled++
      if (formData.totalAssets) filled++
    } else {
      total = formData.motivations.length || 1
      filled = formData.motivations.length
    }
    return { filled, total }
  }

  const getMotivationIcon = (option) => {
    const Icon = option.icon
    const colorMap = {
      rose: 'from-rose-400 to-rose-600',
      blue: 'from-blue-400 to-blue-600',
      red: 'from-red-400 to-red-600',
      purple: 'from-purple-400 to-purple-600',
      orange: 'from-orange-400 to-orange-600',
      gray: 'from-gray-400 to-gray-600',
    }
    return { Icon, color: colorMap[option.color] || colorMap.gray }
  }

  const { filled, total } = getStepProgress()

  const colorClasses = {
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', ring: 'ring-rose-500' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', ring: 'ring-blue-500' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', ring: 'ring-red-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', ring: 'ring-purple-500' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', ring: 'ring-orange-500' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', ring: 'ring-gray-500' },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Badge variant="primary" className="mb-4 inline-flex items-center gap-2">
            <Database size={14} />
            <span>数据管理中心</span>
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            高效管理<span className="gradient-text">项目数据</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            支持Excel批量导入与手动录入，灵活管理项目信息
          </p>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {statCards.map((stat, index) => (
            <Card key={stat.label} padding="lg" className="relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={26} className="text-gray-700" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className={`flex justify-center mb-8 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex bg-white rounded-2xl shadow-soft p-2">
            <button
              onClick={() => setActiveTab('import')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'import'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Upload size={20} />
              导入数据
            </button>
            <button
              onClick={() => setActiveTab('entry')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'entry'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Save size={20} />
              手动录入
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List size={20} />
              已导入数据 ({importedDeals.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* 导入数据 Tab */}
          {activeTab === 'import' && (
            <ExcelImporter onImportComplete={handleImportComplete} />
          )}

          {/* 手动录入 Tab */}
          {activeTab === 'entry' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2">
                <Card padding="none" className="overflow-hidden shadow-xl border-0">
                  {/* Step Progress Bar */}
                  <div className="h-1.5 bg-gray-100">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
                      style={{ width: `${(filled / total) * 100}%` }}
                    />
                  </div>

                  <div className="p-8">
                    {/* Basic Info Step */}
                    {currentStep === 'basic' && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
                            <Building2 size={26} className="text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">基本信息</h2>
                            <p className="text-gray-500 text-sm">填写企业基本信息</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <Input
                              label="企业名称"
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleInputChange}
                              placeholder="请输入企业全称"
                              icon={Building2}
                              error={errors.companyName}
                              className="text-base py-4"
                            />
                          </div>

                          <Input
                            label="成立日期"
                            name="establishmentDate"
                            value={formData.establishmentDate}
                            onChange={handleInputChange}
                            type="date"
                            icon={Calendar}
                            className="py-4"
                          />

                          <Input
                            label="注册资本（万元）"
                            name="registeredCapital"
                            value={formData.registeredCapital}
                            onChange={handleInputChange}
                            placeholder="请输入注册资本"
                            icon={Wallet}
                            className="py-4"
                          />

                          <div className="md:col-span-2">
                            <Input
                              label="人员规模"
                              name="employeeScale"
                              value={formData.employeeScale}
                              onChange={handleInputChange}
                              as="select"
                              icon={Users}
                              className="py-4"
                            >
                              <option value="">请选择人员规模</option>
                              {employeeScaleOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </Input>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Financial Info Step */}
                    {currentStep === 'financial' && (
                      <div className="space-y-8 animate-fade-in">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                            <TrendingUp size={26} className="text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">财务信息</h2>
                            <p className="text-gray-500 text-sm">填写近三年财务数据</p>
                          </div>
                        </div>

                        {/* Revenue */}
                        <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 rounded-2xl p-6 border border-green-100">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                              <TrendingUp size={20} className="text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">营业收入</h3>
                              <p className="text-xs text-gray-500">近三年营业收入（万元）</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            {[
                              { name: 'revenue1', label: '2025年', placeholder: '如：5000' },
                              { name: 'revenue2', label: '2024年', placeholder: '如：6000' },
                              { name: 'revenue3', label: '2023年', placeholder: '如：7500' },
                            ].map((field) => (
                              <div key={field.name} className="relative">
                                <label className="block text-xs font-medium text-gray-500 mb-1.5 pl-1">{field.label}</label>
                                <input
                                  name={field.name}
                                  value={formData[field.name]}
                                  onChange={handleInputChange}
                                  placeholder={field.placeholder}
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Net Profit */}
                        <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/30 rounded-2xl p-6 border border-blue-100">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                              <Percent size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">净利润</h3>
                              <p className="text-xs text-gray-500">近三年净利润（万元）</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            {[
                              { name: 'netProfit1', label: '2025年', placeholder: '如：500' },
                              { name: 'netProfit2', label: '2024年', placeholder: '如：600' },
                              { name: 'netProfit3', label: '2023年', placeholder: '如：750' },
                            ].map((field) => (
                              <div key={field.name} className="relative">
                                <label className="block text-xs font-medium text-gray-500 mb-1.5 pl-1">{field.label}</label>
                                <input
                                  name={field.name}
                                  value={formData[field.name]}
                                  onChange={handleInputChange}
                                  placeholder={field.placeholder}
                                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Assets */}
                        <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/30 rounded-2xl p-6 border border-purple-100">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                              <BarChart3 size={20} className="text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">资产信息</h3>
                              <p className="text-xs text-gray-500">净资产与总资产</p>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                <Calendar size={14} className="text-gray-400" />
                                净资产截止日期
                              </div>
                              <input
                                name="netAssetsDate"
                                value={formData.netAssetsDate}
                                onChange={handleInputChange}
                                type="date"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                              />
                              <input
                                name="netAssets"
                                value={formData.netAssets}
                                onChange={handleInputChange}
                                placeholder="净资产金额（万元）"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                              />
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                <Calendar size={14} className="text-gray-400" />
                                总资产截止日期
                              </div>
                              <input
                                name="totalAssetsDate"
                                value={formData.totalAssetsDate}
                                onChange={handleInputChange}
                                type="date"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                              />
                              <input
                                name="totalAssets"
                                value={formData.totalAssets}
                                onChange={handleInputChange}
                                placeholder="总资产金额（万元）"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Motivation Step */}
                    {currentStep === 'motivation' && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                            <Target size={26} className="text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">出售动机</h2>
                            <p className="text-gray-500 text-sm">选择出售的主要原因（可多选）</p>
                          </div>
                        </div>

                        <div className="grid gap-4">
                          {motivationOptions.map((option) => {
                            const { Icon, color } = getMotivationIcon(option)
                            const isSelected = formData.motivations.includes(option.value)
                            const colors = colorClasses[option.color]

                            return (
                              <div
                                key={option.value}
                                onClick={() => handleMotivationToggle(option.value)}
                                className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                                  isSelected
                                    ? `${colors.border} ${colors.bg} shadow-lg`
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                                }`}
                              >
                                <div className="flex items-start gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                    isSelected
                                      ? `bg-gradient-to-br ${color} text-white shadow-lg`
                                      : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    <Icon size={22} />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className={`font-semibold text-base mb-1 ${
                                      isSelected ? colors.text : 'text-gray-700'
                                    }`}>
                                      {option.label}
                                    </h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                      {option.desc}
                                    </p>
                                    {option.requireInput && isSelected && (
                                      <div className="mt-4">
                                        <textarea
                                          name="motivationOther"
                                          value={formData.motivationOther}
                                          onChange={(e) => {
                                            e.stopPropagation()
                                            setFormData({ ...formData, motivationOther: e.target.value })
                                          }}
                                          placeholder="请详细填写其他原因..."
                                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 resize-none"
                                          rows={3}
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                    isSelected ? `${colors.border} bg-inherit` : 'border-gray-300'
                                  }`}>
                                    {isSelected && (
                                      <Check size={14} className={colors.text} />
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        onClick={handlePrev}
                        disabled={currentStep === 'basic'}
                        className="px-6"
                      >
                        上一步
                      </Button>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={handleReset}
                          className="px-6 border-gray-200"
                          icon={RotateCcw}
                        >
                          重置
                        </Button>

                        {currentStep !== 'motivation' ? (
                          <Button
                            variant="primary"
                            onClick={handleNext}
                            className="px-8 shadow-lg shadow-primary/25"
                            icon={ChevronRight}
                            iconPosition="right"
                          >
                            下一步
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-8 shadow-lg shadow-primary/25"
                            icon={Save}
                          >
                            {isSubmitting ? '保存中...' : '保存录入'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Success Message */}
                  {submitSuccess && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm animate-fade-in">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-500/30">
                          <Check size={40} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">录入成功！</h3>
                        <p className="text-gray-500">信息已保存</p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Sidebar - Preview & Tips */}
              <div className="transition-all duration-700 delay-300">
                {/* Preview Card */}
                <Card padding="lg" className="mb-6 shadow-lg border-0 bg-gradient-to-br from-gray-900 to-gray-800 text-white sticky top-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <Sparkles size={20} className="text-accent" />
                    </div>
                    <h3 className="font-bold text-lg">预览</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Building2 size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-400">企业名称</p>
                        <p className="text-sm font-medium text-white/90">{formData.companyName || '未填写'}</p>
                      </div>
                    </div>

                    {formData.employeeScale && (
                      <div className="flex items-start gap-3">
                        <Users size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400">人员规模</p>
                          <p className="text-sm font-medium text-white/90">{formData.employeeScale}</p>
                        </div>
                      </div>
                    )}

                    {formData.registeredCapital && (
                      <div className="flex items-start gap-3">
                        <Wallet size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400">注册资本</p>
                          <p className="text-sm font-medium text-white/90">{formData.registeredCapital} 万元</p>
                        </div>
                      </div>
                    )}

                    {formData.motivations.length > 0 && (
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-400 mb-3">出售动机</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.motivations.map((m) => {
                            const opt = motivationOptions.find(o => o.value === m)
                            return (
                              <span key={m} className="px-3 py-1.5 bg-white/10 rounded-full text-xs font-medium text-white/80">
                                {opt?.label}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">当前进度</span>
                      <span className="text-white font-medium">{Math.round((filled / total) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent to-green-400 rounded-full transition-all duration-500"
                        style={{ width: `${(filled / total) * 100}%` }}
                      />
                    </div>
                  </div>
                </Card>

                {/* Tips Card */}
                <Card padding="lg" className="shadow-lg border-0 bg-gradient-to-br from-amber-50 to-orange-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Zap size={20} className="text-amber-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">填写提示</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <Clock size={14} className="text-amber-500 mt-0.5 shrink-0" />
                      <span>财务数据请确保真实有效</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock size={14} className="text-amber-500 mt-0.5 shrink-0" />
                      <span>出售动机可多选，越详细越利于AI匹配</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock size={14} className="text-amber-500 mt-0.5 shrink-0" />
                      <span>带<span className="text-red-500">*</span>号为必填项</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          )}

          {/* 已导入数据 Tab */}
          {activeTab === 'list' && (
            <Card padding="none" className="overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl font-bold text-gray-900">已导入项目列表</h2>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={clearImportedDeals} className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 size={16} className="mr-2" />
                    清空
                  </Button>
                  <Button variant="primary" onClick={handleViewDeals}>
                    <ArrowRight size={16} className="mr-2" />
                    AI匹配
                  </Button>
                </div>
              </div>

              {importedDeals.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gray-100 rounded-full blur-2xl" />
                    <div className="relative w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <FileSpreadsheet size={40} className="text-gray-400" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-lg mb-4">暂无导入数据</p>
                  <Button variant="primary" onClick={() => setActiveTab('import')}>
                    <Upload size={16} className="mr-2" />
                    去导入
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">公司名称</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">行业</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">估值(亿)</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">地域</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">阶段</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">类型</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {importedDeals.map((deal) => (
                        <tr key={deal.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900">{deal.company}</p>
                              <p className="text-xs text-gray-500">{deal.title}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="primary">{deal.industry}</Badge>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-700">{deal.valuation}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{deal.region}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{deal.stage}</td>
                          <td className="px-6 py-4">
                            <Badge variant={deal.type === 'sell' ? 'primary' : 'success'}>
                              {deal.type === 'sell' ? '卖方' : '买方'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImportedDeal(deal.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
