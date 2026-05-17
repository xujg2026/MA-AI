# MA-AI 并购AI智能工作台 技术说明文档

**项目版本:** v1.1
**更新日期:** 2026-05-17
**开发团队:** MA-AI Development Team

---

## 一、项目背景

### 1.1 项目名称与定位

**MA-AI 并购AI智能工作台**（简称MA-AI）是一个围绕并购业务场景设计的智能应用平台，聚焦于**检验检测认证行业（TIC行业）**的并购标的筛选与买家匹配。

项目以"AI赋能并购决策"为核心理念，整合多源外部数据（企业工商信息、财务数据、行业资质、公告资讯等），通过AI算法实现潜在买家的智能筛选与推荐，提升并购业务的效率和决策质量。

### 1.2 业务场景

本项目主要服务于以下业务场景：

| 场景 | 描述 |
|------|------|
| **标的筛选** | 从TIC行业数据库中筛选符合条件的并购标的，支持行业、地区、人员规模、注册资本等多维筛选 |
| **买家匹配** | 基于标的公司的核心资质、业务范围、战略诉求，智能匹配潜在买家 |
| **尽职调查** | 集成企业情报（工商信息、司法风险、经营异常等），辅助尽调决策 |
| **项目管控** | 对并购项目全生命周期进行管理，追踪各阶段进展 |
| **认证核验** | 实时查询企业CNCA认证资质，确保标的企业合规性 |

### 1.3 核心目标

1. **提升筛选效率**：通过AI算法替代人工初筛，快速从海量企业中锁定潜在标的
2. **降低并购风险**：整合多维度企业数据，提供全面的风险评估
3. **规范项目管理**：建立标准化的项目流程，确保并购过程可控可追溯
4. **赋能决策分析**：提供量化的评分体系和可视化的对比分析

### 1.4 目标用户

- **投资机构**：PE/VC的并购团队，用于筛选潜在收购标的
- **企业战略部门**：上市公司或大型企业的战略投资部门
- **投行/FA**：财务顾问机构，用于客户项目执行
- **TIC企业**：检验检测认证企业，用于寻找被并购机会

---

## 二、系统架构

### 2.1 整体架构

MA-AI采用经典的**前后端分离架构**，前端提供用户交互界面，后端负责业务逻辑处理和数据整合。

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户浏览器                              │
│                    (React SPA 应用)                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP/HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Vite 开发服务器                            │
│                   (src/ 前端源码)                               │
│                  开发时做热更新，生产时构建                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │ /api 代理
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express 后端服务                             │
│                 (server/src/ 后端源码)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Routes      │  │ Services    │  │ Utils                   │ │
│  │ - buyer     │  │ - qccApi    │  │ - financialScore       │ │
│  │ - projects  │  │ - mxSkill  │  │ - strategicScore       │ │
│  │ - tic       │  │             │  │ - akshareData         │ │
│  │ - cnca      │  │             │  │ - cncaCache           │ │
│  │ - qcc       │  │             │  │ - ticCompanyDb       │ │
│  │ - news      │  │             │  │ - projectDb          │ │
│  │ - dd-custom │  │             │  │ - newsDb             │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                  │
        ▼                 ▼                  ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────────────────────┐
