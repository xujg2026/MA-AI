# 数据管理模块升级设计方案

**日期:** 2026-04-25
**状态:** ✅ 已确认
**版本:** v2.1

**核心决策:**
- 问题1: ✅ 一对一（一个项目对应一个公司）
- 问题2: ✅ 保留完整觅售报告
- 问题3: ✅ 自动归集交易阶段产出物

---

## 一、模块定位升级

### 1.1 从"数据导入工具"升级为"M&A项目信息管理中枢"

```
                         ┌──────────────────────────────────────┐
                         │           M&A 项目信息管理中枢         │
                         │              (数据管理模块)             │
                         └──────────────────────────────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        │                                   │                                   │
        ▼                                   ▼                                   ▼
┌───────────────────┐            ┌───────────────────┐            ┌───────────────────┐
│     AI 觅售        │            │     AI 交易        │            │     其他数据       │
│  (AIFinderPage)   │            │(BuyerMatchingPage)│            │   (Excel导入等)    │
├───────────────────┤            ├───────────────────┤            ├───────────────────┤
│  输出: 觅售结果    │            │  输出: 交易流程    │            │  输入: 手动录入    │
│  → 归集到项目     │            │  → 归集到项目     │            │  → 归集到项目     │
└───────────────────┘            └───────────────────┘            └───────────────────┘
```

### 1.2 核心概念: M&A 项目 (Project)

```
一个 M&A 项目代表一笔潜在的并购交易，贯穿整个生命周期：

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   项目建项  ──►  AI觅售  ──►  AI交易  ──►  成交/关闭                      │
│      │            │            │                                      │
│      │            │            │                                      │
│      ▼            ▼            ▼                                      │
│   基本信息     觅售报告      协议/尽调/估值/匹配/推荐书                    │
│   出售方信息   匹配结果      各阶段产出物                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 二、数据模型设计

### 2.1 核心实体关系

```
┌─────────────┐       ┌─────────────┐       ┌─────────────────┐
│   Project   │       │   Party     │       │  ProjectPhase   │
│   项目主表   │──1:N─│   参与方     │       │   项目阶段       │
├─────────────┤       ├─────────────┤       ├─────────────────┤
│ id          │       │ id          │       │ id              │
│ name        │       │ projectId   │       │ projectId       │
│ status      │       │ role        │       │ phase           │
│ industry    │       │ companyName │       │ status          │
│ region      │       │ contactInfo │       │ startedAt       │
│ source      │       └─────────────┘       │ completedAt     │
│ createdAt   │                             │ outputData (JSON)│
│ updatedAt   │                             └─────────────────┘
└─────────────┘
```

### 2.2 项目状态机

```
                    ┌─────────────┐
                    │   DRAFT     │  草稿（手动建项）
                    └──────┬──────┘
                           │ submit
                           ▼
                    ┌─────────────┐
         ┌─────────│  RESEARCHING │ AI觅售中
         │         └──────┬──────┘
         │                │ complete
         │                ▼
         │         ┌─────────────┐
         │  discard│   MATCHING  │ AI交易中
         │         └──────┬──────┘
         │                │ close
         │                ▼
         │         ┌─────────────┐
         │         │   CLOSED    │ 已关闭
         │         └─────────────┘
         │
         └────────►┌─────────────┐
                   │  ARCHIVED   │ 已归档
                   └─────────────┘
