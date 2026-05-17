# TIC 并购资讯模块实现计划

**日期**: 2026-05-17
**状态**: 实施中
**设计文档**: [2026-05-17-tic-news-module-design.md](2026-05-17-tic-news-module-design.md)

---

## 概述

本计划将指导 TIC 并购资讯模块的开发，采用 TDD (测试驱动开发) 方法。每个任务遵循 "写测试 → 运行测试(失败) → 实现 → 运行测试(通过) → 提交" 的流程。

---

## 任务列表

### Phase 1: 数据库层

#### Task 1.1: 创建 news.db 数据库初始化脚本

**目标**: 创建 SQLite 数据库初始化模块

**文件**: `server/src/utils/newsDb.ts`

**测试场景**:
- 数据库初始化成功
- feeds 表创建成功
- articles 表创建成功
- market_stats 表创建成功

**实现内容**:
```typescript
// 初始化 news.db
// 创建表: feeds, articles, article_tags, market_stats
// 创建索引
```

---

#### Task 1.2: 实现新闻源 (Feeds) CRUD 操作

**目标**: 提供新闻源的增删改查功能

**文件**: `server/src/utils/newsDb.ts` (扩展)

**测试场景**:
- 创建新闻源
- 获取新闻源列表
- 更新新闻源
- 删除新闻源
- 获取启用的新闻源

---

#### Task 1.3: 实现文章 (Articles) CRUD 操作

**目标**: 提供文章的增删改查功能

**文件**: `server/src/utils/newsDb.ts` (扩展)

**测试场景**:
- 插入文章 (带去重)
- 按 feed_id 查询文章
- 按 TIC 标签查询文章
- 分页查询文章
- 更新文章热门状态

---

### Phase 2: 数据采集层

#### Task 2.1: 创建 TIC 关键词过滤器 (废弃，改用 AI 分析)

**目标**: 采集所有文章，不做 TIC 过滤，由 AI 在后续步骤判断

**说明**: 采集器采集所有 RSS 文章，存储到数据库。AI 分析将在 Task 2.4 中定时批量执行。

---

#### Task 2.2: 创建 RSS 采集器

**目标**: 实现 RSS feed 采集功能

**文件**: `server/src/collectors/rssCollector.ts`

**测试场景**:
- 通过 RSSHub 获取 feed
- 解析 feed entries
- 生成文章 MD5 用于去重
- 存储所有文章 (不过滤)

---

#### Task 2.3: 创建数据采集调度器

**目标**: 实现定时采集调度

**文件**: `server/src/collectors/scheduler.ts`

**测试场景**:
- 每 5 分钟采集所有启用的 feeds
- 记录采集状态
- 触发 AI 分析任务 (每小时)

---

#### Task 2.4: 创建 AI 新闻分析器 (新增)

**目标**: 使用 AI 自动判断新闻是否涉及检测行业及兼并购

**文件**: `server/src/collectors/newsAnalyzer.ts`

**AI 分析内容**:
- `is_tic`: 是否与检测行业相关 (0/1)
- `is_ma`: 是否涉及兼并购 (0/1)
- `category`: 分类 (行业研究/技术前沿/案例分析/合规指南/市场分析)
- `sentiment`: 情感 (positive/negative/neutral)
- `confidence`: AI 判断置信度 (0-1)

**定时执行**: 每小时批量分析未分析的文章

**测试场景**:
- 分析单篇文章并返回结构化结果
- 批量分析多篇文章
- 更新数据库中的分析结果
- 跳过已分析的文章 (避免重复处理)

---

### Phase 3: API 层

#### Task 3.1: 创建新闻 API 路由

**目标**: 实现新闻相关 REST API

**文件**: `server/src/routes/news.ts`

**API 端点**:
- `GET /api/news/live` - 实时快讯
- `GET /api/news/hot` - 热门文章
- `GET /api/news/all` - 所有文章
- `GET /api/news/stats` - 市场数据

**测试场景**:
- 获取实时快讯
- 获取热门文章
- 获取分页文章列表
- 按分类过滤
- 获取市场数据

---

#### Task 3.2: 创建新闻源管理 API

**目标**: 实现新闻源管理 API

**文件**: `server/src/routes/news.ts` (扩展)

**API 端点**:
- `GET /api/news/feeds` - 获取新闻源列表
- `POST /api/news/feeds` - 添加新闻源
- `PUT /api/news/feeds/:id` - 更新新闻源
- `DELETE /api/news/feeds/:id` - 删除新闻源

**测试场景**:
- CRUD 操作正常
- 参数验证通过

---

#### Task 3.3: 注册新闻路由到 Express

