import { useState, useEffect } from 'react';
import { Search, Filter, Trash2, ExternalLink, TrendingUp, TrendingDown, Minus, Video, Check } from 'lucide-react';

const categoryLabels = { ma: '并购', policy: '政策', company: '公司' };
const sentimentLabels = { positive: '正面', neutral: '中性', negative: '负面' };
const sentimentColors = {
  positive: 'bg-emerald-500/20 text-emerald-400',
  neutral: 'bg-gray-500/20 text-gray-400',
  negative: 'bg-red-500/20 text-red-400'
};
const categoryColors = {
  ma: 'bg-blue-500/20 text-blue-400',
  policy: 'bg-purple-500/20 text-purple-400',
  company: 'bg-amber-500/20 text-amber-400'
};

export default function NewsList({ apiBase }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedNews, setSelectedNews] = useState([]);

  useEffect(() => {
    fetchNews();
  }, [category, search]);

  async function fetchNews() {
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (category) params.append('category', category);
      if (search) params.append('keyword', search);

      const res = await fetch(`${apiBase}/news?${params}`);
      const data = await res.json();
      setNews(data.news || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setLoading(false);
    }
  }

  async function deleteNews(id) {
    if (!confirm('确定删除这条资讯？')) return;
    try {
      await fetch(`${apiBase}/news/${id}`, { method: 'DELETE' });
      setNews(news.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  }

  function toggleSelect(id) {
    setSelectedNews(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  function selectAll() {
    if (selectedNews.length === news.length) {
      setSelectedNews([]);
    } else {
      setSelectedNews(news.map(n => n.id));
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="搜索资讯标题、内容..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">全部分类</option>
          <option value="ma">并购</option>
          <option value="policy">政策</option>
          <option value="company">公司</option>
        </select>

        {selectedNews.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-xl text-emerald-400">
            <Check size={16} />
            <span>{selectedNews.length} 条已选</span>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedNews.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
          <span className="text-sm text-emerald-400">已选择 {selectedNews.length} 条资讯</span>
          <button
            onClick={() => {/* Navigate to video tab with selected */}}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white text-sm transition-colors"
          >
            <Video size={14} />
            生成视频
          </button>
        </div>
      )}

      {/* News List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          暂无资讯
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center gap-4 px-4 py-2 bg-gray-800/30 rounded-xl text-xs text-gray-400">
            <input
              type="checkbox"
              checked={selectedNews.length === news.length && news.length > 0}
              onChange={selectAll}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="flex-1">标题</span>
            <span className="w-20 text-center">分类</span>
            <span className="w-20 text-center">情感</span>
            <span className="w-24 text-center">来源</span>
            <span className="w-20 text-center">操作</span>
          </div>

          {news.map(item => (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border transition-colors ${
                selectedNews.includes(item.id) ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedNews.includes(item.id)}
                onChange={() => toggleSelect(item.id)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500"
              />

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white line-clamp-1">{item.title}</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.summary}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-gray-500">
                    {new Date(item.publishedAt).toLocaleDateString('zh-CN')}
                  </span>
                  {item.videoGenerated === 1 && (
                    <span className="flex items-center gap-1 text-xs text-purple-400">
                      <Video size={12} />
                      已生成视频
                    </span>
                  )}
                </div>
              </div>

              <span className={`w-20 text-center text-xs px-2 py-1 rounded-lg ${categoryColors[item.category]}`}>
                {categoryLabels[item.category]}
              </span>

              <span className={`w-20 text-center text-xs px-2 py-1 rounded-lg ${sentimentColors[item.sentiment]}`}>
                {item.sentiment === 'positive' && <TrendingUp size={12} className="inline mr-1" />}
                {item.sentiment === 'negative' && <TrendingDown size={12} className="inline mr-1" />}
                {item.sentiment === 'neutral' && <Minus size={12} className="inline mr-1" />}
                {sentimentLabels[item.sentiment]}
              </span>

              <span className="w-24 text-center text-xs text-gray-400 truncate">{item.source}</span>

              <div className="w-20 flex items-center justify-center gap-2">
                <button
                  onClick={() => window.open(item.url, '_blank')}
                  className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                  title="查看原文"
                >
                  <ExternalLink size={14} />
                </button>
                <button
                  onClick={() => deleteNews(item.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                  title="删除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