│   SQLite      │ │  Python进程   │ │      外部API服务              │
│   Databases   │ │  (AKShare)    │ │                               │
│ - projects.db │ │               │ │ - QCC企查查MCP              │
│ - a_stocks.db │ │               │ │ - CNCA官网 (Puppeteer)       │
│ - cnca_cache  │ │               │ │ - OpenAI/Anthropic LLM       │
│ - news.db     │ │               │ │                               │
└───────────────┘ └───────────────┘ └───────────────────────────────┘
```

### 2.2 技术栈概览

| 层级 | 技术选型 | 版本 | 说明 |
|------|---------|------|------|
| **前端框架** | React | 19.2.4 | 核心UI框架 |
| **构建工具** | Vite | 8.0.4 | 快速开发体验 |
| **路由管理** | React Router | 7.14.0 | SPA路由 |
| **状态管理** | Zustand | 5.0.12 | 轻量级状态管理 |
| **样式框架** | Tailwind CSS | 4.2.2 | 原子化CSS |
| **图表库** | Recharts | 最新 | 数据可视化 |
| **后端框架** | Express | 4.18.2 | Node.js Web框架 |
| **开发语言** | TypeScript | 5.3 | 类型安全 |
| **运行时** | Node.js + tsx | - | 支持TypeScript直接运行 |
| **数据库** | SQLite (better-sqlite3) | 12.9.0 | 轻量级嵌入式数据库 |
| **Python集成** | python-shell / child_process | - | 调用AKShare数据 |

### 2.3 目录结构

```
MA-AI/
├── src/                          # 前端源码
│   ├── pages/                    # 路由级页面组件
│   │   ├── HomePage.jsx          # 首页
│   │   ├── AIFinderPage.jsx      # AI觅售/TIC企业查询
│   │   ├── BuyerMatchingPage.jsx  # 买家匹配工作流
│   │   ├── BuyerMatchInputPage.jsx
│   │   ├── ProjectListPage.jsx    # 项目列表
│   │   ├── ProjectDetailPage.jsx  # 项目详情
│   │   ├── AIDueDiligencePage.jsx # AI尽调
│   │   └── ...
│   ├── components/               # 可复用组件
│   │   ├── ai/                   # AI相关组件
│   │   ├── layout/               # 布局组件
│   │   ├── projects/             # 项目管理组件
│   │   └── ui/                   # 通用UI组件
│   ├── services/                 # 前端服务层
│   │   └── api.js                # 统一API客户端
│   ├── stores/                   # Zustand状态存储
│   │   ├── projectStore.js       # 项目状态
│   │   └── ...
│   └── data/                     # 本地数据
│       ├── mockData.js           # Mock数据
│       └── excelData.js          # Excel导入数据
│
├── server/                       # 后端源码
│   └── src/
│       ├── index.ts               # 服务入口
│       ├── config/               # 配置
│       │   ├── llm.ts            # LLM配置
│       │   └── qcc.ts           # 企查查配置
│       ├── routes/              # 路由
│       │   ├── buyerScreeningAgent.ts  # 买家筛选主路由
│       │   ├── buyerProfile.ts         # 买家画像
│       │   ├── buyerScreen.ts          # 规则初筛
│       │   ├── projects.ts             # 项目管理
│       │   ├── ticCompanies.ts        # TIC企业查询
│       │   ├── cncaCertification.ts    # CNCA认证
│       │   ├── qcc.ts                  # 企查查
│       │   ├── imports.ts              # Excel导入
│       │   ├── news.ts                 # 新闻资讯
│       │   └── ddCustomItems.ts        # 自定义尽调清单
│       ├── collectors/             # 新闻采集器
│       │   ├── rssCollector.ts         # RSS采集
│       │   ├── newsAnalyzer.ts        # AI新闻分析
│       │   ├── scheduler.ts           # 采集调度器
│       │   └── initFeeds.ts           # 初始化默认新闻源
│       ├── services/             # 外部服务适配
│       │   └── qccApi.ts         # 企查查API封装
│       ├── utils/                # 工具函数
│       │   ├── financialScore.ts     # 财务评分
│       │   ├── strategicScore.ts     # 战略评分
│       │   ├── akshareData.ts        # AKShare数据
│       │   ├── cncaCache.ts          # CNCA缓存
│       │   ├── ticCompanyDb.ts       # TIC数据库
│       │   ├── projectDb.ts         # 项目数据库
│       │   └── newsDb.ts            # 新闻数据库
│       └── scripts/              # 初始化脚本
│           ├── initTicCompaniesDb.ts # TIC数据导入
│           └── ...
│
├── docs/                         # 文档
│   ├── Summary.md               # 开发总结
│   ├── project-overview.md       # 项目概览
│   ├── backend-api.md           # 后端API清单
│   ├── plans/                   # 设计文档
│   └── technical-documentation.md # 本文档
│
├── mx-skills/                    # 东方财富技能包
│   └── mx-skills/               # 14个金融数据技能
│       ├── mx-finance-data/
│       ├── mx-finance-search/
│       └── ...
│
└── server/data/                  # SQLite数据库文件
    ├── projects.db              # 项目数据库
    ├── a_stocks.db              # A股数据
    ├── tic_companies.db          # TIC企业数据
    ├── cnca_cache.db            # CNCA缓存
    ├── news.db                  # 新闻资讯数据库
    └── dd_custom_items.db       # 自定义尽调清单
```

---

## 三、核心功能模块

### 3.1 AI觅售筛选（TIC企业查询）

**模块入口**: `src/pages/AIFinderPage.jsx`

#### 功能概述

TIC企业查询模块从本地SQLite数据库中检索符合条件的检验检测认证企业，支持多维度的组合筛选条件。

#### 筛选条件

| 字段 | 类型 | 说明 |
|------|------|------|
| keyword | 文本 | 企业名称关键字搜索 |
| industry | 下拉 | 国标行业门类 |
| companyType | 下拉 | 企业类型（民营、国营、外资等） |
| socialSecurity | 范围 | 社保缴纳人数区间 |
| registeredCapital | 范围 | 注册资本区间 |
| establishmentDate | 日期 | 成立日期下限 |
| province/city/county | 三级联动 | 地区筛选（省-市-区县） |
| hasPhone | 布尔 | 是否有联系电话 |
| hasWebsite | 布尔 | 是否有网址 |
| businessScope | 文本 | 经营范围模糊搜索 |

#### 数据显示

企业卡片展示以下信息：
- 企业名称（可跳转企查查详情）
- 法定代表人
- 经营状态
- 注册资本
- 成立日期
- 行业分类
- 地区
- 参保人数
- 统一社会信用代码
- 联系电话/网址
- 经营范围摘要
- 风险状态标签（失信被执行人、被执行人、限制高消费、司法冻结、经营异常）

#### 业务流程

```
用户输入筛选条件
       ↓
点击搜索按钮
       ↓
前端组装查询参数 → GET /api/tic-companies
       ↓
后端查询SQLite tic_companies表
       ↓
返回分页结果（每页20条）
       ↓
前端渲染企业卡片
```

### 3.2 AI买家匹配与筛选

**模块入口**: `src/pages/BuyerMatchingPage.jsx`, `src/pages/BuyerMatchInputPage.jsx`
**核心路由**: `server/src/routes/buyerScreeningAgent.ts`

#### 功能概述

买家匹配模块是MA-AI的核心功能，基于标的公司的核心参数（行业、规模、估值、资质等），从A股上市公司数据库中筛选出符合条件的潜在收购方，并进行多维度评分排序。

#### 输入参数

```json
{
  "targetCompany": {
    "name": "目标公司名称",
    "mainBusiness": "主营业务",
    "coreCerts": ["CMA", "CNAS"],
    "region": "华东地区",
    "estimatedValue": 50000,
    "annualProfit": 6000,
    "employeeScale": "100-500人",
    "acquisitionMotivation": "行业整合",
    "industry": "检测认证"
  },
  "limit": 10
}
```

#### 完整调用链路

```
用户输入"上海国缆检测股份有限公司"
         ↓
① getCompanyInfoWithFallback    ← 企查查API 或 用户输入降级
         ↓
② analyzeCompanyProfile (LLM, 60s+3次重试) ← 公司画像，提取关键词
         ↓
③ searchStocks(keywords)       ← 本地 A股 SQLite 搜索候选公司
         ↓
④ getFinancialData + getNewsData  ← AKShare 财务+新闻
    + getAnnouncements (位置索引修复) ← AKShare 公告列表（按M&A关键词过滤）
         ↓