**目标**: 将新闻 API 挂载到 Express 应用

**文件**: `server/src/index.ts`

**测试场景**:
- 路由正确注册
- 健康检查端点工作

---

### Phase 4: 前端集成

#### Task 4.1: 更新 newsService.js

**目标**: 将 mock 数据切换为真实 API 调用

**文件**: `src/services/newsService.js`

**测试场景**:
- 调用 `/api/news/live` 获取实时数据
- 调用 `/api/news/hot` 获取热门数据
- 调用 `/api/news/all` 获取文章列表
- 调用 `/api/news/stats` 获取市场数据
- fallback 到 mock 数据

---

#### Task 4.2: 添加环境变量配置

**目标**: 添加 news 模块相关配置

**文件**: `.env.example`, `src/services/newsService.js`

**配置项**:
- `VITE_USE_REAL_NEWS` - 是否使用真实数据
- `VITE_NEWS_POLL_INTERVAL` - 轮询间隔
- `VITE_RSSHUB_URL` - RSSHub 地址

---

### Phase 5: 初始化数据与测试

#### Task 5.1: 配置初始 RSS Feeds

**目标**: 预配置 TIC 相关 RSS 源

**文件**: `server/src/collectors/initFeeds.ts`

**Feeds 配置**:
- 财联社电报
- 华尔街见闻
- 第一财经
- 36氪
- 格隆汇热门文章

---

#### Task 5.2: 端到端测试

**目标**: 验证完整数据流

**测试场景**:
1. 启动 RSSHub (或使用 mock)
2. 触发数据采集
3. 验证文章存储
4. 调用 API 获取数据
5. 前端正确显示

---

## 执行顺序

```
Phase 1 (数据库层)
  Task 1.1 → Task 1.2 → Task 1.3
       ↓
Phase 2 (采集层)
  Task 2.1 → Task 2.2 → Task 2.3 → Task 2.4 (AI 分析器)
       ↓
Phase 3 (API层)
  Task 3.1 → Task 3.2 → Task 3.3
       ↓
Phase 4 (前端集成)
  Task 4.1 → Task 4.2
       ↓
Phase 5 (测试)
  Task 5.1 → Task 5.2
```

---

## 技术细节

### 数据库 Schema

```sql
-- feeds 表
CREATE TABLE feeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    source_type TEXT DEFAULT 'rss',
    category TEXT,
    tags TEXT,
    poll_interval_minutes INTEGER DEFAULT 30,
    enabled INTEGER DEFAULT 1,
    last_collected_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- articles 表
CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feed_id INTEGER REFERENCES feeds(id),
    md5 TEXT UNIQUE,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    published_at TEXT,
    collected_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_tic INTEGER DEFAULT 0,        -- AI 判断：是否与检测行业相关
    is_ma INTEGER DEFAULT 0,         -- AI 判断：是否涉及兼并购
    sentiment TEXT,                  -- AI 分析：'positive', 'negative', 'neutral'
    category TEXT,                   -- AI 分类：'行业研究', '技术前沿', '案例分析', '合规指南', '市场分析'
    ai_confidence REAL,             -- AI 判断置信度
    analyzed_at TEXT,                -- AI 分析时间
    hot INTEGER DEFAULT 0,          -- 是否热门
    views INTEGER DEFAULT 0
);

-- market_stats 表
CREATE TABLE market_stats (
    id INTEGER PRIMARY KEY,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    change TEXT,
    up INTEGER,
    icon TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### TIC 关键词

```typescript
const TIC_KEYWORDS = [
  '检测', '检验', '认证', 'TIC', '核查', '校准', '评测',
  '华测检测', '谱尼测试', 'SGS', 'BV', 'Intertek', '天祥', 'UL',
  '中检集团', '中国检验认证', '国检集团', '广电计量', '钢研纳克',
  'CMA', 'CNAS', '检测报告', '检验检测', '认证认可',
  '并购', '收购', '股权转让', '战略投资', 'PE', 'VC', '并购重组',
];
```

---

## 成功标准

1. ✅ `GET /api/news/live` 返回真实新闻数据 (或 mock fallback)
2. ✅ `GET /api/news/hot` 返回热门文章
3. ✅ `GET /api/news/all` 返回分页文章列表
4. ✅ `GET /api/news/stats` 返回市场数据
5. ✅ 前端 NewsPage 正确显示数据
6. ✅ Fallback 机制正常工作 (数据源不可用时)

---

## 下一步

执行 Task 1.1: 创建 `server/src/utils/newsDb.ts` 数据库初始化模块。

---

**完成时间**: 预计 2-3 小时 (不含 RSSHub 配置)