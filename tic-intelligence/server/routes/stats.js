import { Router } from 'express';
import { getDb } from '../services/database.js';

export const statsRouter = Router();

// Get dashboard statistics
statsRouter.get('/dashboard', (req, res) => {
  try {
    const db = getDb();
    const news = db.news;

    // Total news count
    const totalNews = news.length;

    // News by category
    const byCategory = {};
    news.forEach(n => {
      byCategory[n.category] = (byCategory[n.category] || 0) + 1;
    });

    // News by sentiment
    const bySentiment = {};
    news.forEach(n => {
      bySentiment[n.sentiment] = (bySentiment[n.sentiment] || 0) + 1;
    });

    // Recent activity (last 24h)
    const last24hDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last24h = news.filter(n => new Date(n.createdAt) > last24hDate).length;

    // Top sources
    const sourceCount = {};
    news.forEach(n => {
      sourceCount[n.source] = (sourceCount[n.source] || 0) + 1;
    });
    const topSources = Object.entries(sourceCount)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Video generated count
    const videoGenerated = news.filter(n => n.videoGenerated).length;

    // Recent news
    const recentNews = [...news]
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 5);

    res.json({
      totalNews,
      last24h,
      videoGenerated,
      byCategory,
      bySentiment,
      topSources,
      recentNews
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get sentiment trend (last 7 days)
statsRouter.get('/sentiment-trend', (req, res) => {
  try {
    // For demo, return simulated trend data
    const trend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        positive: Math.floor(Math.random() * 5) + 3,
        neutral: Math.floor(Math.random() * 5) + 2,
        negative: Math.floor(Math.random() * 2)
      };
    });

    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sentiment trend' });
  }
});
