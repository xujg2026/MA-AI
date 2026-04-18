import { TrendingUp, TrendingDown, Minus, Building2, Scale, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

const COLORS = {
  positive: '#10b981',
  neutral: '#6b7280',
  negative: '#ef4444',
  ma: '#3b82f6',
  policy: '#8b5cf6',
  company: '#f59e0b'
};

export default function Dashboard({ stats, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-400">
        暂无数据，请确保服务器已启动
      </div>
    );
  }

  const sentimentData = [
    { name: '正面', value: stats.bySentiment?.positive || 0, fill: COLORS.positive },
    { name: '中性', value: stats.bySentiment?.neutral || 0, fill: COLORS.neutral },
    { name: '负面', value: stats.bySentiment?.negative || 0, fill: COLORS.negative },
  ].filter(d => d.value > 0);

  const categoryData = [
    { name: '并购', value: stats.byCategory?.ma || 0, fill: COLORS.ma },
    { name: '政策', value: stats.byCategory?.policy || 0, fill: COLORS.policy },
    { name: '公司', value: stats.byCategory?.company || 0, fill: COLORS.company },
  ].filter(d => d.value > 0);

  // Mock trend data
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      positive: Math.floor(Math.random() * 5) + 2,
      neutral: Math.floor(Math.random() * 4) + 1,
      negative: Math.floor(Math.random() * 2)
    };
  });

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Sentiment Distribution */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">舆情分布</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {sentimentData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                <span className="text-xs text-gray-400">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">资讯类别</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {categoryData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                <span className="text-xs text-gray-400">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Sources */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">热门来源</h3>
          <div className="space-y-3">
            {stats.topSources?.map((source, i) => (
              <div key={source.source} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    i === 1 ? 'bg-gray-400/20 text-gray-300' :
                    i === 2 ? 'bg-amber-600/20 text-amber-500' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-300">{source.source}</span>
                </div>
                <span className="text-sm font-semibold text-emerald-400">{source.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">7日趋势</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="positive" stroke={COLORS.positive} strokeWidth={2} dot={{ fill: COLORS.positive }} />
              <Line type="monotone" dataKey="neutral" stroke={COLORS.neutral} strokeWidth={2} dot={{ fill: COLORS.neutral }} />
              <Line type="monotone" dataKey="negative" stroke={COLORS.negative} strokeWidth={2} dot={{ fill: COLORS.negative }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent News */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">最新资讯</h3>
        <div className="space-y-4">
          {stats.recentNews?.map(news => (
            <div key={news.id} className="flex items-start gap-4 p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                news.category === 'ma' ? 'bg-blue-500' :
                news.category === 'policy' ? 'bg-purple-500' : 'bg-amber-500'
              }`} />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white line-clamp-1">{news.title}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-400">{news.source}</span>
                  <span className="text-xs text-gray-500">{new Date(news.publishedAt).toLocaleDateString('zh-CN')}</span>
                  {news.sentiment === 'positive' && <TrendingUp size={12} className="text-emerald-400" />}
                  {news.sentiment === 'negative' && <TrendingDown size={12} className="text-red-400" />}
                  {news.sentiment === 'neutral' && <Minus size={12} className="text-gray-400" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
