# CNCA 认证状态查询功能设计

## 1. 需求概述

在 AI 觅售板块（TIC 企业查询）筛选出企业后，为每家企业增加 **CNCA 认证资质** 查询功能：

- 在搜索结果列表中显示"认证状态"标签（有 / 无 / 未验证）
- 点击"刷新认证状态"按钮，后端通过 puppeteer MCP 批量查询 CNCA
- 结果缓存，避免重复请求
- 点击公司名称可跳转至 CNCA 详情页

## 2. 技术方案

### 2.1 关键技术选型

| 组件 | 选型 | 说明 |
|------|------|------|
| 浏览器自动化 | `@modelcontextprotocol/server-puppeteer` | 通过 `npx -y @modelcontextprotocol/server-puppeteer` 启动 MCP server |
| 后端路由 | Express (`server/src/routes/`) | 新建 `cncaCertification.ts` |
| 缓存 | 内存 Map + TTL | 缓存 24 小时，过期后需重新刷新 |
| 前端 | React + 现有 AIFinderPage | 增加"刷新认证状态"按钮 |

### 2.2 CNCA 页面分析

**列表页**: `https://cx.cnca.cn/CertECloud/institutionBody/authenticetionList`

**详情页 URL 格式**（用户提供）:
```
https://cx.cnca.cn/CertECloud/institutionBody/authenticetionDetil?id={id}&instCode={instCode}&orgCode={orgCode}
```

其中 `id`、`instCode`、`orgCode` 均需从列表页搜索结果中提取。

### 2.3 数据流

```
用户点击"刷新认证状态"
    → 前端 POST /api/cnca-certification/verify-batch
    → 后端调用 puppeteer MCP (navigate + extract)
    → 后端解析结果，存入缓存
    → 返回 { companyName, hasCertification, certNo, instCode, orgCode }
    → 前端更新对应企业的认证状态
```

## 3. 后端设计

### 3.1 新增 API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/cnca-certification/verify-batch` | 批量验证企业 CNCA 认证状态 |
| GET | `/api/cnca-certification/status/:companyName` | 查询单个企业缓存的认证状态 |

**POST /api/cnca-certification/verify-batch**

Request:
```json
{
  "companies": [
    { "name": "上海英格尔认证有限公司", "creditCode": "911101018012144040" }
  ]
}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "name": "上海英格尔认证有限公司",
      "creditCode": "911101018012144040",
      "hasCertification": true,
      "certNo": "CNCA-R-2002-087",
      "instCode": "CNCA-R-2002-087",
      "orgCode": "911101018012144040",
      "detailUrl": "https://cx.cnca.cn/CertECloud/institutionBody/authenticetionDetil?id=67&instCode=CNCA-R-2002-087&orgCode=911101018012144040"
    }
  ]
}
```

### 3.2 缓存设计

使用内存 Map，key = 企业名称 + 统一社会信用代码，value = 认证结果 + TTL（24 小时）。

### 3.3 Puppeteer MCP 调用流程

由于 CNCA 页面需交互式搜索，后端需要：

1. 导航到列表页
2. 填写企业名称/信用代码到搜索框
3. 点击搜索
4. 等待结果加载
5. 提取搜索结果中的认证信息（如 certNo、instCode、orgCode）
6. 判断是否匹配到目标企业

## 4. 前端设计

### 4.1 结果卡片增加认证状态标签

在 `AIFinderPage.jsx` 搜索结果卡片上新增：

- 认证状态 Badge（有认证 / 无认证 / 未验证）
- 刷新认证状态按钮（全局，批量刷新当前页）
- 公司名称点击跳转 CNCA 详情页（如有认证）

### 4.2 交互设计

```
[搜索结果列表]
  ├─ 企业A  ──── [未验证]  ── 点击公司名 → 跳转 CNCA 详情（如有认证）
  ├─ 企业B  ──── [未验证]
  ...
  └─ [刷新认证状态] 按钮（右下角浮动）

点击 [刷新认证状态]
  → 按钮变为 loading
  → 批量查询当前页所有企业的 CNCA 状态
  → 更新各企业的认证标签
  → 按钮恢复
```

## 5. 文件变更

### 后端新增
- `server/src/routes/cncaCertification.ts` — 新 API 路由
- `server/src/utils/cncaCache.ts` — 认证状态缓存工具

### 前端修改
- `src/pages/AIFinderPage.jsx` — 增加认证状态标签和刷新按钮
- `src/services/api.js` — 增加 `verifyCncaCertification()` 方法

### 挂载
- `server/src/index.ts` — 注册 `cncaCertificationRouter`

## 6. 待确认

- [ ] CNCA 列表页搜索框的字段名（是企业名称还是统一社会信用代码？）
- [ ] 搜索结果是单条还是多条（同一名称是否可能有多个认证记录）？
- [ ] Puppeteer MCP 调用方式：是通过 MCP tool 调用的方式暴露给后端，还是后端通过子进程方式调用？