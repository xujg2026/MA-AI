# 开发总结

**最后更新:** 2026-05-17

---

## 一、核心功能完成状态

| 模块 | 状态 | 说明 |
|------|------|------|
| 企查查集成 | ✅ 完成 | API对接、数据存储、降级策略 |
| 公司画像(LLM) | ✅ 完成 | 60s超时+3次重试 |
| A股候选搜索 | ✅ 完成 | SQLite FTS5 全文搜索 |
| AKShare财务数据 | ✅ 完成 | 同花顺财务指标接口 |
| 公告数据获取 | ✅ 完成 | 位置索引修复 + Eastmoney API |
| LLM并购经验分析 | ✅ 完成 | 60s超时+3次重试 |
| 评分算法 | ✅ 完成 | 财务50% + 战略50% |
| 前端梯队展示 | ✅ 完成 | 四梯队S/A/B/C |

---

## 二、完整调用链路

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

**关键修复记录:**
- `stock_individual_notice_report` 列名编码问题 → 改用位置索引访问 (idx=2/3/4/5)
- Eastmoney 公告页面JS渲染 → 改用官方 API `np-cnotice-stock.eastmoney.com/api/content/ann`
- LLM 超时30s → 60s + 3次重试 (2s/4s 间隔)

---

## 三、已解决的技术问题

| 日期 | 问题 | 解决方案 |
|------|------|---------|
| 2026-04-21 | 公告列名编码损坏 | 按位置索引访问 (idx=2,3,4,5) |
| 2026-04-21 | Eastmoney公告正文为空 | 集成官方API `np-cnotice-stock.eastmoney.com` |
| 2026-04-21 | LLM 30s超时导致关键词退化 | 超时60s + 最多3次重试 |
| 2026-04-21 | 候选公司数量归零 | 修复LLM超时后恢复 |

---

## 四、评分体系

### 4.1 财务健康度 (50%)

| 子维度 | 权重 | 数据来源 |
|--------|------|---------|
| 盈利能力(ROE/毛利率/净利) | 25% | AKShare `stock_financial_benefit_ths` |
| 现金实力 | 15% | AKShare `stock_financial_benefit_ths` |
| 负债安全 | 10% | AKShare `stock_financial_benefit_ths` |

### 4.2 战略协同性 (50%)

| 子维度 | 权重 | 数据来源 |
|--------|------|---------|
| 行业关联度 | 30% | 本地A股数据库关键词匹配 |
| 并购经验 | 10% | AKShare公告 + LLM 公告解读 |
| 资金支付力 | 10% | AKShare `stock_financial_benefit_ths` |

---

## 五、文件变更清单

### 新增文件
| 文件 | 说明 |
|------|------|
| `server/src/config/llm.ts` | LLM配置 (OpenAI/Anthropic) |
| `server/src/config/qcc.ts` | 企查查MCP配置 |
| `server/src/utils/stockDb.ts` | A股数据库工具 |
| `server/src/utils/companyProfile.ts` | 公司画像分析 (LLM+重试) |
| `server/src/utils/akshareData.ts` | AKShare数据获取 (含Eastmoney API) |
| `server/src/utils/qccDataStore.ts` | 企查查数据存储 |
| `server/src/utils/screeningHelper.ts` | 筛选辅助工具 |
| `server/src/utils/screeningLogger.ts` | 日志记录 |
| `server/src/utils/financialScore.ts` | 财务健康度评分 |
| `server/src/utils/strategicScore.ts` | 战略协同性评分 |
| `server/data/a_stocks.db` | A股SQLite数据库 |
| `server/data/target_companies.db` | 目标公司缓存 |

### 修改文件
| 文件 | 修改内容 |
|------|---------|
| `server/src/routes/buyerScreeningAgent.ts` | 核心路由，步骤4.5并购分析链路 |
| `server/src/utils/akshareData.ts` | 位置索引修复 + Eastmoney API + LLM重试 |
| `server/src/utils/companyProfile.ts` | 60s超时 + 3次重试 |
| `server/src/utils/strategicScore.ts` | MAAnalysisResult接口，LLM分析集成 |
| `src/pages/BuyerMatchInputPage.jsx` | 梯队展示修复 |

---

## 六、环境变量

