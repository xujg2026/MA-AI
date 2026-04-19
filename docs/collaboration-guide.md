# 协作约定

这份文档不是“当前代码已经完全做到”的描述，而是后续协作时建议遵守的最小约定。目标只有一个：减少重复沟通和接手成本。

## 1. 代码落点约定

### 前端

- 路由级页面放 `src/pages/`
- 可复用业务组件放 `src/components/`
- 基础 UI 组件优先收口到 `src/components/ui/`
- 前端请求统一走 `src/services/api.js`
- 本地 mock/辅助数据放 `src/data/`

### 后端

- 路由入口放 `server/src/routes/`
- 第三方服务适配放 `server/src/services/`
- 通用工具放 `server/src/utils/`

## 2. 新增页面的推荐流程

新增页面时，至少同步检查这些位置：

1. 新建页面文件到 `src/pages/`
2. 在 `src/App.jsx` 注册路由
3. 如果页面需要出现在导航、首页能力区或页脚，分别更新：
   - `src/components/layout/Navbar.jsx`
   - `src/components/layout/Footer.jsx`
   - `src/components/home/AICapabilities.jsx`
4. 如果页面依赖后端，优先补 `src/services/api.js`，不要在页面里直接散写 `fetch`
5. 如果页面是演示态，文案里明确标明 mock/开发中，避免误判为已上线

## 3. 新增后端接口的推荐流程

新增或改造接口时，建议按这条链路走：

1. 在 `server/src/routes/` 新建路由文件
2. 在 `server/src/index.ts` 挂载到 `/api/...`
3. 在 `src/services/api.js` 新增前端调用方法
4. 页面/组件只调用 `getApi()` 暴露的方法
5. 把请求参数、返回结构、外部依赖写进 [后端 API 清单](backend-api.md)

## 4. mock 和 live 的边界约定

当前仓库处于原型阶段，后续改动时建议显式区分三种状态：

- `live`: 已接后端或第三方服务
- `local`: 完全在浏览器本地完成，例如 Excel 导入
- `mock`: 仅用于演示，没有真实数据源

如果一个页面仍然是 mock，尽量做到：

- mock 数据集中放在 `src/data/` 或 `src/services/`
- 不把 mock 字段名伪装成最终契约
- 联调完成后及时删除无用 mock 分支

## 5. 环境变量变更约定

新增环境变量时，至少同步更新：

- `.env.example` 或 `server/.env.example`
- [本地开发指南](local-development.md)
- 如果影响接口调用，再更新 [后端 API 清单](backend-api.md)

不要只把变量写进自己的本地 `.env`。

## 6. 数据相关约定

- Excel 导入的标准化逻辑在 `src/data/excelData.js`
- 导入结果目前只保存在浏览器本地，不会自动写回后端
- 如果后续引入真实数据库，优先保留 `normalizeRecord` 这一层，避免页面直接吃原始 Excel 字段

## 7. 当前协作时要特别注意的点

- `tic-intelligence/` 是独立子项目，不要默认把它和主应用一起改。
- `AIValuationPage.jsx`、`IntegrationPredictionPage.jsx` 目前未挂载路由，改相关功能前先确认是否要接入主导航。
- 部分入口已经链接到 `/ai-valuation`，但 `App.jsx` 还没有对应路由，修这类问题时要同时检查入口和路由两侧。
- `.claude/` 属于本地工具配置，不应作为业务运行依赖。

## 8. 提交前自检清单

每次做完一个功能，至少过一遍下面这几项：

- 前端路由、导航、入口文案是否一致
- 新接口是否已经挂载到 `server/src/index.ts`
- `src/services/api.js` 是否同步更新
- 新环境变量是否补到 example 文件
- 文档是否需要同步更新
- 至少执行过相关的 `build` / `lint` 命令
