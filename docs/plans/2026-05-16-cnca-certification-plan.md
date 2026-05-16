# CNCA 认证状态查询 — 实现计划

## 1. 实现概述

在 AI 觅售（TIC 企业查询）页面中，为每家企业增加 CNCA 认证资质查询功能。点击"刷新认证状态"按钮后，后端通过 Puppeteer MCP 爬取 CNCA 官网，结果显示在企业卡片上并支持跳转详情页。

## 2. 验收标准

- [ ] `POST /api/cnca-certification/verify-batch` 可批量验证企业 CNCA 认证状态
- [ ] `GET /api/cnca-certification/status/:companyName` 可查询单家缓存状态
- [ ] AIFinderPage 搜索结果卡片显示认证状态 Badge（有认证/无认证/未验证）
- [ ] 点击"刷新认证状态"按钮，当前页所有企业批量验证并更新标签
- [ ] 有认证企业的名称可点击，跳转 CNCA 详情页
- [ ] 认证结果缓存 24 小时

---

## 3. 任务列表

### Task 1: 创建 CNCA 缓存工具
**文件**: `server/src/utils/cncaCache.ts`

**内容**:
- `CncaCertResult` 接口：`{ hasCertification, certNo, instCode, orgCode, detailUrl, cachedAt }`
- `cncaCache: Map<string, CncaCertResult>` — key = `企业名称|统一社会信用代码`
- `getCached(key)` — 返回缓存结果（判断是否过期，超24h无效）
- `setCached(key, result)` — 写入缓存

**完成标准**: 缓存 24h 后 getCached 返回 undefined

---

### Task 2: 创建 CNCA 认证 API 路由
**文件**: `server/src/routes/cncaCertification.ts`

**依赖**: Task 1

**内容**:
1. `POST /verify-batch` — 批量验证接口
   - Request: `{ companies: [{ name, creditCode }] }`
   - 遍历每家企业，调用 `queryCncaCertification(name, creditCode)`
   - 返回数组: `[{ name, creditCode, hasCertification, certNo, instCode, orgCode, detailUrl }]`

2. `GET /status/:companyName` — 查询缓存接口
   - 从缓存中查找 `companyName` 对应结果
   - 返回缓存数据或 `{ hasCertification: false, cached: false }`

**完成标准**: curl 测试可返回正确结果

---

### Task 3: 实现 CNCA 认证状态查询函数
**文件**: `server/src/routes/cncaCertification.ts`（或拆分到 `server/src/utils/cncaScraper.ts`）

**依赖**: Task 1 + MCP server 环境

**CNCA 页面操作流程**（per 企业）:

1. **navigate**: `https://cx.cnca.cn/CertECloud/institutionBody/authenticetionList`
2. **wait 500ms** 等页面加载完成
3. **fill** 搜索框（定位符: `input` with label/placeholder containing `机构名称`）with 企业名称
4. **click** 按钮（文字: `查询`）
5. **wait 2000ms** 等搜索结果
6. **extract** 从结果列表提取字段:
   - `机构批准号` → `instCode`
   - `有效` 状态
   - 行的 `id` 参数（从 onclick/url 中提取）
7. 如果找到匹配行: 构建 `detailUrl = https://cx.cnca.cn/CertECloud/institutionBody/authenticetionDetil?id={id}&instCode={instCode}&orgCode={creditCode}`
8. 缓存结果

**异常处理**:
- 页面加载失败 → 返回 `{ hasCertification: false, error: true }`
- 未找到匹配企业 → 返回 `{ hasCertification: false }`
- 网络超时 → 整体请求超时 30s

**完成标准**: 对"上海英格尔认证有限公司"能正确返回 hasCertification=true, certNo=CNCA-R-2003-117

---

### Task 4: 注册路由
**文件**: `server/src/index.ts`

**内容**:
```ts
import { cncaCertificationRouter } from './routes/cncaCertification.js'
// ...
app.use('/api/cnca-certification', cncaCertificationRouter)
```

**完成标准**: `curl http://localhost:3001/api/cnca-certification/status/上海英格尔认证有限公司` 有返回

---

### Task 5: 前端 API 方法
**文件**: `src/services/api.js`

**内容**:
```js
verifyCncaCertification(companies) // POST /api/cnca-certification/verify-batch
getCncaCertStatus(companyName)      // GET /api/cnca-certification/status/:companyName
```

**完成标准**: 方法存在且调用正确

---

### Task 6: 前端认证状态 UI
**文件**: `src/pages/AIFinderPage.jsx`

**依赖**: Task 5

**内容**:

1. **State**:
   - `cncaResults: Map<string, CncaCertResult>` — 公司名称 → 认证结果

2. **刷新按钮**:
   - 右下角浮动 `刷新认证状态` 按钮
   - loading 状态显示 spinner
   - 点击时调用 `verifyCncaCertification(当前页所有企业)`

3. **结果卡片 Badge**:
   - 在企业卡片上新增认证状态区域
   - 三种状态: `未验证`(灰色) / `已认证`(绿色 Shield) / `无认证`(红色 X)
   - 公司名称变为链接: 有认证 → CNCA 详情页；无认证/未验证 → 普通文本

4. **点击公司名**:
   ```js
   const handleCompanyClick = (deal) => {
     const cert = cncaResults.get(deal.company_name)
     if (cert?.hasCertification && cert?.detailUrl) {
       window.open(cert.detailUrl, '_blank', 'noopener,noreferrer')
     }
   }
   ```

**完成标准**: UI 正确显示，可点击跳转

---

## 4. 技术说明

### 4.1 Puppeteer MCP 调用方式

后端通过 Node.js `child_process.spawn` 启动 MCP server:
```js
const mcp = spawn('npx', ['-y', '@modelcontextprotocol/server-puppeteer'], {
  stdio: ['pipe', 'pipe', 'pipe', 'ipc']
})
```

通过 stdio 发送 JSON-RPC 请求，接收 JSON-RPC 响应。

### 4.2 CNCA 页面 Selector 参考

| 元素 | Selector 策略 |
|------|--------------|
| 搜索框 | `input[placeholder*="机构名称"]` 或 label 包含"机构名称"的 input |
| 查询按钮 | `button:has-text("查询")` |
| 结果行 | `.table-list-item` 或 `tr` / `div.list-item`（需实际验证） |

### 4.3 缓存 Key

```
key = `${companyName}|${creditCode}`
```

---

## 5. 文件清单

| 操作 | 文件路径 |
|------|---------|
| 新增 | `server/src/utils/cncaCache.ts` |
| 新增 | `server/src/routes/cncaCertification.ts` |
| 修改 | `server/src/index.ts` |
| 修改 | `src/services/api.js` |
| 修改 | `src/pages/AIFinderPage.jsx` |