```bash
# LLM配置
LLM_PROVIDER=openai
LLM_API_KEY=sk-xxxxx
LLM_MODEL=gpt-4o-mini
LLM_BASE_URL=

# 企查查配置
QCC_API_KEY=xxxxx
QCC_API_BASE_URL=https://agent.qcc.com/mcp
```

---

## 七、待办/改进方向

| 优先级 | 事项 | 说明 |
|--------|------|------|
| 低 | cninfo备选 | 如需更多公告来源可扩展 |
| 低 | Python环境优化 | 确保Anaconda在PATH首位 |

---

## 八、项目管理模块 (2026-04-25)

### 问题描述
项目管理界面和项目详情页中，公司名没有和项目中的企业名称进行挂钩。前端调用的后端字段可能不准确。

### 根本原因
1. **字段名不一致**: 后端数据库和 API 使用 `company_name` 字段，但前端显示层使用 `company`（不存在）
2. **更新方法错误**: `projectStore.js` 中更新项目使用 `POST` 而非 `PUT`
3. **字段映射错误**: 详情页使用 `valuation`、`createdAt`、`updatedAt`、`motivation` 等错误字段名
4. **时间显示问题**: 时间戳未转换为东八区 (Asia/Shanghai) 时区

### 修复内容

| 文件 | 修改内容 |
|------|---------|
| `src/pages/ProjectListPage.jsx` | `project.company` → `company_name` |
| `src/pages/ProjectDetailPage.jsx` | `currentProject.company` → `company_name` |
| `src/pages/ProjectDetailPage.jsx` | `currentProject.valuation` → `estimated_value` |
| `src/pages/ProjectDetailPage.jsx` | `currentProject.createdAt` → `created_at` |
| `src/pages/ProjectDetailPage.jsx` | `currentProject.updatedAt` → `updated_at` |
| `src/pages/ProjectDetailPage.jsx` | `currentProject.motivation` → `sell_motivation` (数组格式) |
| `src/pages/BuyerMatchingPage.jsx` | `project.company` → `company_name` |
| `src/components/projects/ProjectSelector.jsx` | `deal?.company` → `deal?.company_name` |
| `src/stores/projectStore.js` | `api.post()` → `api.updateProject()` (PUT) |
| `src/pages/ProjectDetailPage.jsx` | 新增字段: `company_type`, `establishment_date`, `registration_capital`, `employee_count` |
| `src/pages/ProjectDetailPage.jsx` | 新增财务信息 Card (收入、净利润、资产) |
| `src/pages/ProjectDetailPage.jsx` | 时间显示转换为东八区 `Asia/Shanghai` 时区 |

---

## 十、CNCA 认证状态查询 (2026-05-16)

### 功能概述
在 AI 觅售（TIC 企业查询）页面中，为每家企业增加 CNCA 认证资质查询功能。

### 新增文件
| 文件 | 说明 |
|------|------|
| `server/src/routes/cncaCertification.ts` | CNCA 认证 API 路由 (Puppeteer MCP 爬取) |
| `server/src/utils/cncaCache.ts` | 认证状态缓存工具 (24h TTL) |
| `server/data/cnca_cache.db` | CNCA 认证缓存数据库 |