⑤ fetchAnnouncementContent (Eastmoney官方API) ← 公告正文获取
         ↓
⑥ analyzeMAExperienceWithLLM (LLM, 60s+3次重试) ← 判断真实并购经历
         ↓
⑦ calculateFinancialHealthScore  ← 财务健康度 50%
         ↓
⑧ calculateStrategicAlignmentScore (含LLM并购分析) ← 战略协同性 50%
         ↓
⑨ assignGrade → S/A/B/C/D
         ↓
finalRecommendations → buildTiersFromCandidates → 四梯队展示
```

#### 输出结果

```json
{
  "success": true,
  "data": {
    "screeningReport": {
      "targetCompany": { "name": "...", "industry": "..." },
      "finalRecommendations": [
        {
          "stockCode": "000001",
          "companyName": "平安银行",
          "tier": "S",
          "totalScore": 88.5,
          "financialScore": 45.2,
          "strategicScore": 43.3,
          "mainBusinessMatch": "高度匹配",
          "hasMAExperience": true,
          "hasCertification": true,
          "financialData": { "roe": 12.5, "grossMargin": 45.2, ... }
        },
        ...
      ],
      "statistics": {
        "totalCandidates": 50,
        "tierCounts": { "S": 3, "A": 8, "B": 15, "C": 20, "D": 4 }
      }
    }
  }
}
```

### 3.3 CNCA认证状态查询

**模块入口**: `src/pages/AIFinderPage.jsx`
**核心路由**: `server/src/routes/cncaCertification.ts`

#### 功能概述

CNCA（中国国家认证认可监督管理委员会）认证查询模块，用于验证TIC企业是否具有CNCA颁发的认证资质。

#### 技术实现

1. **Puppeteer MCP集成**: 后端通过 `@modelcontextprotocol/server-puppeteer` 启动无头浏览器
2. **页面自动化**: 自动填写表单、点击查询、解析结果
3. **缓存机制**: 认证结果缓存24小时，避免重复爬取

#### API接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/cnca-certification/verify-batch` | 批量验证企业CNCA认证状态 |
| GET | `/api/cnca-certification/status/:companyName` | 查询单家企业缓存状态 |

#### 交互流程

```
用户点击"刷新认证状态"按钮
       ↓
前端 POST /api/cnca-certification/verify-batch
       ↓
后端启动Puppeteer MCP
       ↓
访问CNCA官网列表页
       ↓
遍历企业名称搜索
       ↓
提取认证编号、机构批准号
       ↓
缓存结果到cnca_cache.db
       ↓
返回认证状态
       ↓
前端更新企业卡片Badge
```

### 3.4 项目管理模块

**模块入口**: `src/pages/ProjectListPage.jsx`, `src/pages/ProjectDetailPage.jsx`
**核心路由**: `server/src/routes/projects.ts`

#### 功能概述

项目管理模块实现并购项目的全生命周期管理，支持创建项目、关联标的、追踪各阶段进展。

#### 核心功能

| 功能 | 说明 |
|------|------|
| 项目列表 | 状态筛选（草稿/进行中/已完成）、关键词搜索、分页 |
| 项目详情 | 基本信息、财务数据、觅售报告、交易流程 |
| 项目创建/编辑 | 表单录入，支持Excel批量导入 |
| 阶段管理 | 协议签署、尽职调查、估值、匹配、推荐书各阶段 |
| 觅售归集 | 将AI觅售结果归集到指定项目 |

#### 数据库表结构

**projects表**:
```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  industry TEXT,
  region TEXT,
  estimated_value TEXT,
  source TEXT DEFAULT 'manual',
  company_name TEXT,
  company_type TEXT,
  registration_capital TEXT,
  establishment_date TEXT,
  employee_count TEXT,
  sell_motivation TEXT,
  risk_level TEXT,
  change_records TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  is_deleted INTEGER DEFAULT 0
)
```

**project_phases表**:
```sql
CREATE TABLE project_phases (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  phase TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  started_at TEXT,
  completed_at TEXT,
  output_data TEXT
)
```

### 3.5 企业情报（企查查集成）

**模块入口**: `src/pages/AIDueDiligencePage.jsx`
**核心路由**: `server/src/routes/qcc.ts`
**服务封装**: `server/src/services/qccApi.ts`

#### 功能概述

通过企查查API获取企业的全方位工商信息、风险数据、知识产权等，用于尽职调查阶段。

#### 数据维度

| 维度 | 数据项 |
|------|--------|
| 企业基础信息 | 名称、法定代表人、注册资本、成立日期 |
| 股东信息 | 股东列表、持股比例、实际控制人 |
| 司法风险 | 被执行人、失信被执行人、限制高消费 |
| 经营异常 | 经营异常、行政处罚 |
| 知识产权 | 专利、商标、软件著作权 |
| 资质资格 | 建筑资质、安全生产许可等 |
| 中标信息 | 政府招标中标记录 |

### 3.6 新闻资讯模块

**模块入口**: `src/pages/NewsPage.jsx`
**核心路由**: `server/src/routes/news.ts`
**数据库工具**: `server/src/utils/newsDb.ts`
**采集器**: `server/src/collectors/` (rssCollector.ts, newsAnalyzer.ts, scheduler.ts)

#### 功能概述

新闻资讯模块实现 TIC 行业相关新闻的采集、存储、AI 分析和展示，支持多新闻源管理和实时快讯获取。

#### 核心功能

| 功能 | 说明 |
|------|------|
| 实时快讯 | 来自财联社等快讯源的最新新闻 |
| 热门文章 | 按热度排序的热门新闻 |
| TIC/M&A 分类 | 自动识别 TIC 行业和并购相关文章 |
| AI 情感分析 | 自动分析新闻情感倾向（正面/负面/中性） |
| 新闻源管理 | RSS Feed 的增删改查 |
| 手动触发采集 | 支持手动触发新闻采集和 AI 分析 |
| Mock Fallback | 当真实后端不可用时回退到本地 mock 数据 |