```

### 2.3 项目来源

| 来源 | 说明 | 触发方式 |
|------|------|---------|
| `manual` | 手动建项 | 用户在数据管理页面创建 |
| `excel_import` | Excel导入 | 通过ExcelImporter导入 |
| `ai_finder` | AI觅售转化 | 觅售结果"加入项目" |
| `ai_matching` | AI交易转化 | 交易结果"建项跟踪" |

---

## 三、功能模块设计

### 3.1 项目列表 (List View)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  项目管理                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  [全部] [草稿] [觅售中] [交易中] [已关闭]          [🔍搜索]  [+ 新建项目]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ 项目卡片 ─────────────────────────────────────────────────────────────┐  │
│  │                                                                        │  │
│  │  深圳智云科技出售项目                    [觅售中] [交易中] [已关闭]    │  │
│  │  行业: 人工智能 | 地区: 华南 | 估值: 15亿                              │  │
│  │  创建: 2026-04-20 | 来源: AI觅售                                      │  │
│  │                                                                        │  │
│  │  [查看详情] [进入觅售] [进入交易] [归档]                               │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ 项目卡片 ─────────────────────────────────────────────────────────────┐  │
│  │  广州中检质量技术出售项目                  [草稿]                      │  │
│  │  行业: TIC检测 | 地区: 华南 | 估值: 5亿                                 │  │
│  │  创建: 2026-04-18 | 来源: Excel导入                                    │  │
│  │                                                                        │  │
│  │  [查看详情] [编辑] [删除]                                               │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 项目详情 (Detail View)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← 返回列表          深圳智云科技出售项目                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [基本信息] [出售方信息] [财务数据] [觅售报告] [交易流程] [文档资料]          │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌─ 基本信息 ───────────────────────────────────────────────────────────┐   │
│  │  项目名称: 深圳智云科技有限公司出售项目                                │   │
│  │  所属行业: 人工智能 | 所属地区: 华南地区                               │   │
│  │  预估估值: ¥15亿 | 项目来源: AI觅售                                   │   │
│  │  创建时间: 2026-04-20 10:30                                           │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─ 觅售报告 ───────────────────────────────────────────────────────────┐   │
│  │                                                                        │   │
│  │  匹配度分布: ████████████░░░░░░░░ 78%                                 │   │
│  │  匹配买家数: 12 家                                                     │   │
│  │  最佳匹配: [华测检测] [广电计量] [中国汽研]                              │   │
│  │                                                                        │   │
│  │  [查看完整报告] [重新分析]                                              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─ 交易流程 ───────────────────────────────────────────────────────────┐   │
│  │                                                                        │   │
│  │  ✓ 协议签署  ✓ 尽职调查  ● 企业估值  ○ 买家匹配  ○ 推荐书             │   │
│  │                                                                        │   │
│  │  当前阶段: 企业估值                                                    │   │
│  │  [进入AI交易]                                                         │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 四、数据归集设计

### 4.1 AI觅售 → 项目

```
用户点击 "加入项目" 或 "建项跟踪"

┌─────────────────────────────────────────────────────────────────────────┐
│                         AI觅售结果列表                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  深圳智云科技有限公司                              [92分] [加入项目 ▼]    │
│  人工智能 | 华南地区 | ¥15亿                                              │
│                                                                          │
│  ┌─ 下拉菜单 ───────────────────────────────────────────────────────┐    │
│  │                                                                       │    │
│  │  ○  选择已有项目                                                     │    │
│  │     └─ 深圳智云科技出售项目 (觅售中)                                  │    │
│  │     └─ 广州中检质量技术出售项目 (草稿)                               │    │
│  │                                                                       │    │
│  │  ●  新建项目并加入                                                   │    │
│  │     项目名称: [深圳智云科技有限公司出售项目____]                      │    │
│  │     所属行业: [人工智能____________________]                        │    │
│  │     预估估值: [15亿_______________________]                          │    │
│  │                                                                       │    │
│  │                              [取消] [确认加入]                        │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 AI交易 → 项目

```
各AI交易子模块完成后，自动将产出物归集到项目详情：

┌─────────────────────────────────────────────────────────────────────────┐
│                         AI交易子模块 → 项目阶段                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  AIProtocolSigning (协议签署)  ──►  ProjectPhase { phase: 'protocol' }   │
│  AIDueDiligence (尽职调查)     ──►  ProjectPhase { phase: 'due-diligence'}│
│  AIValuation (企业估值)        ──►  ProjectPhase { phase: 'valuation' }  │
│  AIMatchmaker (买家匹配)       ──►  ProjectPhase { phase: 'match' }     │
│  DDReportGenerator (推荐书)    ──►  ProjectPhase { phase: 'report' }    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 五、API 接口设计

### 5.1 项目管理 API

```
POST   /api/projects              # 创建项目
GET    /api/projects              # 获取项目列表
GET    /api/projects/:id          # 获取项目详情
PUT    /api/projects/:id          # 更新项目
DELETE /api/projects/:id          # 删除项目

POST   /api/projects/:id/phases   # 添加项目阶段
GET    /api/projects/:id/phases   # 获取所有阶段
PUT    /api/projects/:id/phases/:phaseId  # 更新阶段

