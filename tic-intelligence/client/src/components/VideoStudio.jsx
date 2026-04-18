import { useState, useEffect } from 'react';
import { Video, Play, CheckCircle, Clock, AlertCircle, FileText, Film } from 'lucide-react';

export default function VideoStudio({ apiBase }) {
  const [news, setNews] = useState([]);
  const [selectedNews, setSelectedNews] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
    fetchTemplates();
    fetchTasks();
  }, []);

  async function fetchNews() {
    try {
      const res = await fetch(`${apiBase}/news?limit=50`);
      const data = await res.json();
      setNews(data.news || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setLoading(false);
    }
  }

  async function fetchTemplates() {
    try {
      const res = await fetch(`${apiBase}/video/templates`);
      const data = await res.json();
      setTemplates(data);
      if (data.length > 0) setSelectedTemplate(data[0].id);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  }

  async function fetchTasks() {
    try {
      const res = await fetch(`${apiBase}/video/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  }

  function toggleSelectNews(id) {
    setSelectedNews(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  async function generateVideo() {
    if (selectedNews.length === 0) {
      alert('请选择要生成视频的资讯');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch(`${apiBase}/video/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsIds: selectedNews })
      });
      const data = await res.json();
      console.log('Video generation started:', data);

      // Poll for status
      const pollInterval = setInterval(async () => {
        await fetchTasks();
      }, 2000);

      setTimeout(() => {
        clearInterval(pollInterval);
        setGenerating(false);
      }, 10000);
    } catch (error) {
      console.error('Failed to generate video:', error);
      setGenerating(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* News Selection */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText size={20} className="text-emerald-400" />
            选择资讯
          </h2>
          <span className="text-sm text-gray-400">{selectedNews.length} 条已选</span>
        </div>

        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12 text-gray-400">暂无资讯</div>
          ) : (
            <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
              {news.map(item => (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                    selectedNews.includes(item.id)
                      ? 'bg-emerald-500/10'
                      : 'hover:bg-gray-700/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedNews.includes(item.id)}
                    onChange={() => toggleSelectNews(item.id)}
                    className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{item.source}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Settings */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Film size={20} className="text-emerald-400" />
          视频设置
        </h2>

        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 space-y-4">
          {/* Template Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">视频模板</label>
            <div className="space-y-2">
              {templates.map(t => (
                <label
                  key={t.id}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    selectedTemplate === t.id
                      ? 'bg-emerald-500/20 border border-emerald-500/50'
                      : 'bg-gray-700/30 border border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    value={t.id}
                    checked={selectedTemplate === t.id}
                    onChange={() => setSelectedTemplate(t.id)}
                    className="mt-1 w-4 h-4 text-emerald-500"
                  />
                  <div>
                    <h4 className="text-sm font-medium text-white">{t.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{t.description}</p>
                    <p className="text-xs text-gray-500 mt-1">时长: {t.duration}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateVideo}
            disabled={selectedNews.length === 0 || generating}
            className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
              selectedNews.length === 0 || generating
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
            }`}
          >
            {generating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Video size={18} />
                生成视频 ({selectedNews.length} 条)
              </>
            )}
          </button>
        </div>

        {/* Generation Tasks */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-sm font-medium text-white mb-3">生成任务</h3>
          {tasks.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">暂无任务</p>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-700/30">
                  {task.status === 'completed' && <CheckCircle size={14} className="text-emerald-400" />}
                  {task.status === 'running' && <Clock size={14} className="text-amber-400 animate-pulse" />}
                  {task.status === 'pending' && <Clock size={14} className="text-gray-400" />}
                  {task.status === 'failed' && <AlertCircle size={14} className="text-red-400" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">
                      {task.outputPath ? '视频生成完成' : '等待生成...'}
                    </p>
                    <p className="text-xs text-gray-500">{task.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