#### 数据库表结构

**feeds 表**:
```sql
CREATE TABLE feeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  source_type TEXT DEFAULT 'rss',
  category TEXT,
  tags TEXT,
  poll_interval_minutes INTEGER DEFAULT 30,
  enabled INTEGER DEFAULT 1,
  last_fetch_at TEXT,
  last_error TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
```

**articles 表**:
```sql
CREATE TABLE articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feed_id INTEGER REFERENCES feeds(id),
  title TEXT NOT NULL,
  body TEXT,
  url TEXT,
  published_at TEXT,
  collected_at TEXT DEFAULT CURRENT_TIMESTAMP,
  category TEXT,
  tags TEXT,
  hot INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_tic INTEGER DEFAULT 0,
  is_ma INTEGER DEFAULT 0,
  sentiment TEXT,
  sentiment_score REAL,
  analyzed_at TEXT,
  summary TEXT
)
```

#### 前端服务

`src/services/newsService.js` 提供以下接口：

- `getLiveNews()` — 实时快讯
- `getHotNews()` — 热门文章
- `getAllNews(filters)` — 所有/筛选文章
- `getMarketStats()` — 市场数据
- `searchNews(keyword)` — 搜索新闻
- `triggerCollection()` — 手动触发采集
- `triggerAnalysis(count)` — 手动触发 AI 分析

环境变量 `VITE_USE_REAL_NEWS=true` 时使用真实后端，否则使用 mock fallback。

#### 依赖

- `rss-parser` — RSS 订阅源解析
- `node-html-parser` — HTML 内容解析
- LLM API — 用于新闻情感分析和 TIC/M&A 分类

---

## 四、核心算法

### 4.1 买家筛选评分体系

MA-AI采用**双维度评分体系**，财务健康度占50%，战略协同性占50%。

**代码文件**: `server/src/routes/buyerScreeningAgent.ts:267`

#### 总体评分公式

```typescript
// 综合评分 = 财务健康度 × 50% + 战略协同性 × 50%
const overallScore = financialScore.score * 0.5 + strategicScore.score * 0.5
```

#### 分级标准

**代码文件**: `server/src/routes/buyerScreeningAgent.ts:70-76`

| 等级 | 分值区间 | 说明 |
|------|---------|------|
| S | >= 85 | 优秀，高度推荐 |
| A | >= 75 | 良好，优先考虑 |
| B | >= 65 | 中等，可纳入备选 |
| C | >= 50 | 一般，需进一步评估 |
| D | < 50 | 较差，不推荐 |

```typescript
function assignGrade(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (score >= 85) return 'S'
  if (score >= 75) return 'A'
  if (score >= 65) return 'B'
  if (score >= 50) return 'C'
  return 'D'
}
```

---

### 4.2 财务健康度评分（50%）

**代码文件**: `server/src/utils/financialScore.ts`

#### 评分维度与权重

| 子维度 | 权重 | 说明 |
|--------|------|------|
| 盈利能力 | 25% | ROE、毛利率、净利润规模 |
| 现金实力 | 15% | 货币资金/估值 |
| 负债安全 | 10% | 资产负债率 |

#### 各指标评分阈值

**1. ROE评分** (`scoreROE`)

| ROE | 得分 | 等级 |
|-----|------|------|
| ≥20% | 100 | 优秀 |
| ≥15% | 80 | 良好 |
| ≥10% | 60 | 一般 |
| ≥5% | 40 | 较差 |
| <5% | 30 | 极差 |

**2. 毛利率评分** (`scoreGrossMargin`)

| 毛利率 | 得分 | 等级 |
|--------|------|------|
| ≥40% | 100 | 优秀 |
| ≥20% | 70 | 良好 |
| ≥10% | 50 | 一般 |
| ≥5% | 30 | 较差 |
| <5% | 20 | 极差 |

**3. 净利润规模评分** (`scoreNetProfit`)

| 净利润 | 得分 | 等级 |
|--------|------|------|
| ≥100亿 | 100 | 优秀 |
| ≥10亿 | 80 | 良好 |
| ≥1亿 | 60 | 一般 |
| ≥0.1亿 | 40 | 较差 |
| ≥0 | 30 | 亏损 |
| <0 | 20 | 大幅亏损 |

**4. 现金比率评分** (`scoreCashRatio`)

| 现金比率 | 得分 | 等级 |
|----------|------|------|
| ≥1.5 | 100 | 充裕 |
| ≥1.0 | 80 | 充足 |
| ≥0.5 | 60 | 一般 |
| ≥0.2 | 40 | 不足 |
| <0.2 | 25 | 严重不足 |

*注：现金比率 = 货币资金 / 目标估值*

**5. 资产负债率评分** (`scoreDebtRatio`)

| 资产负债率 | 得分 | 等级 |
|------------|------|------|
| ≤30% | 100 | 优秀 |
| ≤50% | 80 | 良好 |
| ≤60% | 60 | 一般 |
| ≤70% | 40 | 较高 |
| >70% | 20 | 过高 |

#### 盈利能力内部权重

在盈利能力(25%)中，三个指标的权重分配：

| 指标 | 权重 | 说明 |
|------|------|------|
| ROE | 40% | 净资产收益率 |
| 毛利率 | 30% | 销售毛利率 |
| 净利润 | 30% | 净利润规模 |

#### 计算逻辑

**代码文件**: `server/src/utils/financialScore.ts:154-192`

