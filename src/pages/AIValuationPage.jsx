import AIValuation from '../components/ai/AIValuation'

export default function AIValuationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">AI 企业估值</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            结合多种估值方法与AI分析，为企业提供科学、合理的价值评估建议。
          </p>
        </div>
        <AIValuation />
      </div>
    </div>
  )
}
