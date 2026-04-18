import { useState, useEffect } from 'react';
import { RefreshCw, Play, Clock, CheckCircle, AlertCircle, Globe, Database } from 'lucide-react';

export default function CrawlerControl({ apiBase }) {
  const [sources, setSources] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchSources();
    fetchTasks();
    fetchStatus();
  }, []);

  async function fetchSources() {
    try {
      const res = await fetch(`${apiBase}/crawl/sources`);
      const data = await res.json();
      setSources(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch sources:', error);
      setLoading(false);
    }
  }

  async function fetchTasks() {
    try {
      const res = await fetch(`${apiBase}/crawl/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  }

  async function fetchStatus() {
    try {
      const res = await fetch(`${apiBase}/crawl/status`);
      const data = await res.json();
      setStatus(data);
      setRunning(data.isRunning);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  }

  async function startCrawl() {
    setRunning(true);
    try {
      await fetch(`${apiBase}/crawl/run`, { method: 'POST' });

      // Poll for completion
      const pollInterval = setInterval(async () => {
        await fetchStatus();
        await fetchTasks();
      }, 1000);

      setTimeout(() => {
        clearInterval(pollInterval);
        setRunning(false);
      }, 15000);
    } catch (error) {
      console.error('Failed to start crawl:', error);
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              running ? 'bg-amber-500/20' : 'bg-emerald-500/20'
            }`}>
              <Database className={running ? 'text-amber-400 animate-spin' : 'text-emerald-400'} size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-400">爬虫状态</p>
              <p className={`font-semibold ${running ? 'text-amber-400' : 'text-emerald-400'}`}>
                {running ? '运行中' : '空闲'}
              </p>
            </div>
          </div>
          {status?.lastRun && (
            <p className="text-xs text-gray-500">
              上次运行: {new Date(status.lastRun).toLocaleString('zh-CN')}
            </p>
          )}
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Globe size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">数据源</p>
              <p className="font-semibold text-white">{sources.length} 个</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">已配置爬虫数据源</p>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <CheckCircle size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">本次运行</p>
              <p className="font-semibold text-white">{status?.itemsCrawled || 0} 条</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">本周期抓取数量</p>
        </div>
      </div>

      {/* Control Button */}
      <div className="flex justify-center">
        <button
          onClick={startCrawl}
          disabled={running}
          className={`px-8 py-4 rounded-2xl font-medium flex items-center gap-3 transition-all ${
            running
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
          }`}
        >
          {running ? (
            <>
              <RefreshCw size={20} className="animate-spin" />
              爬取中...
            </>
          ) : (
            <>
              <Play size={20} />
              立即抓取
            </>
          )}
        </button>
      </div>

      {/* Sources */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">数据源配置</h3>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map(source => (
              <div
                key={source.name}
                className={`p-4 rounded-xl border transition-colors ${
                  source.enabled
                    ? 'bg-gray-700/30 border-gray-600'
                    : 'bg-gray-900/50 border-gray-800 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{source.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    source.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-600/20 text-gray-500'
                  }`}>
                    {source.enabled ? '启用' : '禁用'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{source.url}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Tasks */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">抓取记录</h3>
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500 py-8">暂无抓取记录</p>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 10).map(task => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-700/30"
              >
                {task.status === 'completed' && <CheckCircle size={18} className="text-emerald-400" />}
                {task.status === 'running' && <RefreshCw size={18} className="text-amber-400 animate-spin" />}
                {task.status === 'pending' && <Clock size={18} className="text-gray-400" />}
                {task.status === 'failed' && <AlertCircle size={18} className="text-red-400" />}

                <div className="flex-1">
                  <p className="text-sm text-white">
                    {task.source === 'manual' ? '手动抓取' : task.source}
                  </p>
                  <p className="text-xs text-gray-400">
                    {task.itemsCrawled} 条新资讯
                  </p>
                </div>

                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    task.status === 'completed' ? 'text-emerald-400' :
                    task.status === 'running' ? 'text-amber-400' :
                    task.status === 'failed' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {task.status === 'completed' && '完成'}
                    {task.status === 'running' && '运行中'}
                    {task.status === 'pending' && '等待'}
                    {task.status === 'failed' && '失败'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(task.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
