# 数据管理模块实施计划

**日期:** 2026-04-25
**状态:** 规划中
**版本:** v1.0

---

## Phase 1: 后端 API 开发

### Task 1.1: 创建项目数据库工具

**文件:** `server/src/utils/projectDb.ts`

```typescript
// 实现内容:
- initProjectDb(): 初始化数据库连接
- createProject(project): 插入项目
- getProject(id): 查询单个项目
- listProjects(filters): 列表查询
- updateProject(id, data): 更新项目
- deleteProject(id): 软删除项目

// 依赖: 无
// 验证: 运行后 server/data/projects.db 存在且表结构正确
```

### Task 1.2: 创建项目路由

**文件:** `server/src/routes/projects.ts`

```typescript
// 实现内容:
- POST   /api/projects              # 创建项目
- GET    /api/projects              # 获取项目列表
- GET    /api/projects/:id          # 获取项目详情
- PUT    /api/projects/:id          # 更新项目
- DELETE /api/projects/:id          # 删除项目
- POST   /api/projects/:id/phases   # 添加/更新阶段
- GET    /api/projects/:id/phases   # 获取所有阶段

// 依赖: Task 1.1
// 验证: curl 测试各端点返回正确
```

### Task 1.3: 挂载项目路由

**文件:** `server/src/index.ts`

```typescript
// 实现内容:
- 导入 projects 路由
- 挂载到 /api/projects

// 依赖: Task 1.2
// 验证: GET /api/projects 返回空数组 []
```

---

## Phase 2: 前端基础页面

### Task 2.1: 创建项目状态管理

**文件:** `src/stores/projectStore.js`

```typescript
// 实现内容:
- Zustand store for projects
- state: projects[], currentProject, loading, error
- actions: fetchProjects, fetchProject, createProject, updateProject, deleteProject

// 依赖: Task 1.3
// 验证: 页面能正常加载和显示项目列表
```

### Task 2.2: 创建项目列表页

**文件:** `src/pages/ProjectListPage.jsx`

```typescript
// 实现内容:
- 顶部筛选: 全部/草稿/觅售中/交易中/已关闭
- 搜索框
- 项目卡片列表
- 新建项目按钮

// 依赖: Task 2.1
// 验证: 页面显示正确，筛选功能正常
```

### Task 2.3: 创建项目详情页

**文件:** `src/pages/ProjectDetailPage.jsx`

```typescript
// 实现内容:
- Tab 导航: 基本信息 / 觅售报告 / 交易流程
- 各 Tab 内容展示
- 返回列表按钮

// 依赖: Task 2.2
// 验证: 点击项目卡片能进入详情页
```

### Task 2.4: 添加项目路由

**文件:** `src/App.jsx`

```typescript
// 实现内容:
- 导入 ProjectListPage, ProjectDetailPage
- 添加路由: /projects, /projects/:id

// 依赖: Task 2.3
// 验证: 路由跳转正常
```

### Task 2.5: 添加导航入口

**文件:** `src/components/layout/Navbar.jsx`

```typescript
// 实现内容:
- 添加"项目管理"导航项
- 链接到 /projects

// 依赖: Task 2.4
// 验证: 导航栏显示项目管理入口
```

---

## Phase 3: 觅售结果归集

### Task 3.1: AIFinderPage 添加归集按钮

**文件:** `src/pages/AIFinderPage.jsx`

```typescript
// 实现内容:
- 每个觅售结果卡片添加"加入项目"按钮
- 点击弹出项目选择/创建弹窗

// 依赖: Task 2.3
// 验证: 按钮点击能打开弹窗
```

### Task 3.2: 创建项目选择/创建弹窗

**文件:** `src/components/projects/ProjectSelector.jsx`

```typescript
// 实现内容:
- 选择已有项目 (radio)
- 新建项目并加入
- 确认后调用 API 归集觅售结果

// 依赖: Task 3.1
// 验证: 能选择已有项目或新建项目
```

### Task 3.3: 实现归集 API 端点

**文件:** `server/src/routes/projects.ts` (扩展)

```typescript
// 实现内容:
- POST /api/projects/:id/finder-result
- 保存完整觅售报告到 project_phases

// 依赖: Task 1.2
// 验证: 觅售结果能保存到项目
```

### Task 3.4: 详情页展示觅售报告 Tab

