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

## 7. QCC 企业情报

### 7.1 配置状态

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

### 7.2 企业综合情报

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

## 8. CNCA 认证状态查询

### 8.1 批量验证企业认证状态

`POST /api/cnca-certification/verify-batch`

请求体：

```json
{
  "companies": [
    { "name": "上海英格尔认证有限公司", "creditCode": "911101018012144040" }
  ]
}
```

响应：

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

依赖：`@modelcontextprotocol/server-puppeteer` (Puppeteer MCP)

### 8.2 查询缓存状态

`GET /api/cnca-certification/status/:companyName`

响应：

```json
{
  "success": true,
  "data": {
    "hasCertification": true,
    "certNo": "CNCA-R-2002-087",
    "cached": true
  }
}
```

## 9. TIC 企业查询

`GET /api/tic-companies`

查询参数：

| 参数 | 类型 | 说明 |
|-----|------|-----|
| keyword | string | 企业名称关键字搜索 |
| industry | string | 行业门类筛选 |
| province | string | 省份筛选 |
| city | string | 城市筛选 |
| county | string | 区县筛选 |
| companyType | string | 企业类型筛选 |
| employeeCountMin | number | 最小参保人数 |
| employeeCountMax | number | 最大参保人数 |
| hasPhone | string | 联系电话筛选（有/无） |
| hasWebsite | string | 网址筛选（有/无） |
| businessScope | string | 经营范围模糊搜索 |
| page | number | 页码，默认1 |
| pageSize | number | 每页条数，默认20 |

## 10. 项目管理

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/projects` | 项目列表（支持分页、状态筛选） |
| GET | `/api/projects/:id` | 项目详情 |
| POST | `/api/projects` | 创建项目 |
| PUT | `/api/projects/:id` | 更新项目 |
| DELETE | `/api/projects/:id` | 删除项目 |
| GET | `/api/projects/:id/phases` | 项目阶段列表 |
| PUT | `/api/projects/:id/phases` | 更新项目阶段 |
| POST | `/api/imports/excel` | Excel 批量导入项目 |

## 11. 前端对接位置

当前前端 API 包装集中在：

- `src/services/api.js`

新增后端接口时，建议同步做四件事：

1. 在 `server/src/routes/` 新增或修改路由
2. 在 `server/src/index.ts` 注册路由
3. 在 `src/services/api.js` 新增方法
4. 更新本文档和相关页面说明
