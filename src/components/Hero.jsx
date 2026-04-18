import { ArrowRight, TrendingUp } from 'lucide-react';

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary via-secondary to-dark text-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white bg-opacity-10 px-4 py-2 rounded-full mb-6">
              <TrendingUp size={18} className="text-accent" />
              <span className="text-sm">实时全球并购数据</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              全球并购市场
              <span className="text-accent">洞察</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              实时追踪全球并购动态，深入分析行业趋势，洞悉市场先机。为投资银行、律师事务所、PE/VC机构提供专业的并购数据服务。
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center space-x-2 bg-accent hover:bg-opacity-90 text-primary font-semibold px-8 py-4 rounded-lg transition-all">
                <span>探索更多</span>
                <ArrowRight size={18} />
              </button>
              <button className="border border-white border-opacity-30 hover:bg-white hover:bg-opacity-10 px-8 py-4 rounded-lg font-medium transition-all">
                联系我们
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white bg-opacity-5 rounded-2xl p-8 backdrop-blur-sm border border-white border-opacity-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">全球交易总量</span>
                  <span className="text-3xl font-bold text-accent">12,847</span>
                </div>
                <div className="h-2 bg-white bg-opacity-10 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-accent to-yellow-400 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div>
                    <p className="text-gray-400 text-sm">较上月</p>
                    <p className="text-2xl font-bold text-green-400">+12.5%</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">活跃项目</p>
                    <p className="text-2xl font-bold">3,421</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
