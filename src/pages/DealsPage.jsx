import { useState, useEffect } from 'react'
import DealList from '../components/deals/DealList'
import { Sparkles, Briefcase, TrendingUp } from 'lucide-react'
import { Badge } from '../components/ui'

export default function DealsPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Badge variant="primary" className="mb-4 inline-flex items-center gap-2">
            <Briefcase size={14} />
            <span>并购案例库</span>
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            既往市场<span className="gradient-text">交易案例</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            汇聚行业经典并购案例，洞察交易趋势与定价规律
          </p>
        </div>

        {/* Market Stats */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {[
            { label: '累计交易案例', value: '12,847', icon: Briefcase },
            { label: '总交易金额', value: '$4.2T', icon: TrendingUp },
            { label: '成功匹配率', value: '98%', icon: Sparkles },
            { label: '覆盖行业', value: '50+', icon: Briefcase },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-soft text-center">
              <stat.icon size={20} className="mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className={`transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <DealList />
        </div>
      </div>
    </div>
  )
}
