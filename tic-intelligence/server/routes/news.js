import { Router } from 'express';
import { getDb, generateId, saveDb } from '../services/database.js';

export const newsRouter = Router();

// Get all news with pagination and filters
newsRouter.get('/', (req, res) => {
  try {
    const db = getDb();
    let news = [...db.news];

    const { category, source, keyword, sentiment, limit = 50, offset = 0 } = req.query;

    if (category) {
      news = news.filter(n => n.category === category);
    }

    if (source) {
      news = news.filter(n => n.source.includes(source));
    }

    if (keyword) {
      news = news.filter(n =>
        n.title.includes(keyword) || n.summary.includes(keyword) || n.content.includes(keyword)
      );
    }

    if (sentiment) {
      news = news.filter(n => n.sentiment === sentiment);
    }

    // Sort by publishedAt desc
    news.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    const total = news.length;
    const paginatedNews = news.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({ news: paginatedNews, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get single news by id
newsRouter.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const news = db.news.find(n => n.id === req.params.id);

    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Create news
newsRouter.post('/', (req, res) => {
  try {
    const db = getDb();
    const id = generateId();
    const { title, summary, content, source, url, publishedAt, category = 'ma', tags = [], sentiment = 'neutral' } = req.body;

    const newNews = {
      id,
      title,
      summary,
      content,
      source,
      url,
      publishedAt: publishedAt || new Date().toISOString(),
      category,
      tags: Array.isArray(tags) ? tags : [],
      sentiment,
      videoGenerated: false,
      createdAt: new Date().toISOString()
    };

    db.news.push(newNews);
    saveDb();

    res.status(201).json({ id });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ error: 'Failed to create news' });
  }
});

// Delete news
newsRouter.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    const index = db.news.findIndex(n => n.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'News not found' });
    }

    db.news.splice(index, 1);
    saveDb();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

// Get unique sources
newsRouter.get('/meta/sources', (req, res) => {
  try {
    const db = getDb();
    const sources = [...new Set(db.news.map(n => n.source))].sort();
    res.json(sources);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});
