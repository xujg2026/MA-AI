import IntegrationPrediction from '../components/ai/IntegrationPrediction'

export default function IntegrationPredictionPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI整合预测
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            基于历史并购案例数据，AI智能预测整合成功率、识别关键风险点，并提供整合时间表和建议
          </p>
        </div>
        <IntegrationPrediction />
      </div>
    </div>
  )
}
