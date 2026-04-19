# 项目概览

## 1. 仓库定位

当前仓库的主线目标，是搭建一个围绕并购业务的智能工作台，覆盖以下几类能力：

- 标的/项目浏览与筛选
- 买家画像与买家初筛
- 基于 AI/外部数据的潜在买家推荐
- 尽调风险分析与推荐书生成
- Excel 项目数据导入与本地管理

代码上，主线是 `src/` 和 `server/`。`tic-intelligence/` 是另一个独立子项目，当前不参与主应用联调。

## 2. 总体架构

```text
Browser
  -> Vite Frontend (src/)
  -> src/services/api.js
  -> /api 代理
  -> Express Server (server/src/)
  -> 外部能力
     - QCC 企业情报接口
     - mx-skills Python 脚本

本地/演示数据
  - src/data/mockData.js
  - src/services/newsService.js
  - src/data/excelData.js (Zustand 持久化)
```

## 3. 主线目录说明

```text
.
├── src/                     前端主应用
│   ├── pages/               路由级页面
│   ├── components/          页面组件与通用 UI
│   ├── services/            前端 API 封装与本地服务
│   └── data/                mock 数据与 Zustand store
├── server/                  后端 API 服务
│   └── src/
│       ├── routes/          各业务路由
│       ├── services/        外部服务适配（如 QCC）
│       └── utils/           通用调用工具（如 mx-skills）
├── docs/                    协作说明
└── tic-intelligence/        独立历史/实验子项目
```

## 4. 前端页面地图

| 路由 | 页面文件 | 数据来源 | 当前状态 |
| --- | --- | --- | --- |
| `/` | `src/pages/HomePage.jsx` | 静态 + mock | 首页展示页 |
| `/ai-finder` | `src/pages/AIFinderPage.jsx` | mock | AI 觅售筛选页，未接后端 |
| `/buyer-matching` | `src/pages/BuyerMatchingPage.jsx` | 混合 | AI 交易流程容器页 |
| `/buyer-match-input` | `src/pages/BuyerMatchInputPage.jsx` | `/api/buyer/screening-agent` | 已接真实后端 |
| `/deals` | `src/pages/DealsPage.jsx` | `mockData + excelData` | 案例库，可叠加导入数据 |
| `/dashboard` | `src/pages/DashboardPage.jsx` | mock | 个人工作台 |
| `/data-management` | `src/pages/DataManagementPage.jsx` | `xlsx + zustand` | 本地导入/录入管理 |
| `/news` | `src/pages/NewsPage.jsx` | `newsService` mock | 资讯页，当前为本地模拟 |
| `/ai-due-diligence` | `src/pages/AIDueDiligencePage.jsx` | `QCC + mock checklist` | 尽调分析/推荐书入口 |
| `/about` | `src/pages/AboutPage.jsx` | 静态 | 关于页 |

## 5. 后端模块地图

| 路由/能力 | 文件 | 上游依赖 | 说明 |
| --- | --- | --- | --- |
| `/api/health` | `server/src/index.ts` | 无 | 健康检查 |
| `/api/buyer/profile` | `server/src/routes/buyerProfile.ts` | `mx-finance-data`, `mx-finance-search` | 买家画像，失败时回退 mock |
| `/api/buyer/screen` | `server/src/routes/buyerScreen.ts` | 本地预设池 | 规则初筛 |
| `/api/buyer/screening-agent` | `server/src/routes/buyerScreeningAgent.ts` | `mx-finance-data`, `mx-finance-search`, `stock-diagnosis` | 智能筛选主接口 |
| `/api/financial/*` | `server/src/routes/financialData.ts` | `mx-finance-data` | 财务查询 |
| `/api/search/*` | `server/src/routes/financialSearch.ts` | `mx-finance-search` | 财经/并购资讯搜索 |
| `/api/diagnosis/*` | `server/src/routes/stockDiagnosis.ts` | `stock-diagnosis` | 股票诊断 |
| `/api/qcc/*` | `server/src/routes/qcc.ts` | `server/src/services/qccApi.ts` | 企查查企业情报 |

## 6. 当前真实状态

当前仓库不是一个完全产品化的项目，而是“可演示原型 + 部分真实能力接入”的混合状态。协作时建议先区分下面三类模块：

- 已接真实后端：
  - 买家智能筛选
  - QCC 企业情报
  - 尽调分析中的企业风险解析
  - 推荐书生成的数据拉取部分
- 本地能力但不走后端：
  - Excel 导入
  - 导入数据持久化
  - 案例库筛选
- 纯 mock/演示态：
  - 首页、看板、资讯页大部分内容
  - AI 觅售页
  - 部分交易流程页面的展示数据

## 7. 目前已知的不一致点

- `src/pages/AIValuationPage.jsx` 和 `src/pages/IntegrationPredictionPage.jsx` 存在，但没有在 `src/App.jsx` 里注册路由。
- `DashboardPage`、`Footer`、`AICapabilities` 中存在指向 `/ai-valuation` 的入口，但当前路由未挂载。
- 根目录 `README.md` 在本次整理前是默认 Vite 模板，与真实项目不一致。
- `server/src/utils/mxSkillRunner.ts` 依赖根目录 `mx-skills/`，仓库本身未包含这部分代码时，相关接口只能失败或降级。

## 8. 主线开发建议

后续协作优先围绕下面这条链路展开：

1. 页面路由与交互放在 `src/pages/`。
2. 可复用 UI 放在 `src/components/`。
3. 前端 API 统一收口到 `src/services/api.js`。
4. 后端业务入口放在 `server/src/routes/`。
5. 第三方服务适配放在 `server/src/services/`。

这样能避免页面里直接散落 `fetch`，也方便后面补类型、补鉴权和做接口迁移。
