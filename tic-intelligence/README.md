# TIC智能资讯中枢

检验检测认证(TIC)行业资讯智能采集与视频生成系统

## 功能特性

### 1. 资讯采集
- 自动爬取TIC领域并购资讯、政策动态、头部公司新闻
- 支持多个数据源配置
- 定时任务与手动触发

### 2. 数据分析
- 舆情分析（正面/中性/负面）
- 分类统计（并购/政策/公司）
- 趋势可视化

### 3. 视频生成
- 选择资讯自动生成视频
- 多种视频模板可选
- 视频任务队列管理

## 项目结构

```
tic-intelligence/
├── server/                 # 后端服务
│   ├── routes/            # API路由
│   ├── services/          # 业务服务
│   │   ├── crawler.js     # 爬虫服务
│   │   ├── database.js    # 数据库
│   │   └── videoGenerator.js  # 视频生成
│   └── index.js           # 入口文件
└── client/                # 前端应用
    └── src/
        ├── components/    # React组件
        └── App.jsx        # 主应用
```

## 快速启动

### 1. 启动后端服务

```bash
cd tic-intelligence/server
npm install
node index.js
```

后端服务将在 http://localhost:3001 启动

### 2. 启动前端开发服务器

```bash
cd tic-intelligence/client
npm install
npm run dev
```

前端应用将在 http://localhost:5173 启动

### 3. 访问应用

打开浏览器访问 http://localhost:5173

## 技术栈

### 后端
- Express.js - Web框架
- better-sqlite3 - SQLite数据库
- axios + cheerio - 爬虫
- node-schedule - 定时任务

### 前端
- React 18
- Tailwind CSS
- Recharts - 图表
- Lucide React - 图标

## 数据源配置

编辑 `server/services/crawler.js` 中的 `crawlSources` 数组添加新的数据源：

```javascript
{
  name: '数据源名称',
  baseUrl: 'https://example.com',
  enabled: true,
  type: 'ma' // ma/policy/company
}
```

## 视频生成

视频生成依赖 FFmpeg，确保系统已安装：

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
# 从 https://ffmpeg.org 下载安装
```

## API接口

| 接口 | 方法 | 描述 |
|------|------|------|
| /api/news | GET | 获取资讯列表 |
| /api/news/:id | DELETE | 删除资讯 |
| /api/stats/dashboard | GET | 获取统计数据 |
| /api/crawl/run | POST | 触发爬虫 |
| /api/video/generate | POST | 生成视频 |
