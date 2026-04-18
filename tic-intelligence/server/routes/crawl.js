import { Router } from 'express';
import { getDb, generateId, saveDb } from '../services/database.js';
import { crawlSources, getCrawlStatus } from '../services/crawler.js';

export const crawlRouter = Router();

// Get crawl tasks
crawlRouter.get('/tasks', (req, res) => {
  try {
    const db = getDb();
    const tasks = db.crawl_tasks.slice(-20).reverse();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get crawl status
crawlRouter.get('/status', (req, res) => {
  res.json(getCrawlStatus());
});

// Trigger manual crawl
crawlRouter.post('/run', async (req, res) => {
  try {
    const db = getDb();
    const taskId = generateId();

    // Create task record
    db.crawl_tasks.push({
      id: taskId,
      source: 'manual',
      status: 'running',
      itemsCrawled: 0,
      startedAt: new Date().toISOString(),
      completedAt: null,
      error: null,
      createdAt: new Date().toISOString()
    });
    saveDb();

    // Start crawling in background
    runCrawlTask(taskId, db);

    res.json({ taskId, message: 'Crawl started' });
  } catch (error) {
    console.error('Error starting crawl:', error);
    res.status(500).json({ error: 'Failed to start crawl' });
  }
});

async function runCrawlTask(taskId, db) {
  try {
    let totalCrawled = 0;

    // Simulate crawling from sources
    for (const source of crawlSources) {
      await new Promise(resolve => setTimeout(resolve, 500));
      totalCrawled += Math.floor(Math.random() * 3) + 1;
    }

    // Update task as completed
    const task = db.crawl_tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'completed';
      task.itemsCrawled = totalCrawled;
      task.completedAt = new Date().toISOString();
      saveDb();
    }
  } catch (error) {
    const task = db.crawl_tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'failed';
      task.error = error.message;
      task.completedAt = new Date().toISOString();
      saveDb();
    }
  }
}

// Get sources configuration
crawlRouter.get('/sources', (req, res) => {
  res.json(crawlSources.map(s => ({
    name: s.name,
    url: s.baseUrl,
    enabled: s.enabled
  })));
});
