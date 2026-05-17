# TIC 并购资讯模块设计方案

**日期**: 2026-05-17
**状态**: 设计中
**参考**: Peakstone-Labs/sembr 项目架构

---

## 1. 背景与目标

当前"并购资讯"模块使用 mock 数据，需要替换为真实数据。

### 目标
- 从真实 RSS/NewsAPI 来源获取 TIC (检测、检验、认证) 行业资讯
- 支持实时新闻更新
- 保留 fallback 机制（真实数据获取失败时仍使用 mock 数据）

### 参考架构
sembr 项目结构:
```
sembr/
├── collector/     # 数据采集层 (RSS, NewsAPI, Web Scraper)
├── api/          # REST API
├── db/           # SQLite 数据库
├── dashboard/    # 管理界面
└── notifier/     # 通知推送
```

---

## 2. 技术选型

| 组件 | 选择 | 原因 |
|------|------|------|
| 数据采集 | Python (RSS + NewsAPI) | 与现有 mx-skills 架构一致 |
| 数据存储 | SQLite (news.db) | 独立数据库，清洁分离 |
| API | Express.js | 与现有后端架构一致 |
| 实时更新 | Client Polling | 简单，与现有架构兼容 |
| RSS 聚合 | RSSHub | 获取中文金融 RSS |

### 数据来源配置

**A. Chinese Financial RSS (via RSSHub)**
- 财联社电报 (cls/telegraph) - 快讯
- 华尔街见闻 (wallstreetcn) - 综合财经
- 第一财经 (yicai) - 高质量报道
- 36氪 (36kr) - TMT/科技并购
- 格隆汇 (gelonghui) - 市场评论

**B. Government/Regulatory**
- 证监会官方公告 (csrc.gov.cn)
- 国家认监委 (cnca.gov.cn)
- 商务部外商投资公告

**C. Industry Media**
- 中国质量报
- 中国贸易报
- 经济观察报

---

## 3. 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     数据采集层 (Python/Collectors)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ RSS Feeds│  │NewsAPI   │  │Web Scraper│ │ Custom TIC APIs  │ │
│  │(RSSHub)  │  │          │  │           │  │ (证监会, CNCA)   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬──────────┘ │
│       │             │             │                │            │
│       └─────────────┴─────────────┴────────────────┘            │
│                            │                                      │
│                     ┌──────▼──────┐                              │
│                     │  Collectors │ ← scheduler + rate limiting   │
│                     │  (Python)   │                              │
│                     └──────┬──────┘                              │
│                            │                                      │
│                     ┌──────▼──────┐                              │
│                     │  news.db    │ ← articles, feeds, tags       │
│                     └──────┬──────┘                              │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      API Layer (Express)                        │
│  GET/POST /api/news/feeds    - 管理新闻源                         │
│  GET /api/news/articles      - 查询文章（支持过滤）                │
│  GET /api/news/live          - 实时快讯                           │
│  GET /api/news/hot           - 热门文章                           │
│  GET /api/news/stats          - 市场数据统计                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                  Frontend (React)                                │
│  src/pages/NewsPage.jsx    - 新闻主页                            │
│  src/services/newsService.js - API 调用（可切换 mock/real）       │
│  src/data/mockData.js       - Fallback mock 数据                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. 数据库设计

### 4.1 news.db Schema

```sql
-- 新闻源配置表
CREATE TABLE feeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    source_type TEXT DEFAULT 'rss',  -- 'rss', 'newsapi', 'scraper'
    category TEXT,                    -- 'financial', 'gov', 'industry'
    tags TEXT,                       -- JSON array of tags
    poll_interval_minutes INTEGER DEFAULT 30,
    enabled INTEGER DEFAULT 1,
    last_collected_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 文章表
CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feed_id INTEGER REFERENCES feeds(id),
    md5 TEXT UNIQUE,                  -- 用于去重
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    published_at TEXT,
    collected_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_tic INTEGER DEFAULT 0,        -- 是否为 TIC 相关
    sentiment TEXT,                  -- 'positive', 'negative', 'neutral'
    hot INTEGER DEFAULT 0,           -- 是否热门
    views INTEGER DEFAULT 0,
    category TEXT,                   -- '行业研究', '技术前沿', '案例分析' 等
    PRIMARY KEY (id)
);

-- 文章标签表
CREATE TABLE article_tags (
    article_id INTEGER REFERENCES articles(id),
    tag TEXT,
    PRIMARY KEY (article_id, tag)
);

-- 市场数据缓存表
CREATE TABLE market_stats (
    id INTEGER PRIMARY KEY,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    change TEXT,
    up INTEGER,
    icon TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_articles_feed_id ON articles(feed_id);
CREATE INDEX idx_articles_is_tic ON articles(is_tic);
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_articles_hot ON articles(hot);
```