**文件:** `src/pages/ProjectDetailPage.jsx` (扩展)

```typescript
// 实现内容:
- 读取并展示觅售报告
- 最佳匹配买家列表
- 匹配度分布图

// 依赖: Task 3.3
// 验证: 能正确展示觅售报告内容
```

---

## Phase 4: 交易流程归集

### Task 4.1: 改造 BuyerMatchingPage 支持项目上下文

**文件:** `src/pages/BuyerMatchingPage.jsx`

```typescript
// 实现内容:
- 支持从 URL 获取 projectId
- 无 projectId 时显示项目选择
- 各阶段完成时自动归集

// 依赖: Task 2.3
// 验证: 能选择项目后进入交易流程
```

### Task 4.2: 各交易子模块添加 onComplete 归集

**文件:** `src/components/ai/AIProtocolSigning.jsx`
**文件:** `src/components/ai/AIDueDiligence.jsx`
**文件:** `src/components/ai/AIValuation.jsx`
**文件:** `src/components/ai/AIMatchmaker.jsx`
**文件:** `src/components/ai/DDReportGenerator.jsx`

```typescript
// 实现内容:
- 各模块 onComplete 时自动调用归集 API
- 将阶段产出物写入 project_phases

// 依赖: Task 4.1
// 验证: 完成各阶段后项目详情页显示完成状态
```

### Task 4.3: 详情页展示交易流程 Tab

**文件:** `src/pages/ProjectDetailPage.jsx` (扩展)

```typescript
// 实现内容:
- 展示各阶段完成状态
- 各阶段产出物预览
- 进入各阶段详情按钮

// 依赖: Task 4.2
// 验证: 能正确展示交易流程进度
```

---

## Phase 5: Excel 导入对接后端

### Task 5.1: 创建导入路由

**文件:** `server/src/routes/imports.ts`

```typescript
// 实现内容:
- POST /api/imports/excel  # Excel批量导入
- GET  /api/imports/templates # 下载导入模板

// 依赖: Task 1.3
// 验证: 能正确处理 Excel 文件
```

### Task 5.2: 改造 excelData store 对接后端

**文件:** `src/data/excelData.js`

```typescript
// 实现内容:
- 导入时同步到后端
- 从后端获取已导入数据
- 保留 localStorage 作为离线缓存

// 依赖: Task 5.1
// 验证: Excel 导入后数据能同步到服务器
```

### Task 5.3: 导入数据自动建项

**文件:** `src/components/ai/ExcelImporter.jsx` (扩展)

```typescript
// 实现内容:
- 导入后可选"同时创建项目"
- 自动跳转到项目详情页

// 依赖: Task 5.2
// 验证: 导入后能创建项目
```

---

## Phase 6: 交易流程看板优化 (可选)

### Task 6.1: 项目详情页添加快速操作

```typescript
// 实现内容:
- "进入觅售" / "进入交易" 快捷按钮
- 项目状态进度条

// 依赖: Phase 3, 4 完成
```

### Task 6.2: 项目列表页添加批量操作

```typescript
// 实现内容:
- 批量归档
- 批量删除

// 依赖: Task 6.1
```

---

## 任务执行顺序

```
Phase 1 (后端 API) → Phase 2 (前端基础) → Phase 3 (觅售归集) → Phase 4 (交易归集) → Phase 5 (Excel导入) → Phase 6 (优化)
     Task 1.1              Task 2.1            Task 3.1           Task 4.1           Task 5.1
        → Task 1.2          → Task 2.2          → Task 3.2          → Task 4.2          → Task 5.2
           → Task 1.3          → Task 2.3          → Task 3.3          → Task 4.3          → Task 5.3
                               → Task 2.4
                               → Task 2.5
```

---

## 执行模式选择

请选择执行方式:

| 模式 | 说明 |
|------|------|
| **A. 子代理驱动 (推荐)** | 我使用 subagent 并行/串行执行各任务，每个任务遵循 TDD |
| B. 手动执行 | 我提供详细指导，您自行执行各任务 |
| C. 我全程执行 | 由我一个人顺序执行所有任务 |

推荐 **A 模式**，原因:
1. 并行执行多个独立任务，效率高
2. 每个任务独立验证，降低集成风险
3. 遵循 TDD，保证代码质量
