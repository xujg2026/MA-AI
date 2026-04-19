# MA-AI (TIC Intelligence Hub)

检验检测认证(TIC)行业并购资讯智能采集与AI可视化平台

## 核心功能

- **AI 尽职调查** - 自动生成投融资尽调报告
- **智能匹配** - AI驱动的并购标的匹配
- **企业估值** - 多维度企业价值分析
- **Buyer Screening** - 潜在收购方智能筛选
- **MX Skills** - 东方财富金融数据技能集成

## 技术栈

- **前端**: React 19 + Vite + TailwindCSS + Zustand
- **后端**: Express.js + TypeScript
- **数据技能**: mx-skills (东方财富 API)

## MX Skills (14个金融数据技能)

| 技能 | 功能 |
|------|------|
| mx-finance-search | 金融资讯搜索 |
| mx-finance-data | 金融数据获取 |
| mx-stocks-screener | 股票筛选器 |
| mx-macro-data | 宏观数据 |
| fund-diagnosis | 基金诊断 |
| stock-diagnosis | 股票诊断 |
| stock-earnings-review | 业绩点评 |
| stock-market-hotspot-discovery | 市场热点发现 |
| industry-research-report | 行业研究报告 |
| initiation-of-coverage-or-deep-dive | 深度研究 |
| comparable-company-analysis | 可比公司分析 |
| industry-stock-tracker | 行业股票追踪 |
| topic-research-report | 主题研究报告 |
| mx-financial-assistant | 金融助手 |

## 快速启动

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install

# 启动前端开发服务器
npm run dev

# 启动后端服务器
cd server && npm run dev
```

## 环境配置

在 `server/` 目录创建 `.env` 文件：

```env
EM_API_KEY=your_eastmoney_api_key
PORT=3001
```

## 项目结构

```
MA-AI/
├── src/                    # React 前端源码
│   ├── components/         # UI 组件
│   ├── pages/              # 页面
│   └── data/               # 数据模板
├── server/                 # Express 后端
│   ├── src/routes/         # API 路由
│   └── src/utils/          # 工具函数
├── mx-skills/              # 金融数据技能包
└── public/                 # 静态资源
```