### 4.2 TIC 关键词列表

**说明**: 由于采用 AI 自动判断，关键词列表仅作为参考和辅助，不用于文章过滤。AI 将自动判断文章是否与 TIC 相关。

```python
# TIC 行业关键词 (用于参考和 AI 辅助判断)
TIC_KEYWORDS = [
    # 行业词
    '检测', '检验', '认证', 'TIC', '核查', '校准', '评测',
    # 机构名
    '华测检测', '谱尼测试', 'SGS', 'BV', 'Intertek', '天祥', 'UL',
    '中检集团', '中国检验认证', '国检集团', '广电计量', '钢研纳克',
    # 业务词
    'CMA', 'CNAS', '检测报告', '检验检测', '认证认可',
    # 并购相关
    '并购', '收购', '股权转让', '战略投资', 'PE', 'VC', '并购重组',
]

# 分类标签 (AI 分类参考)
CATEGORY_KEYWORDS = {
    '行业研究': ['行业报告', '市场规模', '趋势分析', '竞争格局'],
    '技术前沿': ['AI', '人工智能', '区块链', '大数据', '技术突破'],
    '案例分析': ['收购案例', '并购复盘', '整合', '尽调'],
    '合规指南': ['合规', '监管', '政策', '规范', '反垄断'],
    '市场分析': ['市场动态', '投资机会', '融资', '财报'],
}
```

### 4.3 AI 分析器

**定时任务**: 每小时批量分析未分析的文章

```python
# server/src/collectors/newsAnalyzer.ts
class NewsAnalyzer:
    """使用 AI 分析新闻内容，判断是否与 TIC 相关"""

    async def analyze_article(self, article):
        """分析单篇文章"""
        prompt = f"""分析以下新闻，判断是否与检测行业(TIC)及兼并购相关：

标题: {article.title}
内容: {article.body[:500]}

返回 JSON:
{{
    "is_tic": 0或1,        # 是否与检测行业相关
    "is_ma": 0或1,        # 是否涉及兼并购
    "category": "分类",   # 行业研究/技术前沿/案例分析/合规指南/市场分析
    "sentiment": "情感",  # positive/negative/neutral
    "confidence": 0.0-1.0 # 判断置信度
}}
"""
        result = await call_ai_model(prompt)
        return json.loads(result)

    async def batch_analyze(self, limit=100):
        """批量分析未处理的文章"""
        articles = get_unanalyzed_articles(limit)
        for article in articles:
            result = await self.analyze_article(article)
            update_article(article.id, result)
```

---

## 5. API 设计

### 5.1 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/news/live` | 获取实时快讯 (滚动) |
| GET | `/api/news/hot` | 获取热门文章 |
| GET | `/api/news/latest` | 获取最新文章 |
| GET | `/api/news/all` | 获取所有文章 (分页, 支持过滤) |
| GET | `/api/news/stats` | 获取市场数据统计 |
| GET | `/api/news/feeds` | 获取新闻源列表 |
| POST | `/api/news/feeds` | 添加新闻源 |
| PUT | `/api/news/feeds/:id` | 更新新闻源 |
| DELETE | `/api/news/feeds/:id` | 删除新闻源 |
| POST | `/api/news/collect` | 手动触发采集 |
| GET | `/api/news/search` | 搜索文章 |

### 5.2 Response Formats

**GET /api/news/live**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "华测检测拟收购某环境检测公司100%股权",
      "category": "并购",
      "hot": true,
      "sentiment": "positive",
      "time": "14:32",
      "views": 1234
    }
  ],
  "timestamp": "2026-05-17T14:32:00Z"
}
```

**GET /api/news/all**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

**GET /api/news/stats**
```json
{
  "success": true,
  "data": [
    { "label": "TIC行业指数", "value": "3865.32", "change": "+1.24%", "up": true, "icon": "📈" },
    { "label": "今日并购", "value": "12", "change": "+3", "up": true, "icon": "🤝" }
  ]
}
```

---

## 6. 数据采集流程

### 6.1 RSS 采集 (通过 RSSHub)

```python
# server/src/collectors/rss_collector.py
import feedparser
import httpx
import hashlib
from datetime import datetime

