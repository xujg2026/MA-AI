import express from 'express';
import cors from 'cors';
import { newsRouter } from './routes/news.js';
import { crawlRouter } from './routes/crawl.js';
import { videoRouter } from './routes/video.js';
import { statsRouter } from './routes/stats.js';
import { initDatabase } from './services/database.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// Routes
app.use('/api/news', newsRouter);
app.use('/api/crawl', crawlRouter);
app.use('/api/video', videoRouter);
app.use('/api/stats', statsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`TIC Intelligence Server running on port ${PORT}`);
});
