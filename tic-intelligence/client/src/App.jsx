import { useState, useEffect } from 'react';
import { Newspaper, Video, BarChart3, Settings, RefreshCw, Play, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Dashboard from './components/Dashboard';
import NewsList from './components/NewsList';
import VideoStudio from './components/VideoStudio';
import CrawlerControl from './components/CrawlerControl';

const API_BASE = '/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'dashboard', label: '数据看板', icon: BarChart3 },
    { id: 'news', label: '资讯管理', icon: Newspaper },
    { id: 'video', label: '视频制作', icon: Video },
    { id: 'crawler', label: '爬虫控制', icon: Settings },
  ];

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE}/stats/dashboard`);
      const data = await res.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TIC智能资讯中枢</h1>
                <p className="text-xs text-gray-400">检验检测认证行业资讯采集与视频生成</p>
              </div>
            </div>
            <button
              onClick={fetchStats}
              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'text-emerald-400 border-emerald-400 bg-emerald-500/10'
                      : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-700/30'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Stats Cards */}
      {stats && activeTab === 'dashboard' && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="资讯总数"
              value={stats.totalNews}
              icon={Newspaper}
              color="from-blue-500 to-cyan-500"
            />
            <StatCard
              label="24小时新增"
              value={stats.last24h}
              icon={Clock}
              color="from-emerald-500 to-teal-500"
            />
            <StatCard
              label="已生成视频"
              value={stats.videoGenerated}
              icon={Video}
              color="from-purple-500 to-pink-500"
            />
            <StatCard
              label="情感正面率"
              value={`${Math.round((stats.bySentiment?.positive || 0) / (stats.totalNews || 1) * 100)}%`}
              icon={CheckCircle}
              color="from-green-500 to-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <Dashboard stats={stats} loading={loading} />}
        {activeTab === 'news' && <NewsList apiBase={API_BASE} />}
        {activeTab === 'video' && <VideoStudio apiBase={API_BASE} />}
        {activeTab === 'crawler' && <CrawlerControl apiBase={API_BASE} />}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon className="text-white" size={20} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}