class RSSCollector:
    RSSHUB_BASE_URL = "http://rsshub:1200"

    def __init__(self, db_path):
        self.db_path = db_path

    async def collect_feed(self, feed_url: str, feed_id: int) -> list:
        """采集单个 RSS feed"""
        # 1. 通过 RSSHub 获取 feed
        rsshub_url = f"{self.RSSHUB_BASE_URL}{feed_url}"

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(rsshub_url)
            response.raise_for_status()

        # 2. 解析 feed
        feed = feedparser.parse(response.text)
        articles = []

        for entry in feed.entries:
            # 3. 检查是否重复
            md5 = hashlib.md5((entry.link + entry.title).encode()).hexdigest()

            # 4. 提取文章信息
            article = {
                'feed_id': feed_id,
                'md5': md5,
                'url': entry.link,
                'title': entry.title,
                'body': entry.get('summary', ''),
                'published_at': entry.get('published', None),
                'is_tic': self._check_tic_relevance(entry.title + ' ' + entry.get('summary', '')),
            }
            articles.append(article)

        return articles

    def _check_tic_relevance(self, text: str) -> bool:
        """检查文本是否与 TIC 相关"""
        text_lower = text.lower()
        for keyword in TIC_KEYWORDS:
            if keyword.lower() in text_lower:
                return True
        return False
```

### 6.2 调度器

```python
# server/src/collectors/scheduler.py
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler

class NewsScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()

    def start(self):
        # 每 30 秒采集实时快讯
        self.scheduler.add_job(
            self.collect_live_news,
            'interval',
            seconds=30,
            id='collect_live'
        )

        # 每 5 分钟采集完整 feed
        self.scheduler.add_job(
            self.collect_all_feeds,
            'interval',
            minutes=5,
            id='collect_all'
        )

        self.scheduler.start()

    async def collect_live_news(self):
        """采集实时快讯 - 仅采集财联社等快速源"""
        pass

    async def collect_all_feeds(self):
        """采集所有启用的 feed"""
        pass
```

---

## 7. 前端集成

### 7.1 newsService.js 改造

```javascript
// src/services/newsService.js

// 切换开关：使用真实数据还是 mock 数据
const USE_REAL_DATA = import.meta.env.VITE_USE_REAL_NEWS === 'true'

// 获取实时新闻
export const getLiveNews = async () => {
  if (!USE_REAL_DATA) {
    return getMockLiveNews() // 现有 mock
  }

  try {
    const response = await api.get('/news/live')
    return response.data
  } catch (error) {
    console.warn('Real news fetch failed, using mock:', error)
    return getMockLiveNews() // Fallback to mock
  }
}

// 获取热门新闻
export const getHotNews = async () => {
  if (!USE_REAL_DATA) {
    return getMockHotNews()
  }

  try {
    const response = await api.get('/news/hot')
    return response.data
  } catch (error) {
    console.warn('Real hot news failed, using mock:', error)
    return getMockHotNews()
  }
}

// 获取市场数据
export const getMarketStats = async () => {
  if (!USE_REAL_DATA) {
    return getMockMarketData()
  }

  try {
    const response = await api.get('/news/stats')
    return response.data
  } catch (error) {
    console.warn('Real market stats failed, using mock:', error)
    return getMockMarketData()
  }
}

