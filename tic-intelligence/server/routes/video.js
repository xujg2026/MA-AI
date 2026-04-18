import { Router } from 'express';
import { getDb, generateId, saveDb } from '../services/database.js';

export const videoRouter = Router();

// Get video tasks
videoRouter.get('/tasks', (req, res) => {
  try {
    const db = getDb();
    const tasks = db.video_tasks.slice(-20).reverse();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create video generation task
videoRouter.post('/generate', async (req, res) => {
  try {
    const db = getDb();
    const { newsIds } = req.body;

    if (!newsIds || !Array.isArray(newsIds) || newsIds.length === 0) {
      return res.status(400).json({ error: 'newsIds array is required' });
    }

    const taskId = generateId();

    // Create task record
    db.video_tasks.push({
      id: taskId,
      newsIds: JSON.stringify(newsIds),
      status: 'pending',
      outputPath: null,
      duration: null,
      createdAt: new Date().toISOString(),
      completedAt: null
    });
    saveDb();

    // Start video generation in background
    generateVideoTask(taskId, newsIds, db);

    res.json({ taskId, message: 'Video generation started' });
  } catch (error) {
    console.error('Error creating video task:', error);
    res.status(500).json({ error: 'Failed to create video task' });
  }
});

async function generateVideoTask(taskId, newsIds, db) {
  try {
    // Update status to running
    const task = db.video_tasks.find(t => t.id === taskId);
    if (task) task.status = 'running';
    saveDb();

    // Get news items
    const newsItems = db.news.filter(n => newsIds.includes(n.id));

    if (newsItems.length === 0) {
      throw new Error('No news items found');
    }

    // Generate video (simulated)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Update task as completed
    if (task) {
      task.status = 'completed';
      task.outputPath = `/output/videos/${taskId}.mp4`;
      task.duration = newsItems.length * 15;
      task.completedAt = new Date().toISOString();
    }

    // Mark news as video generated
    newsIds.forEach(id => {
      const news = db.news.find(n => n.id === id);
      if (news) news.videoGenerated = true;
    });

    saveDb();
  } catch (error) {
    console.error('Video generation error:', error);
    const task = db.video_tasks.find(t => t.id === taskId);
    if (task) task.status = 'failed';
    saveDb();
  }
}

// Get video template info
videoRouter.get('/templates', (req, res) => {
  res.json([
    {
      id: 'daily-brief',
      name: '每日简报',
      description: '汇总当日重要资讯，适合日报推送',
      duration: '60-90秒',
      style: '专业简洁'
    },
    {
      id: 'deep-analysis',
      name: '深度解读',
      description: '单条资讯深度分析，适合重点内容',
      duration: '3-5分钟',
      style: '详细专业'
    },
    {
      id: 'industry-trend',
      name: '行业趋势',
      description: '多维度分析行业发展趋势',
      duration: '5-10分钟',
      style: '数据驱动'
    }
  ]);
});