### API 接口
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/cnca-certification/verify-batch` | 批量验证企业 CNCA 认证状态 |
| GET | `/api/cnca-certification/status/:companyName` | 查询单家企业缓存状态 |

### 前端功能
- 企业卡片显示认证状态 Badge（有认证/无认证/未验证）
- 右下角浮动"刷新认证状态"按钮
- 有认证企业名称可点击跳转 CNCA 详情页
- 认证结果缓存 24 小时

### 依赖
- `@modelcontextprotocol/server-puppeteer` — Puppeteer MCP server
- `POST /verify-batch` 调用 `npx -y @modelcontextprotocol/server-puppeteer` 进行页面爬取

---

## 十一、TIC 企业数据库集成 (2026-05-16)

### 功能概述
将 `Source/TIC company info.xlsx` 数据导入本地 SQLite，实现 TIC 企业查询功能。

### 新增文件
| 文件 | 说明 |
|------|------|
| `server/src/utils/ticCompanyDb.ts` | TIC 企业数据库工具 |
| `server/src/scripts/initTicCompaniesDb.ts` | 数据初始化脚本 |
| `server/src/routes/ticCompanies.ts` | TIC 企业查询 API |

### 数据库表结构
`tic_companies` 表 — 55,574 条企业数据，包含：
- 基本信息：企业名称、经营状态、法定代表人、注册资本、成立日期
- 地区信息：省、市、区县、注册地址
- 联系方式：电话、邮箱、网址
- 行业分类：国标行业门类/大类/中类/小类
- 风险字段：失信被执行人、被执行人、限制高消费、司法冻结、经营异常等

### API 接口
`GET /api/tic-companies` — 支持多条件筛选：
- keyword, industry, province, city, county, companyType
- employeeCountMin/Max, hasPhone, hasWebsite, businessScope
- page, pageSize 分页

### 前端变更
AIFinderPage 重构为 TIC 企业查询：
- 保留：行业、关键字、企业性质、社保人数、注册资本、成立日期
- 新增：联系电话、网址、经营范围、地区三级联动
- 删除：CMA/CNAS资质、融资、风险标签等不支持的字段
- 卡片显示真实数据库字段

---

## 十二、项目管理模块修复 (2026-04-26)

### 新增文件

| 文件 | 说明 |
|------|------|
| `server/src/routes/projects.ts` | 项目管理 REST API (CRUD + 阶段管理) |
| `server/src/routes/imports.ts` | Excel 导入 API |
| `server/src/utils/projectDb.ts` | SQLite 项目数据库工具 |
| `server/data/projects.db` | 项目 SQLite 数据库 |
| `src/pages/ProjectListPage.jsx` | 项目列表页 |
| `src/pages/ProjectDetailPage.jsx` | 项目详情页 |
| `src/components/projects/ProjectForm.jsx` | 项目创建/编辑表单 |
| `src/components/projects/ProjectSelector.jsx` | 项目选择/创建弹窗 |
| `src/stores/projectStore.js` | Zustand 项目状态管理 |

### 修改文件

| 文件 | 改动 |
|------|------|
| `server/src/index.ts` | 挂载 `/api/projects` 和 `/api/imports` 路由 |
| `src/App.jsx` | 添加 `/projects` 和 `/projects/:id` 路由 |
| `src/components/layout/Navbar.jsx` | 添加"项目管理"导航入口 |
| `src/services/api.js` | 添加 projects API 方法 |
| `src/data/excelData.js` | 对接后端 API |
| `src/pages/AIFinderPage.jsx` | 觅售结果添加"归集到项目"功能 |
| `src/pages/BuyerMatchingPage.jsx` | 支持项目上下文和项目选择 |

### 核心功能

1. **项目管理 CRUD** - 创建、读取、更新、删除项目
2. **项目列表** - 状态筛选、关键词搜索、分页
3. **项目详情** - 基本信息、财务数据、觅售报告、交易流程
4. **觅售归集** - 将 AI 觅售结果归集到项目
5. **交易流程** - 协议签署、尽职调查、估值、匹配、推荐书各阶段归集
6. **Excel 导入** - 批量导入项目数据

### 数据库表结构

**projects 表:**
- id, name, status, industry, region, estimated_value, source
- company_name, company_type, registration_capital, establishment_date, employee_count
- sell_motivation, risk_level, change_records
- created_at, updated_at, created_by, is_deleted

**project_phases 表:**
- id, project_id, phase, status, started_at, completed_at, output_data

### 详情页新增展示字段

**项目信息 Card:**
- 公司类型 (company_type)
- 成立日期 (establishment_date)
- 注册资本 (registration_capital)
- 人员规模 (employee_count)

**详细信息 Card:**
- 出售动机 (sell_motivation) - 数组格式，映射为中文标签

**财务信息 Card (新增):**
- 营业收入（近三年）
- 净利润（近三年）
- 净资产及截止日期
- 总资产及截止日期

### 数据库字段对应关系

| 后端/DB 字段 | 前端使用 | 说明 |
|-------------|---------|------|
| `company_name` | `company_name` | 企业名称 |
| `company_type` | `company_type` | 公司类型 |
| `establishment_date` | `establishment_date` | 成立日期 |
| `registration_capital` | `registration_capital` | 注册资本 |
| `employee_count` | `employee_count` | 人员规模 |
| `estimated_value` | `estimated_value` | 预估估值 |
| `created_at` | `created_at` | 创建时间 |
| `updated_at` | `updated_at` | 更新时间 |
| `change_records` | `change_records` | JSON 包含财务数据、动机等 |
| `sell_motivation` | `sell_motivation` | 出售动机 (JSON数组) |

---

## 十三、新闻资讯模块 (2026-05-17)

### 功能概述
新闻资讯模块实现 TIC 行业相关新闻的采集、存储、AI 分析和展示。

### 新增文件
| 文件 | 说明 |
|------|------|
| `server/src/routes/news.ts` | 新闻 API 路由 |
| `server/src/utils/newsDb.ts` | SQLite 新闻数据库工具 |
| `server/src/collectors/rssCollector.ts` | RSS 采集器 |
| `server/src/collectors/newsAnalyzer.ts` | AI 新闻分析器（情感分析 + TIC/M&A 分类） |
| `server/src/collectors/scheduler.ts` | 采集调度器 |
| `server/src/collectors/initFeeds.ts` | 初始化默认新闻源 |
| `src/services/newsService.js` | 前端新闻服务（真实 API + mock fallback） |
| `server/data/news.db` | 新闻 SQLite 数据库 |

### 数据库表结构
**feeds 表**：新闻源配置（名称、URL、轮询间隔、启用状态等）
**articles 表**：文章内容（标题、正文、发布时间、分类、热度、情感分析等）

### 前端服务
`src/services/newsService.js` 提供：
- `getLiveNews()` — 实时快讯
- `getHotNews()` — 热门文章
- `getAllNews(filters)` — 所有/筛选文章
- `getMarketStats()` — 市场数据
- `searchNews(keyword)` — 搜索新闻
- `triggerCollection()` — 手动触发采集
- `triggerAnalysis(count)` — 手动触发 AI 分析

环境变量 `VITE_USE_REAL_NEWS=true` 启用真实后端。

### API 接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/news/health` | 健康检查 |
| GET | `/api/news/live` | 实时快讯 |
| GET | `/api/news/hot` | 热门文章 |
| GET | `/api/news/all` | 所有/筛选文章 |
| GET | `/api/news/stats` | 市场数据 |
| GET/POST/PUT/DELETE | `/api/news/feeds` | 新闻源管理 |
| POST | `/api/news/collect` | 手动触发采集 |
| POST | `/api/news/analyze` | 手动触发 AI 分析 |