```typescript
export function calculateFinancialHealthScore(data, estimatedValue = 50000) {
  // 1. 盈利能力 (25%)
  const profitability = calculateProfitabilityScore(data)
  // 内部: ROE×40% + 毛利率×30% + 净利润×30%

  // 2. 现金实力 (15%)
  const cashStrength = calculateCashStrengthScore(data, estimatedValueInYuan)

  // 3. 负债安全 (10%)
  const debtSafety = calculateDebtSafetyScore(data)

  // 综合评分（权重归一化）
  const totalWeight = 0.25 + 0.15 + 0.10  // 0.5 = 50%
  const score = (
    profitability.score * 0.25 +
    cashStrength.score * 0.15 +
    debtSafety.score * 0.10
  ) / totalWeight

  return { score, profitabilityScore, cashStrengthScore, debtSafetyScore }
}
```

---

### 4.3 战略协同性评分（50%）

**代码文件**: `server/src/utils/strategicScore.ts`

#### 评分维度与权重

| 子维度 | 权重 | 说明 |
|--------|------|------|
| 行业关联度 | 30% | 主营关键词匹配度 |
| 并购经验 | 10% | 历史并购公告分析 |
| 资金支付力 | 10% | 货币资金/估值 |

#### 各指标评分阈值

**1. 行业关联度评分** (`calculateIndustryMatchScore`)

基于关键词匹配比例 `matchRatio = 匹配关键词数 / 总关键词数`：

| matchRatio | 得分 | 等级 |
|------------|------|------|
| ≥0.6 | 100 | 高度相关 |
| ≥0.4 | 70 | 中度相关 |
| ≥0.2 | 50 | 低度相关 |
| >0 | 30 | 弱相关 |
| =0 | 20 | 无关 |

匹配关键词来源：`profile.keywords` + `profile.relatedIndustries` + `profile.mainBusiness`

**2. 并购经验评分** (`calculateMAExperienceScore`)

系统优先使用LLM分析结果，若LLM不可用则降级到关键词统计。

**LLM分析模式**（优先）:

| 并购次数 | 得分 | 等级 |
|----------|------|------|
| ≥3次 | 100 | 丰富（LLM分析） |
| ≥1次 | 70 | 一般（LLM分析） |
| 0次 | 30 | 无记录（LLM分析） |

**降级关键词计数模式**:

| 并购公告数 | 得分 | 等级 |
|------------|------|------|
| ≥5 | 100 | 丰富 |
| ≥3 | 80 | 较多 |
| ≥1 | 60 | 一般 |
| 0 | 30 | 无记录 |

**并购关键词列表** (`akshareData.ts:303`):
```typescript
['并购', '收购', '资产重组', '定增', '股权转让', '战略投资', '重大资产', '吸收合并', '发行股份购买']
```

**3. 资金支付力评分** (`calculatePaymentCapacityScore`)

基于 `paymentRatio = 货币资金 / 目标估值`：

| paymentRatio | 得分 | 等级 |
|---------------|------|------|
| ≥2.0 | 100 | 充裕 |
| ≥1.5 | 90 | 充足 |
| ≥1.0 | 70 | 良好 |
| ≥0.5 | 50 | 一般 |
| ≥0.2 | 30 | 不足 |
| <0.2 | 20 | 严重不足 |

#### 计算逻辑

**代码文件**: `server/src/utils/strategicScore.ts:234-271`

```typescript
export function calculateStrategicAlignmentScore(
  candidate, profile, financialData, newsList,
  estimatedValue = 50000, maAnalysis?: MAAnalysisResult
) {
  // 1. 行业关联度 (30%)
  const industryMatch = calculateIndustryMatchScore(candidate, profile)

  // 2. 并购经验 (10%)，优先用LLM分析结果
  const maExperience = calculateMAExperienceScore(newsList, maAnalysis)

  // 3. 资金支付力 (10%)
  const paymentCapacity = calculatePaymentCapacityScore(financialData, estimatedValue)

  // 综合评分（权重归一化）
  const totalWeight = 0.30 + 0.10 + 0.10  // 0.5 = 50%
  const score = (
    industryMatch.score * 0.30 +
    maExperience.score * 0.10 +
    paymentCapacity.score * 0.10
  ) / totalWeight

  return { score, industryMatchScore, maExperienceScore, paymentCapacityScore }
}
```

---

### 4.4 LLM集成：关键词提取

**代码文件**: `server/src/utils/companyProfile.ts`

系统调用LLM从企业描述中提取核心关键词，用于A股数据库检索。

#### 提示词设计

```
你是一个专业的并购分析师。请从以下企业描述中提取5-10个核心关键词，
用于在A股数据库中检索潜在收购方。

企业描述：{description}

请以JSON格式返回关键词列表：
{
  "keywords": ["关键词1", "关键词2", ...],
  "industry": "所属行业",
  "mainBusiness": "主营业务摘要"
}
```

#### 超时重试配置

- 超时时间: 60秒
- 最大重试次数: 3次
- 重试间隔: 2秒、4秒（指数退避）

---

### 4.5 并购经验LLM分析

**代码文件**: `server/src/utils/akshareData.ts`

系统通过以下步骤分析企业并购经验：

1. **获取公告列表** (`getAnnouncements`): 获取近3年所有公告
2. **关键词过滤** (`MA_KEYWORDS`): 筛选包含并购关键词的公告
3. **抓取正文** (`fetchAnnouncementContent`): 使用东方财富官方API获取公告详情
4. **LLM分析** (`analyzeMAExperienceWithLLM`): 判断是否具有真实并购意向和经验

#### LLM分析提示词

系统调用LLM分析公告内容，输出：
- `hasMA`: 是否存在并购行为
- `count`: 估计的并购次数
- `details`: 分析详情

---

### 4.6 排序与输出

**代码文件**: `server/src/routes/buyerScreeningAgent.ts:312-316`

```typescript
// 按综合评分降序排序
scoredCandidates.sort((a, b) => b.overallScore - a.overallScore)

// 分配排名
scoredCandidates.forEach((c, i) => {
  c.rank = i + 1
})

// 取前limit条
const finalResults = scoredCandidates.slice(0, limit)
```

