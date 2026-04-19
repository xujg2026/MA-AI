# 后端 API 清单

## 1. 总体约定

前端统一通过 `src/services/api.js` 调后端，当前响应大多遵循以下结构：

```json
{
  "success": true,
  "data": {}
}
```

失败时通常返回：

```json
{
  "success": false,
  "error": "message"
}
```

QCC 相关接口额外可能返回：

- `partial`
- `meta`

## 2. 健康与调试

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/health` | 健康检查 |
| `GET` | `/api/test-mxskill` | 直接调用 `mx-skills` 的调试接口 |

## 3. 买家相关

### 3.1 获取买家画像

`GET /api/buyer/profile`

Query 参数：

- `companyName` 必填
- `stockCode` 可选

说明：

- 后端会并行调用 `mx-finance-data` 和 `mx-finance-search`
- 上游失败时会回退到 mock 数据

### 3.2 规则初筛

`POST /api/buyer/screen`

请求体：

```json
{
  "companyName": "示例公司",
  "industry": "检测认证",
  "region": "华东地区",
  "valuation": 50000,
  "mainCerts": ["CMA", "CNAS"],
  "limit": 20
}
```

说明：

- 使用本地预设候选池打分
- 返回 `candidates`、`totalCount`、`screenParams`

### 3.3 智能筛选 Agent

`POST /api/buyer/screening-agent`

请求体：

```json
{
  "targetCompany": {
    "name": "示例公司",
    "mainBusiness": "检测认证",
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

说明：

- 当前买家匹配主流程使用这个接口
- 会组合基础候选池、动态搜索结果和多项外部能力打分
- 返回 `screeningReport.finalRecommendations`

### 3.4 调试接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/buyer/pool` | 查看规则初筛候选池概要 |
| `GET` | `/api/buyer/candidates?industry=检测认证` | 查看智能筛选候选池 |

## 4. 财务与资讯

### 4.1 财务查询

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/api/financial/query` | 原始财务查询，Body: `{ "query": "..." }` |
| `GET` | `/api/financial/overview?company=...` | 公司财务概览 |

依赖：

- `mx-finance-data`

### 4.2 财经/并购资讯搜索

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/api/search/news` | 财经资讯搜索，Body: `{ "query": "..." }` |
| `GET` | `/api/search/ma?company=...` | 某公司并购资讯搜索 |

依赖：

- `mx-finance-search`

## 5. 股票诊断

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/api/diagnosis/stock` | 单只股票诊断，Body: `{ "query": "..." }` |
| `POST` | `/api/diagnosis/batch` | 批量诊断，Body: `{ "queries": ["...", "..."] }` |

依赖：

- `stock-diagnosis`

## 6. QCC 企业情报

### 6.1 配置状态

`GET /api/qcc/status`

返回示例：

```json
{
  "success": true,
  "data": {
    "configured": true
  }
}
```

### 6.2 企业综合情报

`POST /api/qcc/company-intelligence`

请求体：

```json
{
  "companyName": "华测检测"
}
```

说明：

- 后端会并行请求 QCC 的 `company / risk / ipr / operation` 多个服务
- 返回字段较多，前端当前主要消费：
  - `companyInfo`
  - `shareholderInfo`
  - `actualController`
  - `dishonestInfo`
  - `caseFilingInfo`
  - `businessException`
  - `administrativePenalty`
  - `patentInfo`
  - `trademarkInfo`
  - `qualifications`
  - `biddingInfo`

常见错误：

- `QCC_API_KEY is not configured`
- 上游超时
- SSE 解析失败

## 7. 前端对接位置

当前前端 API 包装集中在：

- `src/services/api.js`

新增后端接口时，建议同步做四件事：

1. 在 `server/src/routes/` 新增或修改路由
2. 在 `server/src/index.ts` 注册路由
3. 在 `src/services/api.js` 新增方法
4. 更新本文档和相关页面说明