### AI 分析功能
- **情感分析**：自动判断新闻情感（正面/负面/中性）
- **TIC 分类**：自动识别是否为 TIC 行业相关文章
- **M&A 分类**：自动识别是否为并购相关文章
- **热度计算**：基于时间和浏览量的热度算法

---

## 十四、自定义尽调清单 (2026-05-17)

### 功能概述
在项目管理中，支持项目级自定义尽调清单，支持文件上传和状态管理。

### 新增文件
| 文件 | 说明 |
|------|------|
| `server/src/routes/ddCustomItems.ts` | 自定义清单 API 路由 |
| `server/data/dd_custom_items.db` | 自定义清单 SQLite 数据库 |
| `server/data/uploads/` | 上传文件存储目录 |

### API 接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/dd-custom-items/:id/custom-items` | 获取项目的自定义清单项 |
| POST | `/api/dd-custom-items/:id/custom-items` | 创建自定义清单项 |
| PUT | `/api/dd-custom-items/:id/custom-items/:itemId` | 更新清单项 |
| DELETE | `/api/dd-custom-items/:id/custom-items/:itemId` | 删除清单项 |
| POST | `/api/dd-custom-items/:id/custom-items/:itemId/upload` | 上传文件 |
| GET | `/api/dd-custom-items/:id/custom-items/:itemId/file` | 下载文件 |

### 数据库字段
| 字段 | 说明 |
|------|------|
| id | 主键 UUID |
| project_id | 外键关联 projects |
| section | 清单分区（legal、财务、业务等） |
| item_name | 清单项名称 |
| description | 清单项描述 |
| status | 状态（pending/completed） |
| file_path | 上传文件路径 |
| file_name | 上传文件原名 |
| file_size | 上传文件大小 |
