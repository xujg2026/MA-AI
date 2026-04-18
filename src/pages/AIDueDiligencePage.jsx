import { useState } from 'react'
import AIDueDiligence from '../components/ai/AIDueDiligence'
import DDReportGenerator from '../components/ai/DDReportGenerator'
import { FileText, ClipboardList } from 'lucide-react'

export default function AIDueDiligencePage() {
  const [activeTab, setActiveTab] = useState('report') // checklist, report

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">AI 推荐书</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            智能生成专业投资推荐书，系统化梳理项目亮点与投资价值，呈现全方位投资分析报告。
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-2xl shadow-soft p-1.5">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'checklist'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <ClipboardList size={20} />
              <span>项目清单</span>
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'report'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <FileText size={20} />
              <span>生成推荐书</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'checklist' ? (
          <AIDueDiligence />
        ) : (
          <DDReportGenerator />
        )}
      </div>
    </div>
  )
}