POST   /api/projects/:id/parties  # 添加参与方
GET    /api/projects/:id/parties  # 获取所有参与方
```

### 5.2 数据导入 API

```
POST   /api/imports/excel         # Excel批量导入
POST   /api/imports/validate      # 数据校验
GET    /api/imports/templates     # 下载导入模板
```

### 5.3 觅售结果归集 API

```
POST   /api/projects/:id/finder-result  # 归集觅售结果
GET    /api/projects/:id/finder-report # 获取觅售报告
```

---

## 六、数据库设计

### 6.1 项目主表 (projects)

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft',     -- draft, researching, matching, closed, archived
  industry TEXT,
  region TEXT,
  estimated_value TEXT,
  source TEXT DEFAULT 'manual',     -- manual, excel_import, ai_finder, ai_matching

  -- 基本信息
  company_name TEXT,
  company_type TEXT,
  registration_capital TEXT,
  establishment_date TEXT,
  employee_count TEXT,

  -- 出售动机
  sell_motivation TEXT,            -- JSON数组

  -- 风险信息
  risk_level TEXT,
  change_records TEXT,

  -- 元数据
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_industry ON projects(industry);
CREATE INDEX idx_projects_source ON projects(source);
```

### 6.2 项目参与方表 (project_parties)

```sql
CREATE TABLE project_parties (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  role TEXT NOT NULL,               -- seller, buyer, advisor
  company_name TEXT NOT NULL,
  contact_person TEXT,
  contact_method TEXT,
  is_verified INTEGER DEFAULT 0,

  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX idx_parties_project ON project_parties(project_id);
```

### 6.3 项目阶段表 (project_phases)

```sql
CREATE TABLE project_phases (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  phase TEXT NOT NULL,              -- protocol, due-diligence, valuation, match, report
  status TEXT DEFAULT 'pending',    -- pending, in_progress, completed, failed
  started_at TEXT,
  completed_at TEXT,
  output_data TEXT,                  -- JSON 存储各阶段产出物

  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX idx_phases_project ON project_phases(project_id);
```

### 6.4 财务数据表 (project_financials)

```sql
CREATE TABLE project_financials (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  year TEXT NOT NULL,               -- Y1, Y2, Y3 (近三年)
  revenue TEXT,
  net_profit TEXT,
  total_assets TEXT,
  net_assets TEXT,
  gross_margin TEXT,

  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

---

## 七、改造文件清单

### 7.1 新增文件

| 文件路径 | 说明 |
|---------|------|
| `server/src/routes/projects.ts` | 项目管理API |
| `server/src/routes/imports.ts` | 数据导入API |
| `server/src/utils/projectDb.ts` | 项目数据库工具 |
| `server/data/projects.db` | 项目数据库 |
| `src/pages/ProjectListPage.jsx` | 项目列表页 |
| `src/pages/ProjectDetailPage.jsx` | 项目详情页 |
| `src/components/projects/ProjectCard.jsx` | 项目卡片组件 |
| `src/components/projects/ProjectForm.jsx` | 项目表单组件 |
| `src/stores/projectStore.js` | 项目状态管理 |

### 7.2 改造文件

| 文件路径 | 改动 |
|---------|------|
| `server/src/index.ts` | 新增 /api/projects 路由 |
| `src/App.jsx` | 新增项目路由 |
| `src/components/layout/Navbar.jsx` | 新增"项目管理"导航 |
| `src/data/excelData.js` | 对接后端API |
| `src/services/api.js` | 新增 projects API |
| `src/pages/AIFinderPage.jsx` | 觅售结果→项目归集 |
| `src/pages/BuyerMatchingPage.jsx` | 交易结果→项目归集 |

### 7.3 路由设计

```jsx
<Route path="/projects" element={<ProjectListPage />} />
<Route path="/projects/:id" element={<ProjectDetailPage />} />
```

---

## 八、实施计划

| Phase | 内容 | 优先级 |
|-------|------|--------|
| 1 | 项目管理基础功能（CRUD、列表、详情） | P0 |
| 2 | 项目与觅售结果归集对接 | P0 |
| 3 | 项目与交易流程归集对接 | P0 |
| 4 | Excel导入对接后端 | P1 |
| 5 | 交易流程看板优化 | P2 |
| 6 | 文档资料管理 | P2 |

---

## 九、待确认事项

1. **项目与公司关系**: 一个项目是否对应一个公司？还是一个项目可以包含多个出售方？
2. **觅售结果保留**: 觅售结果是否需要完整保留，还是只保留汇总数据？
3. **交易流程重启**: 关闭的项目是否可以重新开启？是否需要版本控制？
4. **数据权限**: 是否需要区分操作用户和查看权限？

---

## 十、风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 现有功能破坏 | 中 | 高 | 分支开发，充分测试 |
| API设计不合理 | 低 | 高 | 先出详细设计文档 |
| 前端状态管理复杂 | 中 | 中 | 使用 Zustand 统一管理 |
