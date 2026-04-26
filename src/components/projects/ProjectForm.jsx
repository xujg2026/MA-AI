import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, Calendar, Wallet, Users, TrendingUp, BarChart3,
  Target, Sparkles, RotateCcw, Check, ChevronRight,
  Heart, Shield, AlertCircle, TrendingDown, ExternalLink,
  DollarSign, Percent, Clock
} from 'lucide-react'
import { Card, Button, Input } from '../ui'
import useProjectStore from '../../stores/projectStore'

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

const employeeScaleOptions = [
  '50人以下', '50-100人', '100-500人', '500-1000人', '1000-5000人', '5000人以上',
]

const industryOptions = [
  '科技', '医疗健康', '金融服务', '制造业', '零售消费', '能源环保', '教育培训', 'TIC检测认证', '其他',
]

const regionOptions = [
  '华北地区', '华东地区', '华南地区', '华中地区', '西南地区', '西北地区', '东北地区', '港澳台', '海外',
]

const dataEntrySteps = [
  { key: 'basic', label: '基本信息', icon: Building2 },
  { key: 'financial', label: '财务信息', icon: DollarSign },
  { key: 'motivation', label: '出售动机', icon: Target },
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

export default function ProjectForm({ initialData, onSuccess, onEdit, onCancel }) {
  const navigate = useNavigate()
  const { createProject, updateProject } = useProjectStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState('basic')
  const [errors, setErrors] = useState({})

  // 判断是否为编辑模式
  const isEditMode = !!initialData

  // 初始化表单数据
  useEffect(() => {
    if (initialData) {
      // 解析 change_records
      let changeRecords = {}
      try {
        if (initialData.change_records) {
          changeRecords = typeof initialData.change_records === 'string'
            ? JSON.parse(initialData.change_records)
            : initialData.change_records
        }
      } catch (e) {
        console.error('Failed to parse change_records:', e)
      }

      // 解析 sell_motivation
      let motivations = []
      try {
        if (initialData.sell_motivation) {
          motivations = typeof initialData.sell_motivation === 'string'
            ? JSON.parse(initialData.sell_motivation)
            : initialData.sell_motivation
        }
      } catch (e) {
        motivations = []
      }

      setFormData({
        name: initialData.name || '',
        company_name: initialData.company_name || '',
        industry: initialData.industry || '',
        region: initialData.region || '',
        establishment_date: initialData.establishment_date || '',
        registration_capital: initialData.registration_capital || '',
        employee_scale: initialData.employee_count || '',
        // 财务信息
        revenue1: changeRecords?.financial_data?.revenue?.[0] || '',
        revenue2: changeRecords?.financial_data?.revenue?.[1] || '',
        revenue3: changeRecords?.financial_data?.revenue?.[2] || '',
        net_profit1: changeRecords?.financial_data?.net_profit?.[0] || '',
        net_profit2: changeRecords?.financial_data?.net_profit?.[1] || '',
        net_profit3: changeRecords?.financial_data?.net_profit?.[2] || '',
        net_assets_date: changeRecords?.financial_data?.net_assets_date || '',
        net_assets: changeRecords?.financial_data?.net_assets || '',
        total_assets_date: changeRecords?.financial_data?.total_assets_date || '',
        total_assets: changeRecords?.financial_data?.total_assets || '',
        // 出售动机
        motivations: motivations || [],
        motivation_other: changeRecords?.motivation_other || '',
      })
    }
  }, [initialData])

  const [formData, setFormData] = useState({
    // 基本信息
    name: '',
    company_name: '',
    industry: '',
    region: '',
    establishment_date: '',
    registration_capital: '',
    employee_scale: '',
    // 财务信息
    revenue1: '',
    revenue2: '',
    revenue3: '',
    net_profit1: '',
    net_profit2: '',
    net_profit3: '',
    net_assets_date: '',
    net_assets: '',
    total_assets_date: '',
    total_assets: '',
    // 出售动机
    motivations: [],
    motivation_other: '',
  })

  const colorClasses = {
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', ring: 'ring-rose-500' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', ring: 'ring-blue-500' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', ring: 'ring-red-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', ring: 'ring-purple-500' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', ring: 'ring-orange-500' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', ring: 'ring-gray-500' },
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const handleMotivationToggle = (value) => {
    setFormData(prev => ({
      ...prev,
      motivations: prev.motivations.includes(value)
        ? prev.motivations.filter(m => m !== value)
        : [...prev.motivations, value],
    }))
  }

  const validateStep = () => {
    const newErrors = {}
    if (currentStep === 'basic') {
      if (!formData.name.trim()) newErrors.name = '请输入项目名称'
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

  const handleReset = () => {
    setFormData({
      name: '', company_name: '', industry: '', region: '',
      establishment_date: '', registration_capital: '', employee_scale: '',
      revenue1: '', revenue2: '', revenue3: '',
      net_profit1: '', net_profit2: '', net_profit3: '',
      net_assets_date: '', net_assets: '', total_assets_date: '', total_assets: '',
      motivations: [], motivation_other: '',
    })
    setErrors({})
    setCurrentStep('basic')
  }

  const getStepProgress = () => {
    let filled = 0
    let total = 0

    if (currentStep === 'basic') {
      total = 4
      if (formData.name) filled++
      if (formData.industry) filled++
      if (formData.region) filled++
      if (formData.employee_scale) filled++
    } else if (currentStep === 'financial') {
      total = 8
      if (formData.revenue1) filled++
      if (formData.revenue2) filled++
      if (formData.revenue3) filled++
      if (formData.net_profit1) filled++
      if (formData.net_profit2) filled++
      if (formData.net_profit3) filled++
      if (formData.net_assets) filled++
      if (formData.total_assets) filled++
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep()) return

    setIsSubmitting(true)
    try {
      // 将财务数据和动机存入 change_records
      const changeRecords = {
        financial_data: {
          revenue: [formData.revenue1, formData.revenue2, formData.revenue3],
          net_profit: [formData.net_profit1, formData.net_profit2, formData.net_profit3],
          net_assets_date: formData.net_assets_date,
          net_assets: formData.net_assets,
          total_assets_date: formData.total_assets_date,
          total_assets: formData.total_assets,
        },
        motivations: formData.motivations,
        motivation_other: formData.motivation_other,
      }

      const projectData = {
        name: formData.name,
        company_name: formData.company_name,
        industry: formData.industry,
        region: formData.region,
        establishment_date: formData.establishment_date,
        registration_capital: formData.registration_capital,
        employee_count: formData.employee_scale,
        sell_motivation: JSON.stringify(formData.motivations),
        change_records: JSON.stringify(changeRecords),
      }

      let result
      if (isEditMode) {
        // 编辑模式
        result = await updateProject(initialData.id, projectData)
        if (result) {
          alert('更新项目成功！')
          onEdit?.(result)
        } else {
          alert('更新项目失败')
        }
      } else {
        // 创建模式
        result = await createProject({
          ...projectData,
          status: 'draft',
          source: 'manual',
        })
        if (result) {
          alert('创建项目成功！')
          onSuccess?.(result)
        } else {
          alert('创建项目失败')
        }
      }
    } catch (error) {
      console.error(isEditMode ? '更新项目失败:' : '创建项目失败:', error)
      alert(isEditMode ? '更新项目失败' : '创建项目失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const { filled, total } = getStepProgress()

  return (
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
            {/* Step 1: Basic Info */}
            {currentStep === 'basic' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
                    <Building2 size={26} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">基本信息</h2>
                    <p className="text-gray-500 text-sm">填写项目基本信息</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="项目名称 *"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="如：深圳XX公司出售项目"
                      icon={Building2}
                      error={errors.name}
                      className="text-base py-4"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="企业名称"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      placeholder="目标公司全称"
                      icon={Building2}
                      className="py-4"
                    />
                  </div>

                  <Input
                    label="所属行业"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    as="select"
                    icon={TrendingUp}
                    className="py-4"
                  >
                    <option value="">请选择</option>
                    {industryOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </Input>

                  <Input
                    label="所属地区"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    as="select"
                    icon={Users}
                    className="py-4"
                  >
                    <option value="">请选择</option>
                    {regionOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </Input>

                  <Input
                    label="成立日期"
                    name="establishment_date"
                    value={formData.establishment_date}
                    onChange={handleInputChange}
                    type="date"
                    icon={Calendar}
                    className="py-4"
                  />

                  <Input
                    label="注册资本（万元）"
                    name="registration_capital"
                    value={formData.registration_capital}
                    onChange={handleInputChange}
                    placeholder="请输入注册资本"
                    icon={Wallet}
                    className="py-4"
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="人员规模"
                      name="employee_scale"
                      value={formData.employee_scale}
                      onChange={handleInputChange}
                      as="select"
                      icon={Users}
                      className="py-4"
                    >
                      <option value="">请选择人员规模</option>
                      {employeeScaleOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Input>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Financial Info */}
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
                      { name: 'net_profit1', label: '2025年', placeholder: '如：500' },
                      { name: 'net_profit2', label: '2024年', placeholder: '如：600' },
                      { name: 'net_profit3', label: '2023年', placeholder: '如：750' },
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
                        name="net_assets_date"
                        value={formData.net_assets_date}
                        onChange={handleInputChange}
                        type="date"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                      />
                      <input
                        name="net_assets"
                        value={formData.net_assets}
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
                        name="total_assets_date"
                        value={formData.total_assets_date}
                        onChange={handleInputChange}
                        type="date"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                      />
                      <input
                        name="total_assets"
                        value={formData.total_assets}
                        onChange={handleInputChange}
                        placeholder="总资产金额（万元）"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Motivation */}
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
                              <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                                <textarea
                                  name="motivation_other"
                                  value={formData.motivation_other}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    setFormData({ ...formData, motivation_other: e.target.value })
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
                onClick={currentStep === 'basic' ? onCancel : handlePrev}
                className="px-6"
              >
                {currentStep === 'basic' ? '取消' : '上一步'}
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
                    icon={Sparkles}
                  >
                    {isSubmitting ? (isEditMode ? '更新中...' : '创建中...') : (isEditMode ? '更新项目' : '创建项目')}
                  </Button>
                )}
              </div>
            </div>
          </div>
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
                <p className="text-xs text-gray-400">项目名称</p>
                <p className="text-sm font-medium text-white/90">{formData.name || '未填写'}</p>
              </div>
            </div>

            {formData.company_name && (
              <div className="flex items-start gap-3">
                <Building2 size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">企业名称</p>
                  <p className="text-sm font-medium text-white/90">{formData.company_name}</p>
                </div>
              </div>
            )}

            {formData.employee_scale && (
              <div className="flex items-start gap-3">
                <Users size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">人员规模</p>
                  <p className="text-sm font-medium text-white/90">{formData.employee_scale}</p>
                </div>
              </div>
            )}

            {formData.registration_capital && (
              <div className="flex items-start gap-3">
                <Wallet size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">注册资本</p>
                  <p className="text-sm font-medium text-white/90">{formData.registration_capital} 万元</p>
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
              <Clock size={20} className="text-amber-600" />
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
  )
}