// 获取所有新闻
export const getAllNews = async (filters = {}) => {
  if (!USE_REAL_DATA) {
    return getMockAllNews(filters)
  }

  try {
    const response = await api.get('/news/all', { params: filters })
    return response.data
  } catch (error) {
    console.warn('Real news failed, using mock:', error)
    return getMockAllNews(filters)
  }
}
```

### 7.2 环境变量

```bash
# .env.example
VITE_USE_REAL_NEWS=false  # 设置为 true 启用真实数据
VITE_NEWS_POLL_INTERVAL=30000  # 轮询间隔 (ms)
VITE_RSSHUB_URL=http://localhost:1200  # RSSHub 地址
```

---

## 8. 实现计划

### Phase 1: MVP (当前阶段)

**目标**: 仅通过 RSSHub 获取真实数据，替换 mock 数据

**任务**:

1. [ ] 创建 `server/src/collectors/` 目录
   - `rss_collector.py` - RSS 采集器
   - `tic_filter.py` - TIC 关键词过滤
   - `scheduler.py` - 调度器

2. [ ] 创建 `server/src/routes/news.ts`
   - `/api/news/live` - 实时快讯
   - `/api/news/hot` - 热门文章
   - `/api/news/all` - 所有文章
   - `/api/news/stats` - 市场数据

3. [ ] 创建 `server/src/utils/newsDb.ts`
   - SQLite 数据库初始化
   - 文章 CRUD 操作
   - TIC 标签处理

4. [ ] 创建 `server/data/news.db`
   - feeds 表
   - articles 表
   - market_stats 表

5. [ ] 改造前端 `src/services/newsService.js`
   - 添加真实 API 调用
   - 保留 mock fallback

6. [ ] 配置 RSS feeds
   - 财联社电报
   - 华尔街见闻
   - 第一财经
   - 36氪
   - 格隆汇

7. [ ] 添加环境变量和配置

8. [ ] 测试和验证

### Phase 2: 扩展 (后续)

- 添加 NewsAPI 支持
- 添加政府/监管来源爬虫
- 添加 SSE 实时推送
- 完善分类和标签系统

---

## 9. 错误处理与 Fallback

### 9.1 多级 Fallback

```javascript
async function getNewsWithFallback(endpoint) {
  // 1. 尝试真实 API
  try {
    const response = await api.get(endpoint)
    if (response.data && response.data.length > 0) {
      return response.data
    }
  } catch (e) {
    console.warn(`Real API failed for ${endpoint}:`, e)
  }

  // 2. 返回 mock 数据
  return getMockDataForEndpoint(endpoint)
}
```

### 9.2 健康检查

```typescript
// GET /api/news/health
app.get('/api/news/health', async (req, res) => {
  const db_ok = await checkNewsDb()
  const rsshub_ok = await checkRssHub()
  const last_collect = await getLastCollectTime()

  res.json({
    status: db_ok && rsshub_ok ? 'ok' : 'degraded',
    db: db_ok ? 'ok' : 'error',
    rsshub: rsshub_ok ? 'ok' : 'error',
    last_collect,
    using_mock: !db_ok || !rsshub_ok
  })
})
```

---

## 10. 监控与日志

### 10.1 日志

```python
import logging

logger = logging.getLogger(__name__)

async def collect_feed(feed_id: int, url: str):
    logger.info(f"Collecting feed {feed_id}: {url}")
    try:
        articles = await rss_collector.collect_feed(url, feed_id)
        logger.info(f"Collected {len(articles)} articles from feed {feed_id}")
        for art in articles:
            logger.debug(f"  - {art['title'][:50]}... (is_tic={art['is_tic']})")
    except Exception as e:
        logger.error(f"Failed to collect feed {feed_id}: {e}")
```

### 10.2 统计

- 每日采集文章数量
- TIC 相关文章比例
- 各来源成功率
- 热门文章点击统计

---

## 11. 配置示例

### 11.1 RSS Feeds 配置

```json
[
  {
    "name": "财联社电报",
    "url": "/cls/telegraph",
    "source_type": "rss",
    "category": "financial",
    "tags": ["快讯", "实时", "A股"],
    "poll_interval_minutes": 5
  },
  {
    "name": "华尔街见闻",
    "url": "/wallstreetcn/news/global",
    "source_type": "rss",
    "category": "financial",
    "tags": ["财经", "宏观", "市场"],
    "poll_interval_minutes": 30
  },
  {
    "name": "第一财经",
    "url": "/yicai/news",
    "source_type": "rss",
    "category": "financial",
    "tags": ["财经", "产业"],
    "poll_interval_minutes": 30
  },
  {
    "name": "36氪",
    "url": "/36kr/news/latest",
    "source_type": "rss",
    "category": "financial",
    "tags": ["科技", "创业", "投资"],
    "poll_interval_minutes": 30
  },
  {
    "name": "格隆汇热门文章",
    "url": "/gelonghui/hot-article",
    "source_type": "rss",
    "category": "financial",
    "tags": ["港股", "投资", "市场"],
    "poll_interval_minutes": 30
  }
]
```

---

## 12. 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| RSSHub 不可用 | 本地缓存 + mock fallback |
| RSS 源无响应 | 超时设置 + 重试机制 |
| 数据库过大 | 自动清理 >30 天文章 |
| TIC 关键词遗漏 | 动态更新关键词列表 |
| 采集频率限制 | 遵守 robots.txt + 限流 |

---

**下一步**: 等待用户确认设计后，开始编写 Implementation Plan。