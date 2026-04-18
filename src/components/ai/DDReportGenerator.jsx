import { useState, useRef } from 'react'
import { generateSampleReportData, ddReportStructure } from '../../data/ddReportTemplate'
import {
  FileText,
  Download,
  Building2,
  Calendar,
  MapPin,
  User,
  DollarSign,
  TrendingUp,
  Loader2,
  Eye,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'

export default function DDReportGenerator({ onComplete }) {
  const [companyName, setCompanyName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [activeTab, setActiveTab] = useState('input') // input, preview
  const [expandedSections, setExpandedSections] = useState({})
  const reportRef = useRef(null)

  const handleGenerate = () => {
    if (!companyName.trim()) return

    setIsGenerating(true)

    // 模拟AI生成过程
    setTimeout(() => {
      const data = generateSampleReportData(companyName)
      setReportData(data)
      setIsGenerating(false)
      setActiveTab('preview')

      // 默认展开所有部分
      const allExpanded = {}
      ddReportStructure.sections.forEach((section) => {
        allExpanded[section.id] = true
      })
      setExpandedSections(allExpanded)
    }, 2000)
  }

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const handleDownload = async () => {
    if (!reportRef.current) return

    try {
      const html2pdf = (await import('html2pdf.js')).default
      const element = reportRef.current

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${companyName || '目标公司'}_AI推荐书.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }

      await html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error('PDF生成失败:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'input'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={18} className="inline mr-2" />
            生成报告
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            disabled={!reportData}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'preview' && reportData
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-500'
            } ${!reportData ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Eye size={18} className="inline mr-2" />
            预览报告
          </button>
        </div>

        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="p-8">
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4 shadow-soft">
                  <Sparkles size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">AI推荐书生成</h2>
                <p className="text-gray-600">
                  输入公司名称，AI将基于专业模板生成投资推荐书
                </p>
              </div>

              {/* Input Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 size={16} className="inline mr-2" />
                    公司名称
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="请输入目标公司名称"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-lg"
                  />
                </div>

                {/* Template Preview */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText size={18} className="mr-2 text-primary" />
                    报告将包含以下内容
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {ddReportStructure.sections.slice(0, 6).map((section) => (
                      <div
                        key={section.id}
                        className="flex items-center space-x-2 text-sm text-gray-600"
                      >
                        <CheckCircle size={14} className="text-green-500" />
                        <span>{section.title}</span>
                      </div>
                    ))}
                    <div className="col-span-2 text-sm text-gray-500 mt-2">
                      ...共{ddReportStructure.sections.length}个章节
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={!companyName.trim() || isGenerating}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center space-x-2 ${
                    !companyName.trim() || isGenerating
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary to-secondary text-white shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={22} className="animate-spin" />
                      <span>AI正在生成报告中...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={22} />
                      <span>生成推荐书</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && reportData && (
          <div className="p-8">
            {/* Preview Actions */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{reportData.companyInfo.name}</h2>
                <p className="text-sm text-gray-500">推荐书预览</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab('input')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  返回修改
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium shadow-soft hover:shadow-soft-lg transition-all"
                >
                  <Download size={18} />
                  <span>下载PDF</span>
                </button>
              </div>
            </div>

            {/* Collapsible Sections */}
            <div className="space-y-3">
              {/* Executive Summary */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection('executive-summary')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900">摘要</span>
                  {expandedSections['executive-summary'] ? (
                    <ChevronDown size={18} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-500" />
                  )}
                </button>
                {expandedSections['executive-summary'] && (
                  <div className="p-4 space-y-4 border-t border-gray-200">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">企业概况</h4>
                      <p className="text-gray-700">{reportData.executiveSummary.companyProfile}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">业务简介</h4>
                      <p className="text-gray-700">{reportData.executiveSummary.businessIntro}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">财务简况</h4>
                      <p className="text-gray-700">{reportData.executiveSummary.financialSummary}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">上市动态</h4>
                      <p className="text-gray-700">{reportData.executiveSummary.ipoStatus}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">投资方案</h4>
                      <p className="text-gray-700">{reportData.executiveSummary.investmentPlan}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">投资收益</h4>
                      <p className="text-gray-700">{reportData.executiveSummary.investmentReturn}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">投资价值</h4>
                      <p className="text-gray-700">{reportData.executiveSummary.investmentValue}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">投资风险</h4>
                      <p className="text-gray-700">{reportData.executiveSummary.investmentRisk}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Sections */}
              {ddReportStructure.sections.slice(1).map((section) => (
                <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-semibold text-gray-900">{section.title}</span>
                    {expandedSections[section.id] ? (
                      <ChevronDown size={18} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={18} className="text-gray-500" />
                    )}
                  </button>
                  {expandedSections[section.id] && (
                    <div className="p-4">
                      <p className="text-gray-500 text-sm italic">
                        [此处需要根据尽职调查实际情况填写详细内容...]
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hidden Report Template for PDF Generation */}
      <div className="hidden">
        <div ref={reportRef} className="p-8 bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
          {reportData && <ReportDocument data={reportData} />}
        </div>
      </div>
    </div>
  )
}

// PDF文档组件
function ReportDocument({ data }) {
  const pdfSections = [
    { id: 'company-basics', title: '1 公司基本情况' },
    { id: 'main-business', title: '2 主营业务' },
    { id: 'industry-analysis', title: '3 行业分析' },
    { id: 'governance', title: '4 公司治理与管理' },
    { id: 'financial', title: '5 公司财务情况' },
    { id: 'growth', title: '6 增长路径及盈利预测' },
  ]

  return (
    <div className="font-sans text-sm" style={{ fontFamily: 'SimSun, serif' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">{data.companyInfo.name}</h1>
        <h2 className="text-xl">尽职调查及投资分析报告</h2>
      </div>

      <div className="text-center mb-8 text-gray-600">
        <p>{data.preparedBy}</p>
        <p>{data.reportDate}</p>
      </div>

      {/* Legal Notice */}
      <div className="mb-8 p-4 bg-gray-100">
        <h3 className="font-bold mb-2">【法律声明】</h3>
        <p className="text-xs leading-relaxed">
          本报告系{data.preparedBy}对{data.companyInfo.name}进行投资前尽职调查之后形成的书面报告，用于提供给基金之合伙人进行投资决策参考。我们认为，实施尽职调查的人员具有足够的职业操守，专业素养与审慎精神，能够确保本报告信息的真实与完整。但是，仍然不能绝对保证对于目标公司的所有重要信息均给予了揭示。
        </p>
      </div>

      {/* Executive Summary */}
      <div className="mb-8">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4">摘要</h2>

        <div className="mb-4">
          <h3 className="font-bold mb-1">企业概况</h3>
          <p className="text-xs">{data.executiveSummary.companyProfile}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-bold mb-1">业务简介</h3>
          <p className="text-xs">{data.executiveSummary.businessIntro}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-bold mb-1">财务简况</h3>
          <p className="text-xs">{data.executiveSummary.financialSummary}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-bold mb-1">上市动态</h3>
          <p className="text-xs">{data.executiveSummary.ipoStatus}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-bold mb-1">投资方案</h3>
          <p className="text-xs">{data.executiveSummary.investmentPlan}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-bold mb-1">投资收益</h3>
          <p className="text-xs">{data.executiveSummary.investmentReturn}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-bold mb-1">投资价值</h3>
          <p className="text-xs">{data.executiveSummary.investmentValue}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-bold mb-1">投资风险</h3>
          <p className="text-xs">{data.executiveSummary.investmentRisk}</p>
        </div>
      </div>

      {/* Company Info */}
      <div className="mb-8">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4">1 公司基本情况</h2>
        <div className="mb-4">
          <h3 className="font-bold mb-1">1.1 公司概况</h3>
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-1 w-1/4">公司名称</td>
                <td className="border border-gray-300 p-1">{data.companyInfo.name}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-1">法定代表人</td>
                <td className="border border-gray-300 p-1">{data.companyInfo.legalRepresentative}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-1">注册资本</td>
                <td className="border border-gray-300 p-1">{data.companyInfo.registeredCapital}万元</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-1">设立时间</td>
                <td className="border border-gray-300 p-1">{data.companyInfo.establishmentDate}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-1">注册地址</td>
                <td className="border border-gray-300 p-1">{data.companyInfo.address}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-1">经营范围</td>
                <td className="border border-gray-300 p-1">{data.companyInfo.businessScope}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sections placeholder */}
      {pdfSections.map((section) => (
        <div key={section.id} className="mb-6">
          <h2 className="text-lg font-bold border-b border-gray-300 pb-2 mb-3">{section.title}</h2>
          <p className="text-xs text-gray-500 italic">[此处需要根据尽职调查实际情况填写详细内容...]</p>
        </div>
      ))}

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-gray-300 text-center text-xs text-gray-500">
        <p>{data.preparedBy}</p>
        <p>{data.reportDate}</p>
      </div>
    </div>
  )
}