---

### 4.7 完整调用链路

```
用户输入目标公司信息
         ↓
① getCompanyInfoWithFallback    ← 企查查API 或 用户输入降级
         ↓
② analyzeCompanyProfile (LLM, 60s+3次重试) ← 提取关键词
         ↓
③ searchStocks(keywords, 50)    ← 本地A股数据库搜索候选公司
         ↓
④ getFinancialData + getNewsData ← AKShare 财务+新闻数据
         ↓
⑤ getAnnouncements + fetchAnnouncementContent ← 公告数据
         ↓
⑥ analyzeMAExperienceWithLLM (LLM) ← 并购经验分析
         ↓
⑦ calculateFinancialHealthScore ← 财务健康度(50%)
         ↓
⑧ calculateStrategicAlignmentScore ← 战略协同性(50%)
         ↓
⑨ overallScore = financialScore * 0.5 + strategicScore * 0.5
         ↓
⑩ assignGrade → S/A/B/C/D
         ↓
排序输出 finalRecommendations
```
```

---

## 五、关键技术选型

### 5.1 前端框架选择

**选择: React 19 + Vite**

| 考量因素 | 选择理由 |
|---------|---------|
| 开发效率 | Vite极速热更新，提升开发体验 |
| 生态成熟 | React生态丰富，有大量可复用组件 |
| 类型安全 | 可选TypeScript支持 |
| 社区活跃 | 长期维护，问题易解决 |

### 5.2 状态管理

**选择: Zustand**

| 考量因素 | 选择理由 |
|---------|---------|
| 轻量级 | 体积小（约1KB），API简洁 |
| 灵活性 | 无Provider包裹要求，按需使用 |
| 持久化 | 内置persist中间件，支持localStorage |
| TypeScript | 完整类型推导 |

### 5.3 数据库选型

**选择: SQLite (better-sqlite3)**

| 考量因素 | 选择理由 |
|---------|---------|
| 零配置 | 无需独立数据库服务 |
| 性能优良 | 嵌入式，高并发读写 |
| 可移植 | 单文件数据库，便于备份分发 |
| 足够轻量 | 适合数据量在百万级以下的场景 |

### 5.4 LLM集成方案

**选择: OpenAI GPT / Anthropic Claude**

配置方式：`server/src/config/llm.ts`

```typescript
export const llmConfig = {
  provider: process.env.LLM_PROVIDER || 'openai',
  apiKey: process.env.LLM_API_KEY,
  baseUrl: process.env.LLM_BASE_URL,
  model: process.env.LLM_MODEL || 'gpt-4o-mini',
  timeout: 60000,  // 60秒超时
  maxRetries: 3    // 最多重试3次
};
```

### 5.5 外部数据源集成

| 数据源 | 集成方式 | 主要用途 |
|-------|---------|---------|
| AKShare | Python子进程 | 财务数据、公告数据 |
| 企查查QCC | MCP协议 (SSE) | 企业工商信息、风险数据 |
| CNCA官网 | Puppeteer MCP | 认证资质验证 |
| 东方财富 | MX-Skills技能包 | 金融资讯、股票诊断 |

---

## 六、实现难点与解决方案

### 6.1 LLM超时与重试机制

**问题描述**: LLM API调用可能因网络问题或服务繁忙导致超时，影响筛选结果。

**解决方案**:
- 超时时间设置为60秒
- 指数退避重试策略（2秒、4秒间隔）
- 最多重试3次
- 降级使用mock数据兜底

```typescript
async function callWithRetry(prompt, options = {}) {
  const { timeout = 60000, maxRetries = 3 } = options;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await Promise.race([
        callLLM(prompt),
        timeoutPromise(timeout)
      ]);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await sleep(attempt === 0 ? 2000 : 4000);
    }
  }
}
```

### 6.2 公告数据爬取

**问题1: 列名编码问题**
- **现象**: `stock_individual_notice_report` 返回的列名出现乱码
- **原因**: AKShare返回的DataFrame列名编码异常
- **解决**: 改用位置索引访问数据（idx=2,3,4,5对应日期、标题、编号、类别）

**问题2: 公告正文为空**
- **现象**: 从东方财富页面直接爬取公告正文返回空
- **原因**: 页面内容为JS动态渲染
- **解决**: 改用官方API `np-cnotice-stock.eastmoney.com/api/content/ann`

### 6.3 企查查API降级策略

**问题描述**: 企查查API可能因密钥过期、网络问题或调用限制失败。

**解决方案**:
- 后端维护配置状态检测
- API失败时回退到用户输入的降级数据
- 保留完整的错误日志便于排查

```typescript
async function getCompanyInfoWithFallback(userInput) {
  try {
    const qccData = await qccApi.getCompanyInfo(userInput.companyName);
    if (qccData) return qccData;
  } catch (error) {
    console.warn('QCC API failed, using fallback:', error.message);
  }

  // 降级到用户输入
  return {
    companyName: userInput.companyName,
    industry: userInput.industry,
    region: userInput.region,
    estimatedValue: userInput.estimatedValue,
    _fallback: true
  };
}
```

### 6.4 前端状态管理

**问题描述**: 复杂的跨组件状态共享（如项目全局状态、筛选条件、搜索结果）。

**解决方案**:
- 使用Zustand进行全局状态管理
- 按业务域拆分store（projectStore、searchStore等）
- 使用persist中间件持久化关键状态

```typescript
// projectStore.js
export const useProjectStore = create(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      loading: false,

      setProjects: (projects) => set({ projects }),
      setCurrentProject: (project) => set({ currentProject: project }),
      fetchProjects: async () => {
        set({ loading: true });
        const data = await api.getProjects();
        set({ projects: data, loading: false });
      },
      // ...
    }),
    {
      name: 'ma-ai-projects',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
```

### 6.5 数据库初始化

**问题描述**: TIC企业原始数据（Excel格式）需要导入到SQLite。

**解决方案**:
- 开发独立初始化脚本 `initTicCompaniesDb.ts`
- 支持 `--force` 参数强制重新导入
- 批量插入优化（每1000条一提交）
- 启动时自动检测并导入

---

## 七、数据库设计

### 7.1 数据库总览

| 数据库文件 | 用途 | 数据量 |
|-----------|------|-------|
| projects.db | 项目管理、项目阶段、筛选缓存 | 数十条 |
| a_stocks.db | A股上市公司基础数据 | 数千条 |
| tic_companies.db | TIC企业数据（与projects.db共用） | 55,574条 |
| cnca_cache.db | CNCA认证缓存 | 动态 |
| target_companies.db | 目标公司缓存 | 动态 |

### 7.2 核心表结构

#### projects表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 主键UUID |
| name | TEXT | 项目名称 |
| status | TEXT | 状态(draft/active/completed) |
| industry | TEXT | 所属行业 |
| region | TEXT | 地区 |
| estimated_value | TEXT | 预估估值 |
| company_name | TEXT | 标的企业名称 |
| company_type | TEXT | 企业类型 |
| registration_capital | TEXT | 注册资本 |
| establishment_date | TEXT | 成立日期 |
| employee_count | TEXT | 人员规模 |
| sell_motivation | TEXT | 出售动机(JSON数组) |
| risk_level | TEXT | 风险等级 |
| change_records | TEXT | 变更记录(JSON) |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |
| created_by | TEXT | 创建人 |
| is_deleted | INTEGER | 软删除标记 |

#### project_phases表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 主键UUID |
| project_id | TEXT | 外键关联projects |
| phase | TEXT | 阶段(protocol/due_diligence/valuation/matching/report) |
| status | TEXT | 状态(pending/in_progress/completed) |
| started_at | TEXT | 开始时间 |
| completed_at | TEXT | 完成时间 |
| output_data | TEXT | 输出数据(JSON) |

#### tic_companies表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 自增主键 |
| company_name | TEXT | 企业名称(唯一) |
| business_status | TEXT | 经营状态 |
| legal_representative | TEXT | 法定代表人 |
| registered_capital | TEXT | 注册资本 |
| province | TEXT | 省份 |
| city | TEXT | 城市 |
| county | TEXT | 区县 |
| credit_code | TEXT | 统一社会信用代码 |
| employee_count | INTEGER | 参保人数 |
| industry_category | TEXT | 国标行业门类 |
| industry_major | TEXT | 国标行业大类 |
| industry_middle | TEXT | 国标行业中类 |
| industry_minor | TEXT | 国标行业小类 |
| phone | TEXT | 联系电话 |
| email | TEXT | 邮箱 |
| website | TEXT | 网址 |
| is_listed | TEXT | 是否上市 |
| business_scope | TEXT | 经营范围 |
| dishonest_status | TEXT | 失信被执行人状态 |
| 被执行_status | TEXT | 被执行人状态 |
| high_consumer_status | TEXT | 限制高消费状态 |
| judicial_freeze_status | TEXT | 司法冻结状态 |
| business_exception_status | TEXT | 经营异常状态 |
| imported_at | TEXT | 导入时间 |

#### buyer_screening_cache表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 主键UUID |
| target_name | TEXT | 标的名称 |
| target_industry | TEXT | 标的行业 |
| results | TEXT | 筛选结果(JSON) |
| candidate_count | INTEGER | 候选数量 |
| created_at | TEXT | 创建时间 |
| expires_at | TEXT | 过期时间 |

#### custom_items表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 主键UUID |
| project_id | TEXT | 外键关联projects |
| section | TEXT | 清单分区（如 legal、财务、业务） |
| item_name | TEXT | 清单项名称 |
| description | TEXT | 清单项描述 |
| status | TEXT | 状态(pending/completed) |
| file_path | TEXT | 上传文件路径 |
| file_name | TEXT | 上传文件原名 |
| file_size | INTEGER | 上传文件大小 |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |

### 7.3 索引设计

```sql
-- projects表索引
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_industry ON projects(industry);
CREATE INDEX idx_projects_company_name ON projects(company_name);

-- tic_companies表索引
CREATE INDEX idx_tic_company_name ON tic_companies(company_name);
CREATE INDEX idx_tic_company_industry ON tic_companies(industry_category);
CREATE INDEX idx_tic_company_province ON tic_companies(province);
CREATE INDEX idx_tic_company_city ON tic_companies(city);
CREATE INDEX idx_tic_company_business_scope ON tic_companies(business_scope);

-- articles表索引 (新闻)
CREATE INDEX idx_articles_published ON articles(published_at);
CREATE INDEX idx_articles_is_tic ON articles(is_tic);
CREATE INDEX idx_articles_is_ma ON articles(is_ma);
CREATE INDEX idx_articles_hot ON articles(hot);
CREATE INDEX idx_articles_category ON articles(category);

-- custom_items表索引
CREATE INDEX idx_custom_items_project ON custom_items(project_id);
CREATE INDEX idx_custom_items_section ON custom_items(section);
```

---

## 八、API接口设计

### 8.1 接口规范

所有API遵循统一响应格式：

**成功响应**:
```json
{
  "success": true,
  "data": { ... }
}
```

**失败响应**:
```json
{
  "success": false,
  "error": "错误描述"
}
```

### 8.2 核心接口列表

| 分类 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 健康检查 | GET | `/api/health` | 服务健康状态 |
| 买家筛选 | POST | `/api/buyer/screening-agent` | AI智能筛选主接口 |
| 买家画像 | GET | `/api/buyer/profile` | 获取买家画像 |
| 新闻健康 | GET | `/api/news/health` | 新闻数据库状态 |
| 实时快讯 | GET | `/api/news/live` | 实时新闻快讯 |
| 热门文章 | GET | `/api/news/hot` | 热门新闻 |
| 文章列表 | GET | `/api/news/all` | 所有/筛选文章 |
| 市场数据 | GET | `/api/news/stats` | 市场统计 |
| 新闻源管理 | GET/POST/PUT/DELETE | `/api/news/feeds` | RSS新闻源管理 |
| 触发采集 | POST | `/api/news/collect` | 手动触发新闻采集 |
| 触发分析 | POST | `/api/news/analyze` | 手动触发AI分析 |
| 项目列表 | GET | `/api/projects` | 获取项目列表 |
| 项目详情 | GET | `/api/projects/:id` | 获取项目详情 |
| 创建项目 | POST | `/api/projects` | 创建新项目 |
| 更新项目 | PUT | `/api/projects/:id` | 更新项目 |
| 删除项目 | DELETE | `/api/projects/:id` | 删除项目 |
| 项目阶段 | GET/PUT | `/api/projects/:id/phases` | 阶段管理 |
| TIC查询 | GET | `/api/tic-companies` | TIC企业查询 |
| CNCA验证 | POST | `/api/cnca-certification/verify-batch` | 批量验证认证 |
| CNCA状态 | GET | `/api/cnca-certification/status/:name` | 查询认证状态 |
| 企业情报 | POST | `/api/qcc/company-intelligence` | 企查查企业情报 |
| Excel导入 | POST | `/api/imports/excel` | 批量导入项目 |
| 自定义清单 | GET/POST | `/api/dd-custom-items/:id/custom-items` | 获取/创建清单项 |
| 更新清单 | PUT/DELETE | `/api/dd-custom-items/:id/custom-items/:itemId` | 更新/删除清单项 |
| 上传文件 | POST | `/api/dd-custom-items/:id/custom-items/:itemId/upload` | 上传附件 |

### 8.3 买家筛选接口详解

**POST /api/buyer/screening-agent**

Request:
```json
{
  "targetCompany": {
    "name": "上海国缆检测股份有限公司",
    "mainBusiness": "电线电缆检测",
    "coreCerts": ["CMA", "CNAS"],
    "region": "上海",
    "estimatedValue": 50000,
    "annualProfit": 6000,
    "employeeScale": "100-500人",
    "acquisitionMotivation": "行业整合",
    "industry": "检测认证"
  },
  "limit": 10
}
```

Response:
```json
{
  "success": true,
  "data": {
    "screeningReport": {
      "targetCompany": { ... },
      "finalRecommendations": [
        {
          "stockCode": "000001",
          "companyName": "中国平安",
          "tier": "S",
          "totalScore": 88.5,
          "financialScore": 45.2,
          "strategicScore": 43.3,
          "mainBusinessMatch": "高度匹配",
          "hasMAExperience": true,
          "hasCertification": false,
          "financialData": {
            "roe": 12.5,
            "grossMargin": 45.2,
            "netProfitMargin": 18.3,
            "debtRatio": 35.2,
            "monetaryFunds": 800000
          },
          "matchDetails": { ... }
        }
      ],
      "statistics": {
        "totalCandidates": 50,
        "tierCounts": { "S": 3, "A": 8, "B": 15, "C": 20, "D": 4 }
      }
    }
  }
}
```

---

## 九、环境部署

### 9.1 环境变量配置

**前端 (.env)**
```bash
VITE_API_BASE_URL=http://localhost:3001
```

**后端 (.env)**
```bash
# LLM配置
LLM_PROVIDER=openai
LLM_API_KEY=sk-xxxxx
LLM_MODEL=gpt-4o-mini
LLM_BASE_URL=

# 企查查配置
QCC_API_KEY=xxxxx
QCC_API_BASE_URL=https://agent.qcc.com/mcp

# 东方财富配置
EM_API_KEY=xxxxx
```

### 9.2 依赖安装

```bash
# 前端依赖
npm install

# 后端依赖
cd server && npm install
```

### 9.3 启动方式

```bash
# 开发模式（前端+Vite代理）
npm run dev

# 后端独立启动
cd server && npm run dev

# 生产构建
npm run build
```

### 9.4 数据初始化

```bash
# 初始化TIC企业数据
cd server && npx tsx src/scripts/initTicCompaniesDb.ts

# 强制重新导入
cd server && npx tsx src/scripts/initTicCompaniesDb.ts --force
```

---

## 十、总结与展望

### 10.1 项目成果

MA-AI项目目前已完成以下核心功能：

1. **AI觅售筛选系统**：从55,574家TIC企业中快速检索符合条件的目标
2. **智能买家匹配**：基于财务健康度+战略协同性的双维度评分体系
3. **CNCA认证核验**：自动化验证企业CNCA认证资质
4. **项目管理平台**：覆盖并购项目全生命周期
5. **企业情报整合**：多源数据融合，辅助投资决策
6. **新闻资讯采集**：RSS多源采集 + AI情感分析 + TIC/M&A自动分类
7. **自定义尽调清单**：项目级自定义清单管理 + 文件上传

### 10.2 技术亮点

- **多源数据融合**：整合QCC、AKShare、CNCA、LLM等多方数据
- **AI评分体系**：量化的评估标准，减少主观判断
- **降级策略完善**：多级降级保障，确保服务可用性
- **缓存机制优化**：多级缓存减少外部依赖，提升响应速度

### 10.3 改进方向

| 方向 | 说明 |
|------|------|
| 扩大数据源 | 接入更多财务数据源，丰富评分维度 |
| 优化算法 | 引入机器学习模型，提升匹配精度 |
| 实时监控 | 增加数据更新监控，及时发现风险变化 |
| 移动端适配 | 优化移动端用户体验 |
| 多人协作 | 支持多用户协作、权限管理 |

---

**文档版本**: v1.0
**编写日期**: 2026-05-16
**作者**: MA-AI Development Team