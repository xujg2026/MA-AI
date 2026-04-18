import { useState } from 'react'
import { ddChecklist } from '../../data/mockData'
import { getQccApi, setQccApiKey } from '../../services/qccApi'
import {
  FileText,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronRight,
  Download,
  Search,
  AlertTriangle,
  Shield,
  TrendingUp,
  AlertCircle,
  Eye,
  Loader2,
  Building2,
  User,
  DollarSign,
  Calendar,
  MapPin,
} from 'lucide-react'
import { Card, Button, Badge } from '../ui'

// 企查查 API Key
const QCC_API_KEY = 'MohHnWYT7LapgQkP1OGpVHpyS1gLZo2kMkgjvNZoTj5QcvS7'

export default function AIDueDiligence() {
  const [expandedSections, setExpandedSections] = useState(['法务', '技术'])
  const [checkedItems, setCheckedItems] = useState({})
  const [customItem, setCustomItem] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [companyInfo, setCompanyInfo] = useState(null)
  const [qccError, setQccError] = useState(null)
  const [ddApiData, setDdApiData] = useState(null) // 存储从API获取的DD清单数据
  const [expandedItems, setExpandedItems] = useState({}) // 跟踪哪些项目被展开了

  const toggleSection = (section) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    )
  }

  const toggleItem = (section, item) => {
    const key = `${section}-${item}`
    const newChecked = !checkedItems[key]

    setCheckedItems((prev) => ({
      ...prev,
      [key]: newChecked,
    }))

    // 如果勾选，则展开详情；如果取消勾选，则折叠
    if (newChecked) {
      setExpandedItems((prev) => ({ ...prev, [key]: true }))
      // 同时展开对应的section
      if (!expandedSections.includes(section)) {
        setExpandedSections((prev) => [...prev, section])
      }
    } else {
      setExpandedItems((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const toggleItemDetail = (section, item) => {
    const key = `${section}-${item}`
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const addCustomItem = (section) => {
    if (!customItem.trim()) return
    const key = `${section}-${customItem}`
    setCheckedItems((prev) => ({ ...prev, [key]: true }))
    setCustomItem('')
  }

  const getProgress = (section) => {
    const items = ddChecklist[section] || []
    const checked = items.filter((item) => checkedItems[`${section}-${item}`]).length
    return { checked, total: items.length }
  }

  const getOverallProgress = () => {
    const totalItems = Object.values(ddChecklist).flat().length
    const checkedCount = Object.values(checkedItems).filter(Boolean).length
    return { checked: checkedCount, total: totalItems }
  }

  const filteredSections = Object.keys(ddChecklist).filter((section) =>
    section.includes(searchTerm) ||
    ddChecklist[section].some((item) => item.includes(searchTerm))
  )

  const overall = getOverallProgress()
  const progressPercent = overall.total > 0 ? Math.round((overall.checked / overall.total) * 100) : 0

  // 使用企查查API进行风险分析
  const runRiskAnalysis = async () => {
    if (!selectedCompany.trim()) return

    setIsAnalyzing(true)
    setQccError(null)
    setCompanyInfo(null)
    setAnalysisResult(null)

    console.log('开始企查查API调用...')
    setQccApiKey(QCC_API_KEY)
    const qccApi = getQccApi()

    if (!qccApi) {
      setQccError('企查查API服务初始化失败')
      setIsAnalyzing(false)
      return
    }

    try {
      // 并行获取所有数据
      console.log('并行获取公司数据:', selectedCompany)
      const allData = await qccApi.getAllCompanyData(selectedCompany)
      console.log('全部数据返回:', allData)

      // 解析公司基本信息
      const companyData = allData.companyInfo
      if (companyData && !companyData.error) {
        const basicInfo = {
          name: companyData.企业名称 || selectedCompany,
          creditCode: companyData.统一社会信用代码 || '-',
          legalPerson: companyData.法定代表人 || '-',
          registeredCapital: companyData.注册资本 || '-',
          paidCapital: companyData.实缴资本 || '-',
          status: companyData.登记状态 || '-',
          startDate: companyData.成立日期 || '-',
          companyType: companyData.企业类型 || '-',
          scope: companyData.经营范围 || '-',
          address: companyData.注册地址 || '-',
        }
        setCompanyInfo(basicInfo)
      } else if (companyData?.error) {
        console.log('公司信息获取失败:', companyData.error)
      }

      // 解析风险数据
      const criticalRisks = []
      const highRisks = []

      // 关键风险检查
      const dishonestData = allData.dishonestInfo
      if (dishonestData && !dishonestData.error && dishonestData.搜索结果) {
        if (!dishonestData.搜索结果.includes('未发现任何')) {
          criticalRisks.push({ type: '失信记录', count: 1 })
        }
      }

      const caseData = allData.caseFilingInfo
      if (caseData && !caseData.error && caseData.立案信息) {
        const caseCount = caseData.立案信息.length || 0
        if (caseCount > 0) {
          highRisks.push({ type: '立案信息', count: caseCount })
        }
      }

      const businessExceptionData = allData.businessException
      if (businessExceptionData && !businessExceptionData.error && businessExceptionData.搜索结果) {
        if (!businessExceptionData.搜索结果.includes('未发现任何')) {
          criticalRisks.push({ type: '经营异常', count: 1 })
        }
      }

      const penaltyData = allData.administrativePenalty
      if (penaltyData && !penaltyData.error && penaltyData.搜索结果) {
        if (!penaltyData.搜索结果.includes('未发现')) {
          highRisks.push({ type: '行政处罚', count: 1 })
        }
      }

      // 解析股东和实控人信息
      let shareholderData = null
      let controllerData = null
      if (allData.shareholderInfo && !allData.shareholderInfo.error) {
        shareholderData = allData.shareholderInfo
      }
      if (allData.actualController && !allData.actualController.error) {
        controllerData = allData.actualController
      }

      // 计算综合风险指数
      let overall = 85 // 基础分
      if (criticalRisks.length > 0) overall -= criticalRisks.length * 15
      if (highRisks.length > 0) overall -= highRisks.length * 8
      overall = Math.max(0, Math.min(100, overall))

      // 基于API数据计算风险热力图各项指标
      const patentCount = allData.patentInfo?.专利信息?.length || 0
      const trademarkCount = allData.trademarkInfo?.商标信息?.length || 0
      const biddingCount = allData.biddingInfo?.招投标信息?.length || 0
      const qualificationCount = allData.qualifications?.资质证书信息?.length || 0
      const caseCount = caseData?.立案信息?.length || 0
      const shareholderCount = shareholderData?.股东信息?.length || 0

      // 计算各项热力图指标
      const heatMapData = [
        {
          area: '合规风险',
          score: criticalRisks.length === 0 && highRisks.length === 0 ? 95 : overall,
          status: criticalRisks.length === 0 && highRisks.length === 0 ? 'low' : 'high',
          trend: criticalRisks.length === 0 ? '+0%' : `-${criticalRisks.length * 15}%`
        },
        {
          area: '法律风险',
          score: caseCount === 0 ? 90 : Math.max(40, 90 - caseCount * 2),
          status: caseCount === 0 ? 'low' : caseCount < 10 ? 'medium' : 'high',
          trend: caseCount === 0 ? '+0%' : `+${caseCount}起`
        },
        {
          area: '知识产权',
          score: patentCount > 10000 ? 95 : patentCount > 1000 ? 85 : 70,
          status: patentCount > 1000 ? 'low' : patentCount > 100 ? 'medium' : 'high',
          trend: `+${patentCount}件`
        },
        {
          area: '经营活跃',
          score: biddingCount > 1000 ? 90 : biddingCount > 100 ? 75 : 60,
          status: biddingCount > 100 ? 'low' : 'medium',
          trend: `+${biddingCount}次`
        },
        {
          area: '团队稳定',
          score: shareholderCount > 5 ? 80 : 85,
          status: 'low',
          trend: '+0%'
        },
        {
          area: '资质齐全',
          score: qualificationCount > 100 ? 95 : qualificationCount > 10 ? 85 : 70,
          status: qualificationCount > 10 ? 'low' : 'medium',
          trend: `+${qualificationCount}个`
        }
      ]

      // 生成风险分析结果
      const riskResult = {
        overall,
        financial: {
          score: overall + 5,
          risks: ['需结合财务报表分析']
        },
        legal: {
          score: overall - 5,
          risks: [
            ...criticalRisks.map(r => `${r.type}(${r.count}条)`),
            ...highRisks.map(r => `${r.type}(${r.count}条)`)
          ]
        },
        business: {
          score: overall + 3,
          risks: ['需结合业务尽调分析']
        },
        compliance: {
          score: overall + 8,
          risks: criticalRisks.length === 0 && highRisks.length === 0 ? ['未发现明显合规问题'] : []
        },
        // 风险热力图数据
        heatMap: heatMapData,
        // 额外的企查查数据
        qccData: {
          criticalRisks,
          highRisks,
          totalLawsuits: caseCount,
          totalPenalties: penaltyData ? 1 : 0,
          businessExceptions: businessExceptionData ? 1 : 0,
          shareholderInfo: shareholderData,
          actualController: controllerData,
          patentCount,
          trademarkCount,
          biddingCount,
          qualificationCount,
        }
      }

      // 存储DD清单相关数据
      const apiData = {
        // 公司概况
        companyInfo: companyData,
        shareholderInfo: shareholderData,
        actualController: controllerData,
        externalInvestments: allData.externalInvestments,
        changeRecords: allData.changeRecords,
        keyPersonnel: allData.keyPersonnel,
        // 法务
        patentInfo: allData.patentInfo,
        trademarkInfo: allData.trademarkInfo,
        caseFilingInfo: caseData,
        judicialDocuments: allData.judicialDocuments,
        // 技术
        softwareCopyright: allData.softwareCopyright,
        // 经营
        biddingInfo: allData.biddingInfo,
        qualifications: allData.qualifications,
        creditEvaluation: allData.creditEvaluation,
        recruitmentInfo: allData.recruitmentInfo,
      }
      setDdApiData(apiData)

      // 自动标记企查查支持的项目为已完成，并展开详情
      const newCheckedItems = { ...checkedItems }
      const newExpandedItems = { ...expandedItems }
      const newExpandedSections = [...expandedSections]
      const sectionsToExpand = new Set()

      // 公司概况
      if (companyData && !companyData.error) {
        newCheckedItems['公司概况-公司基本信息'] = true
        newExpandedItems['公司概况-公司基本信息'] = true
        sectionsToExpand.add('公司概况')
      }
      if (shareholderData && !shareholderData.error) {
        newCheckedItems['公司概况-股权结构'] = true
        newExpandedItems['公司概况-股权结构'] = true
        sectionsToExpand.add('公司概况')
      }
      if (allData.externalInvestments && !allData.externalInvestments.error) {
        newCheckedItems['公司概况-对外投资'] = true
        newExpandedItems['公司概况-对外投资'] = true
        sectionsToExpand.add('公司概况')
      }
      if (allData.changeRecords && !allData.changeRecords.error) {
        newCheckedItems['公司概况-变更记录'] = true
        newExpandedItems['公司概况-变更记录'] = true
        sectionsToExpand.add('公司概况')
      }

      // 法务
      if (allData.patentInfo && !allData.patentInfo.error) {
        newCheckedItems['法务-知识产权证明'] = true
        newExpandedItems['法务-知识产权证明'] = true
        newCheckedItems['技术-技术专利清单'] = true
        newExpandedItems['技术-技术专利清单'] = true
        sectionsToExpand.add('法务')
        sectionsToExpand.add('技术')
      }
      if (caseData && !caseData.error) {
        newCheckedItems['法务-诉讼记录'] = true
        newExpandedItems['法务-诉讼记录'] = true
        sectionsToExpand.add('法务')
      }
      if (allData.judicialDocuments && !allData.judicialDocuments.error) {
        newCheckedItems['法务-司法风险'] = true
        newExpandedItems['法务-司法风险'] = true
        sectionsToExpand.add('法务')
      }

      // 技术
      if (allData.softwareCopyright && !allData.softwareCopyright.error) {
        newCheckedItems['技术-软件著作权'] = true
        newExpandedItems['技术-软件著作权'] = true
        sectionsToExpand.add('技术')
      }

      // 经营
      if (allData.biddingInfo && !allData.biddingInfo.error) {
        newCheckedItems['经营-招投标情况'] = true
        newExpandedItems['经营-招投标情况'] = true
        sectionsToExpand.add('经营')
      }
      if (allData.qualifications && !allData.qualifications.error) {
        newCheckedItems['经营-资质证书'] = true
        newExpandedItems['经营-资质证书'] = true
        sectionsToExpand.add('经营')
      }
      if (allData.creditEvaluation && !allData.creditEvaluation.error) {
        newCheckedItems['经营-信用评价'] = true
        newExpandedItems['经营-信用评价'] = true
        sectionsToExpand.add('经营')
      }
      if (allData.recruitmentInfo && !allData.recruitmentInfo.error) {
        newCheckedItems['经营-招聘信息'] = true
        newExpandedItems['经营-招聘信息'] = true
        sectionsToExpand.add('经营')
      }

      // 添加需要展开的section
      sectionsToExpand.forEach(section => {
        if (!newExpandedSections.includes(section)) {
          newExpandedSections.push(section)
        }
      })

      setCheckedItems(newCheckedItems)
      setExpandedItems(newExpandedItems)
      setExpandedSections(newExpandedSections)

      setAnalysisResult(riskResult)

      // 如果所有API调用都失败
      if (companyData?.error && !allData.dishonestInfo?.error === false) {
        setQccError('部分数据获取失败，已展示可用数据')
      }

    } catch (error) {
      console.error('企查查API调用失败:', error)

      let errorMessage = error.message || '未知错误'
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'CORS错误或网络问题: API不支持跨域请求，需要后端代理'
      }

      setQccError(`API调用失败: ${errorMessage}`)
    }

    setIsAnalyzing(false)
  }

  const getRiskStatusColor = (status) => {
    switch (status) {
      case 'low': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'high': return 'bg-red-100 text-red-700'
      case 'critical': return 'bg-red-200 text-red-800'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // 导出DD清单为JSON
  const exportDDChecklistJson = () => {
    const exportData = {
      companyName: selectedCompany,
      exportDate: new Date().toISOString().split('T')[0],
      companyInfo: companyInfo,
      riskAnalysis: analysisResult,
      ddChecklist: {},
      apiDataSummary: {},
    }

    // 构建DD清单状态
    Object.keys(ddChecklist).forEach(section => {
      exportData.ddChecklist[section] = {}
      ddChecklist[section].forEach(item => {
        const key = `${section}-${item}`
        exportData.ddChecklist[section][item] = {
          completed: !!checkedItems[key],
          hasApiData: !!ddApiData && !!checkedItems[key],
        }
      })
    })

    // API数据摘要
    if (ddApiData) {
      if (ddApiData.shareholderInfo && !ddApiData.shareholderInfo.error) {
        exportData.apiDataSummary.shareholderInfo = ddApiData.shareholderInfo.股东信息
      }
      if (ddApiData.patentInfo && !ddApiData.patentInfo.error) {
        exportData.apiDataSummary.patentCount = ddApiData.patentInfo.专利信息?.length || 0
        exportData.apiDataSummary.patentSummary = ddApiData.patentInfo.摘要
      }
      if (ddApiData.caseFilingInfo && !ddApiData.caseFilingInfo.error) {
        exportData.apiDataSummary.caseFilingInfo = ddApiData.caseFilingInfo.立案信息
      }
      if (ddApiData.actualController && !ddApiData.actualController.error) {
        exportData.apiDataSummary.actualController = ddApiData.actualController.实际控制人信息
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DD-Checklist-${selectedCompany}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 导出DD清单为Markdown
  const exportDDChecklistMarkdown = () => {
    let md = `# DD清单导出\n\n`
    md += `**公司名称**: ${selectedCompany || '未指定'}\n\n`
    md += `**导出时间**: ${new Date().toISOString().split('T')[0]}\n\n`
    md += `---\n\n`

    // 公司信息
    if (companyInfo) {
      md += `## 企业工商信息\n\n`
      md += `| 项目 | 内容 |\n`
      md += `|------|------|\n`
      md += `| 企业名称 | ${companyInfo.name} |\n`
      md += `| 统一社会信用代码 | ${companyInfo.creditCode} |\n`
      md += `| 法定代表人 | ${companyInfo.legalPerson} |\n`
      md += `| 注册资本 | ${companyInfo.registeredCapital} |\n`
      md += `| 成立日期 | ${companyInfo.startDate} |\n`
      md += `| 经营状态 | ${companyInfo.status} |\n`
      md += `| 注册地址 | ${companyInfo.address} |\n\n`
    }

    // 风险分析
    if (analysisResult) {
      md += `## 风险分析\n\n`
      md += `- **综合风险指数**: ${analysisResult.overall}\n`
      md += `- **合规风险**: ${analysisResult.compliance.risks.join(', ') || '未发现明显合规问题'}\n\n`
    }

    // DD清单
    md += `## DD清单\n\n`
    Object.keys(ddChecklist).forEach(section => {
      md += `### ${section}\n\n`
      ddChecklist[section].forEach(item => {
        const key = `${section}-${item}`
        const isCompleted = !!checkedItems[key]
        const hasApiData = !!ddApiData && isCompleted
        md += `- [${isCompleted ? 'x' : ' '}] ${item}${hasApiData ? ' ✓' : ''}\n`
      })
      md += `\n`
    })

    // API数据摘要
    if (ddApiData) {
      md += `## 企查查API数据摘要\n\n`

      if (ddApiData.shareholderInfo && !ddApiData.shareholderInfo.error) {
        const shareholders = ddApiData.shareholderInfo.股东信息 || []
        md += `### 股东信息\n\n`
        shareholders.forEach(s => {
          md += `- ${s.股东名称}: ${s.持股比例}\n`
        })
        md += `\n`
      }

      if (ddApiData.patentInfo && !ddApiData.patentInfo.error) {
        const patentCount = ddApiData.patentInfo.专利信息?.length || 0
        md += `### 专利信息\n\n`
        md += `共 ${patentCount} 件专利\n\n`
        // 显示前5条
        const patents = ddApiData.patentInfo.专利信息 || []
        patents.slice(0, 5).forEach(p => {
          md += `- ${p.发明名称} (${p.申请号}) - ${p.专利类型}\n`
        })
        if (patents.length > 5) {
          md += `- ...还有 ${patents.length - 5} 条\n`
        }
        md += `\n`
      }

      if (ddApiData.caseFilingInfo && !ddApiData.caseFilingInfo.error) {
        const cases = ddApiData.caseFilingInfo.立案信息 || []
        md += `### 立案信息\n\n`
        md += `共 ${cases.length} 起立案\n\n`
        cases.slice(0, 5).forEach(c => {
          md += `- [${c.案号}] ${c.案由} (${c.立案日期})\n`
        })
        if (cases.length > 5) {
          md += `- ...还有 ${cases.length - 5} 条\n`
        }
        md += `\n`
      }

      if (ddApiData.actualController && !ddApiData.actualController.error) {
        const controllers = ddApiData.actualController.实际控制人信息 || []
        md += `### 实控人信息\n\n`
        controllers.forEach(c => {
          md += `- ${c.实际控制人名称}: 持股${c.总持股比例}, 表决权${c.表决权比例}\n`
        })
        md += `\n`
      }
    }

    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DD-Checklist-${selectedCompany || 'company'}-${new Date().toISOString().split('T')[0]}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card padding="md" className="bg-gradient-to-br from-primary/5 to-transparent">
          <p className="text-sm text-gray-500 mb-1">完成进度</p>
          <p className="text-2xl font-bold text-primary">{progressPercent}%</p>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </Card>
        <Card padding="md" className="bg-gradient-to-br from-green-50 to-transparent">
          <p className="text-sm text-gray-500 mb-1">已完成</p>
          <p className="text-2xl font-bold text-green-600">{overall.checked}</p>
        </Card>
        <Card padding="md" className="bg-gradient-to-br from-orange-50 to-transparent">
          <p className="text-sm text-gray-500 mb-1">待完成</p>
          <p className="text-2xl font-bold text-orange-600">{overall.total - overall.checked}</p>
        </Card>
        <Card padding="md" className="bg-gradient-to-br from-red-50 to-transparent">
          <p className="text-sm text-gray-500 mb-1">风险提示</p>
          <p className="text-2xl font-bold text-red-600 flex items-center gap-1">
            <AlertTriangle size={20} />
            {Math.floor((overall.total - overall.checked) * 0.2)}
          </p>
        </Card>
      </div>

      {/* AI Risk Analysis Section */}
      <Card padding="lg" className="bg-gradient-to-r from-slate-50 to-blue-50">
        <Card.Title className="flex items-center mb-4">
          <Shield size={24} className="mr-2 text-primary" />
          AI风险扫描
          <Badge variant="info" className="ml-2">企查查实时数据</Badge>
        </Card.Title>
        <p className="text-sm text-gray-500 mb-4">
          基于企查查实时数据自动分析公司工商信息、风险记录、司法诉讼等，识别潜在风险点
        </p>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Company Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                输入目标公司名称
              </label>
              <input
                type="text"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                placeholder="例如：北京智云科技有限公司"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              />
            </div>
            <Button
              variant="primary"
              icon={isAnalyzing ? Loader2 : Eye}
              onClick={runRiskAnalysis}
              disabled={!selectedCompany || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  AI正在扫描风险...
                </>
              ) : (
                '启动AI风险扫描'
              )}
            </Button>
            {qccError && (
              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                {qccError}
              </p>
            )}
          </div>

          {/* Company Info Display */}
          {companyInfo && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Building2 size={16} className="mr-2 text-primary" />
                企业工商信息
              </h4>
              <div className="bg-white rounded-xl p-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center text-gray-500">
                    <User size={14} className="mr-1" />
                    法定代表人
                  </div>
                  <div className="text-gray-900 font-medium">{companyInfo.legalPerson}</div>

                  <div className="flex items-center text-gray-500">
                    <DollarSign size={14} className="mr-1" />
                    注册资本
                  </div>
                  <div className="text-gray-900">{companyInfo.registeredCapital}</div>

                  <div className="flex items-center text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    成立日期
                  </div>
                  <div className="text-gray-900">{companyInfo.startDate}</div>

                  <div className="flex items-center text-gray-500">
                    <TrendingUp size={14} className="mr-1" />
                    经营状态
                  </div>
                  <div className="text-gray-900">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      companyInfo.status === '存续' || companyInfo.status === '在业'
                        ? 'bg-green-100 text-green-700'
                        : companyInfo.status === '吊销' || companyInfo.status === '注销'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {companyInfo.status}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-500">
                    <MapPin size={14} className="mr-1" />
                    注册地址
                  </div>
                  <div className="text-gray-900 text-xs truncate">{companyInfo.address || '-'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Heat Map */}
          {analysisResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">风险热力图</h4>
                <Badge variant={analysisResult.overall >= 70 ? 'success' : analysisResult.overall >= 50 ? 'warning' : 'danger'}>
                  综合风险指数: {analysisResult.overall}
                </Badge>
              </div>
              <div className="space-y-2">
                {(analysisResult.heatMap || []).map((item) => (
                  <div key={item.area} className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <span className="text-sm text-gray-700">{item.area}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            item.status === 'low' ? 'bg-green-500' :
                            item.status === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${getRiskStatusColor(item.status)}`}>
                        {item.score}%
                      </span>
                      <span className={`text-xs ${item.trend.startsWith('+') ? 'text-green-600' : item.trend.startsWith('-') ? 'text-red-600' : 'text-gray-500'}`}>
                        {item.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Red Flags Section */}
        {analysisResult && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle size={18} className="mr-2 text-red-500" />
              红线预警（需重点关注）
              {analysisResult.qccData && (
                <Badge variant="info" className="ml-2 text-xs">企查查数据</Badge>
              )}
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              {analysisResult.qccData?.criticalRisks?.length > 0 ? (
                analysisResult.qccData.criticalRisks.map((risk, idx) => (
                  <div key={idx} className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle size={16} className="text-red-600" />
                      <span className="font-medium text-red-700">{risk.type}</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{risk.count}条</p>
                    <p className="text-xs text-red-600/70 mt-1">存在{risk.type}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="font-medium text-green-700">关键风险</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-xs text-green-600/70 mt-1">未发现关键风险</p>
                </div>
              )}

              {analysisResult.qccData?.highRisks?.length > 0 ? (
                analysisResult.qccData.highRisks.map((risk, idx) => (
                  <div key={idx} className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle size={16} className="text-yellow-600" />
                      <span className="font-medium text-yellow-700">{risk.type}</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{risk.count}条</p>
                    <p className="text-xs text-yellow-600/70 mt-1">存在{risk.type}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="font-medium text-green-700">高风险项</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-xs text-green-600/70 mt-1">未发现高风险</p>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText size={16} className="text-blue-600" />
                  <span className="font-medium text-blue-700">综合风险指数</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{analysisResult.overall}</p>
                <p className="text-xs text-blue-600/70 mt-1">
                  {analysisResult.overall >= 70 ? '风险较低' : analysisResult.overall >= 50 ? '存在一定风险' : '风险较高'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Search */}
      <Card padding="md">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索DD清单项目..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-gray-50/50"
          />
        </div>
      </Card>

      {/* Checklist Sections */}
      <div className="space-y-4">
        {(searchTerm ? filteredSections : Object.keys(ddChecklist)).map((section) => {
          const items = ddChecklist[section] || []
          const progress = getProgress(section)
          const isExpanded = expandedSections.includes(section)

          return (
            <Card key={section} padding="none">
              <button
                onClick={() => toggleSection(section)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {isExpanded ? (
                    <ChevronDown size={20} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-400" />
                  )}
                  <span className="font-semibold text-gray-900">{section}</span>
                  <span className="text-sm text-gray-500">
                    ({progress.checked}/{progress.total})
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(progress.checked / progress.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-green-600 font-medium">
                    {Math.round((progress.checked / progress.total) * 100)}%
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100">
                  <div className="p-4 space-y-2">
                    {items.map((item) => {
                      const key = `${section}-${item}`
                      const isChecked = checkedItems[key]
                      const hasApiData = ddApiData && isChecked
                      const isItemExpanded = expandedItems[key]

                      // 渲染API数据详情
                      const renderApiDetail = () => {
                        if (!hasApiData) return null

                        if (item === '股权结构' && ddApiData?.shareholderInfo) {
                          const shareholders = ddApiData.shareholderInfo.股东信息 || []
                          return (
                            <div className="mt-2 space-y-2">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="p-2 text-left">股东名称</th>
                                    <th className="p-2 text-left">持股比例</th>
                                    <th className="p-2 text-left">认缴出资额</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {shareholders.map((s, i) => (
                                    <tr key={i} className="border-t">
                                      <td className="p-2">{s.股东名称}</td>
                                      <td className="p-2">{s.持股比例}</td>
                                      <td className="p-2">{s.认缴出资额}万元</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )
                        }

                        if ((item === '知识产权证明' || item === '技术专利清单') && ddApiData?.patentInfo) {
                          const patents = ddApiData.patentInfo.专利信息 || []
                          const totalPatents = ddApiData.patentInfo.摘要?.match(/\d+/)?.[0] || patents.length
                          const displayPatents = patents.slice(0, 50)
                          return (
                            <div className="mt-2 space-y-2">
                              <p className="text-xs text-gray-500">共 {totalPatents} 件专利，展示前{displayPatents.length}条（可滚动查看更多）：</p>
                              <div className="max-h-96 overflow-y-auto border rounded-lg">
                                <table className="w-full text-xs">
                                  <thead className="sticky top-0 bg-gray-100 shadow-sm">
                                    <tr>
                                      <th className="p-2 text-left">发明名称</th>
                                      <th className="p-2 text-left">申请号</th>
                                      <th className="p-2 text-left">公开(公告)号</th>
                                      <th className="p-2 text-left">类型</th>
                                      <th className="p-2 text-left">状态</th>
                                      <th className="p-2 text-left">申请日期</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {displayPatents.map((p, i) => {
                                      const pubNum = p['公开（公告）号'] || '-'
                                      return (
                                        <tr key={i} className="border-t">
                                          <td className="p-2 max-w-xs truncate" title={p.发明名称}>{p.发明名称}</td>
                                          <td className="p-2">{p.申请号}</td>
                                          <td className="p-2">{pubNum}</td>
                                          <td className="p-2">{p.专利类型}</td>
                                          <td className="p-2">
                                            <span className={`px-1.5 py-0.5 rounded ${p.法律状态 === '授权' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                              {p.法律状态}
                                            </span>
                                          </td>
                                          <td className="p-2">{p.申请日期}</td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )
                        }

                        if (item === '诉讼记录' && ddApiData?.caseFilingInfo) {
                          const cases = ddApiData.caseFilingInfo.立案信息 || []
                          const displayCases = cases.slice(0, 50)
                          return (
                            <div className="mt-2 space-y-2">
                              <p className="text-xs text-gray-500">共 {cases.length} 起立案，展示前{displayCases.length}条（可滚动查看更多）：</p>
                              <div className="max-h-96 overflow-y-auto border rounded-lg">
                                <table className="w-full text-xs">
                                  <thead className="sticky top-0 bg-gray-100 shadow-sm">
                                    <tr>
                                      <th className="p-2 text-left">案号</th>
                                      <th className="p-2 text-left">案由</th>
                                      <th className="p-2 text-left">法院</th>
                                      <th className="p-2 text-left">立案日期</th>
                                      <th className="p-2 text-left">原告</th>
                                      <th className="p-2 text-left">被告</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {displayCases.map((c, i) => (
                                      <tr key={i} className="border-t">
                                        <td className="p-2 max-w-xs truncate">{c.案号}</td>
                                        <td className="p-2">{c.案由}</td>
                                        <td className="p-2">{c.法院}</td>
                                        <td className="p-2">{c.立案日期}</td>
                                        <td className="p-2 max-w-xs truncate" title={c.当事人?.原告?.join(', ')}>
                                          {c.当事人?.原告?.join(', ') || '-'}
                                        </td>
                                        <td className="p-2 max-w-xs truncate" title={c.当事人?.被告?.join(', ')}>
                                          {c.当事人?.被告?.join(', ') || '-'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )
                        }

                        // 公司基本信息
                        if (item === '公司基本信息' && ddApiData?.companyInfo) {
                          const info = ddApiData.companyInfo
                          return (
                            <div className="mt-2">
                              <table className="w-full text-xs">
                                <tbody>
                                  <tr className="border-b"><td className="p-2 text-gray-500 w-28">企业名称</td><td className="p-2">{info.企业名称}</td></tr>
                                  <tr className="border-b"><td className="p-2 text-gray-500">统一社会信用代码</td><td className="p-2">{info.统一社会信用代码}</td></tr>
                                  <tr className="border-b"><td className="p-2 text-gray-500">法定代表人</td><td className="p-2">{info.法定代表人}</td></tr>
                                  <tr className="border-b"><td className="p-2 text-gray-500">注册资本</td><td className="p-2">{info.注册资本}</td></tr>
                                  <tr className="border-b"><td className="p-2 text-gray-500">成立日期</td><td className="p-2">{info.成立日期}</td></tr>
                                  <tr className="border-b"><td className="p-2 text-gray-500">经营状态</td><td className="p-2">{info.登记状态}</td></tr>
                                  <tr className="border-b"><td className="p-2 text-gray-500">企业类型</td><td className="p-2">{info.企业类型}</td></tr>
                                  <tr className="border-b"><td className="p-2 text-gray-500">注册地址</td><td className="p-2">{info.注册地址}</td></tr>
                                </tbody>
                              </table>
                            </div>
                          )
                        }

                        // 对外投资
                        if (item === '对外投资' && ddApiData?.externalInvestments) {
                          const investments = ddApiData.externalInvestments.对外投资信息 || []
                          const total = ddApiData.externalInvestments.摘要?.match(/\d+/)?.[0] || investments.length
                          return (
                            <div className="mt-2 space-y-2">
                              <p className="text-xs text-gray-500">共对外投资 {total} 个公司，展示前10条：</p>
                              <div className="max-h-48 overflow-y-auto border rounded-lg">
                                <table className="w-full text-xs">
                                  <thead className="sticky top-0 bg-gray-100">
                                    <tr>
                                      <th className="p-2 text-left">被投资企业</th>
                                      <th className="p-2 text-left">持股比例</th>
                                      <th className="p-2 text-left">认缴出资额</th>
                                      <th className="p-2 text-left">成立日期</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {investments.slice(0, 10).map((inv, i) => (
                                      <tr key={i} className="border-t">
                                        <td className="p-2">{inv.被投资企业名称 || inv.企业名称}</td>
                                        <td className="p-2">{inv.持股比例 || '-'}</td>
                                        <td className="p-2">{inv.认缴出资额 || '-'}万元</td>
                                        <td className="p-2">{inv.成立日期 || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )
                        }

                        // 变更记录
                        if (item === '变更记录' && ddApiData?.changeRecords) {
                          const changes = ddApiData.changeRecords.变更记录 || []
                          return (
                            <div className="mt-2 space-y-2">
                              <p className="text-xs text-gray-500">共 {changes.length} 条变更记录，展示前10条：</p>
                              <div className="max-h-48 overflow-y-auto border rounded-lg">
                                <table className="w-full text-xs">
                                  <thead className="sticky top-0 bg-gray-100">
                                    <tr>
                                      <th className="p-2 text-left">变更事项</th>
                                      <th className="p-2 text-left">变更前</th>
                                      <th className="p-2 text-left">变更后</th>
                                      <th className="p-2 text-left">变更日期</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {changes.slice(0, 10).map((c, i) => (
                                      <tr key={i} className="border-t">
                                        <td className="p-2">{c.变更事项}</td>
                                        <td className="p-2 max-w-xs truncate">{c.变更前 || '-'}</td>
                                        <td className="p-2 max-w-xs truncate">{c.变更后 || '-'}</td>
                                        <td className="p-2">{c.变更日期}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )
                        }

                        // 司法风险 - 裁判文书
                        if (item === '司法风险' && ddApiData?.judicialDocuments) {
                          const docs = ddApiData.judicialDocuments.裁判文书 || []
                          return (
                            <div className="mt-2 space-y-2">
                              <p className="text-xs text-gray-500">共 {docs.length} 条裁判文书，展示前10条：</p>
                              <div className="max-h-48 overflow-y-auto border rounded-lg">
                                <table className="w-full text-xs">
                                  <thead className="sticky top-0 bg-gray-100">
                                    <tr>
                                      <th className="p-2 text-left">案号</th>
                                      <th className="p-2 text-left">案由</th>
                                      <th className="p-2 text-left">裁判结果</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {docs.slice(0, 10).map((d, i) => (
                                      <tr key={i} className="border-t">
                                        <td className="p-2 max-w-xs truncate">{d.案号}</td>
                                        <td className="p-2">{d.案由}</td>
                                        <td className="p-2 max-w-xs truncate">{d.裁判结果 || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )
                        }

                        // 软件著作权
                        if (item === '软件著作权' && ddApiData?.softwareCopyright) {
                          const copyrights = ddApiData.softwareCopyright.软件著作权 || []
                          const total = ddApiData.softwareCopyright.摘要?.match(/\d+/)?.[0] || copyrights.length
                          return (
                            <div className="mt-2 space-y-2">
                              <p className="text-xs text-gray-500">共 {total} 个软件著作权，展示前10条：</p>
                              <div className="max-h-48 overflow-y-auto border rounded-lg">
                                <table className="w-full text-xs">
                                  <thead className="sticky top-0 bg-gray-100">
                                    <tr>
                                      <th className="p-2 text-left">软件名称</th>
                                      <th className="p-2 text-left">登记号</th>
                                      <th className="p-2 text-left">版本号</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {copyrights.slice(0, 10).map((c, i) => (
                                      <tr key={i} className="border-t">
                                        <td className="p-2">{c.软件名称 || c.作品名称}</td>
                                        <td className="p-2">{c.登记号}</td>
                                        <td className="p-2">{c.版本号 || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )
                        }

                        // 招投标情况
                        if (item === '招投标情况' && ddApiData?.biddingInfo) {
                          const biddings = ddApiData.biddingInfo.招投标信息 || []
                          return (
                            <div className="mt-2 space-y-2">
                              <p className="text-xs text-gray-500">共 {biddings.length} 条招投标记录，展示前10条：</p>
                              <div className="max-h-48 overflow-y-auto border rounded-lg">
                                <table className="w-full text-xs">
                                  <thead className="sticky top-0 bg-gray-100">
                                    <tr>
                                      <th className="p-2 text-left">项目名称</th>
                                      <th className="p-2 text-left">中标单位</th>
                                      <th className="p-2 text-left">中标金额</th>
                                      <th className="p-2 text-left">日期</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {biddings.slice(0, 10).map((b, i) => (
                                      <tr key={i} className="border-t">
                                        <td className="p-2 max-w-xs truncate">{b.项目名称}</td>
                                        <td className="p-2">{b.中标单位?.join(', ') || '-'}</td>
                                        <td className="p-2">{b.中标金额 || '-'}</td>
                                        <td className="p-2">{b.发布日期}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )
                        }

                        // 资质证书
                        if (item === '资质证书' && ddApiData?.qualifications) {
                          const quals = ddApiData.qualifications.资质证书信息 || []
                          const total = ddApiData.qualifications.摘要?.match(/\d+/)?.[0] || quals.length
                          return (
                            <div className="mt-2 space-y-2">
                              <p className="text-xs text-gray-500">共 {total} 个资质证书，展示前10条：</p>
                              <div className="max-h-48 overflow-y-auto border rounded-lg">
                                <table className="w-full text-xs">
                                  <thead className="sticky top-0 bg-gray-100">
                                    <tr>
                                      <th className="p-2 text-left">资质名称</th>
                                      <th className="p-2 text-left">证书编号</th>
                                      <th className="p-2 text-left">有效期至</th>
                                      <th className="p-2 text-left">状态</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {quals.slice(0, 10).map((q, i) => (
                                      <tr key={i} className="border-t">
                                        <td className="p-2">{q.资质名称}</td>
                                        <td className="p-2">{q.证书编号}</td>
                                        <td className="p-2">{q.有效期至}</td>
                                        <td className="p-2">
                                          <span className={`px-1.5 py-0.5 rounded ${q.证书状态 === '有效' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {q.证书状态}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )
                        }

                        // 信用评价
                        if (item === '信用评价' && ddApiData?.creditEvaluation) {
                          const credit = ddApiData.creditEvaluation
                          return (
                            <div className="mt-2">
                              <table className="w-full text-xs">
                                <tbody>
                                  <tr className="border-b"><td className="p-2 text-gray-500">信用评级</td><td className="p-2">{credit.信用评级 || '-'}</td></tr>
                                  <tr className="border-b"><td className="p-2 text-gray-500">评价日期</td><td className="p-2">{credit.评价日期 || '-'}</td></tr>
                                  <tr className="border-b"><td className="p-2 text-gray-500">评价机构</td><td className="p-2">{credit.评价机构 || '-'}</td></tr>
                                </tbody>
                              </table>
                            </div>
                          )
                        }

                        // 招聘信息
                        if (item === '招聘信息' && ddApiData?.recruitmentInfo) {
                          const recruits = ddApiData.recruitmentInfo.招聘信息 || []
                          const total = ddApiData.recruitmentInfo.摘要?.match(/\d+/)?.[0] || recruits.length
                          return (
                            <div className="mt-2 space-y-2">
                              <p className="text-xs text-gray-500">共 {total} 条招聘记录，展示前10条：</p>
                              <div className="max-h-48 overflow-y-auto border rounded-lg">
                                <table className="w-full text-xs">
                                  <thead className="sticky top-0 bg-gray-100">
                                    <tr>
                                      <th className="p-2 text-left">职位名称</th>
                                      <th className="p-2 text-left">工作地点</th>
                                      <th className="p-2 text-left">薪资范围</th>
                                      <th className="p-2 text-left">发布日期</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {recruits.slice(0, 10).map((r, i) => (
                                      <tr key={i} className="border-t">
                                        <td className="p-2">{r.职位名称}</td>
                                        <td className="p-2">{r.工作地点 || '-'}</td>
                                        <td className="p-2">{r.薪资范围 || '-'}</td>
                                        <td className="p-2">{r.发布日期}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )
                        }

                        return null
                      }

                      return (
                        <div key={item} className="space-y-1">
                          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={isChecked || false}
                              onChange={() => toggleItem(section, item)}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            {isChecked ? (
                              <CheckCircle size={18} className="text-green-500" />
                            ) : (
                              <Circle size={18} className="text-gray-300" />
                            )}
                            <span className={`text-sm flex-1 ${isChecked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                              {item}
                            </span>
                            {hasApiData && (
                              <button
                                onClick={() => toggleItemDetail(section, item)}
                                className="text-xs text-primary hover:underline"
                              >
                                {isItemExpanded ? '收起' : '查看详情'}
                              </button>
                            )}
                            {hasApiData && (
                              <Badge variant="success" className="text-xs">
                                已获取
                              </Badge>
                            )}
                          </div>
                          {isItemExpanded && renderApiDetail()}
                        </div>
                      )
                    })}

                    {/* Add Custom Item */}
                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                      <input
                        type="text"
                        value={customItem}
                        onChange={(e) => setCustomItem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomItem(section)}
                        placeholder="添加自定义清单项..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-gray-50/50"
                      />
                      <Button variant="primary" size="sm" onClick={() => addCustomItem(section)}>
                        添加
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Export */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" icon={Download} onClick={exportDDChecklistJson}>
          导出JSON
        </Button>
        <Button variant="primary" icon={Download} onClick={exportDDChecklistMarkdown}>
          导出Markdown
        </Button>
      </div>
    </div>
  )
}
