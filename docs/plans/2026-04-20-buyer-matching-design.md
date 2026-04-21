# 买家匹配功能设计方案

**日期:** 2026-04-20
**状态:** ✅ 核心功能已完成
**版本:** v1.2

---

## 一、功能目标

基于"**财务健康度(50%) + 战略协同性(50%)**"双维度评分的AI买家匹配系统，为拟出售企业提供精准的潜在买家推荐。

---

## 二、评分体系

### 2.1 综合评分公式

```
总评分 = 财务健康度评分 × 50% + 战略协同性评分 × 50%
```

### 2.2 财务健康度评分（100分制）

| 子维度 | 权重 | 数据来源 |
|--------|------|----------|
| 盈利能力 | 25% | AKShare `stock_financial_analysis_indicator` |
| 现金实力 | 15% | AKShare `stock_financial_benefit_ths` |
| 负债安全 | 10% | AKShare `stock_financial_benefit_ths` |

**盈利能力评分规则：**
- ROE: ≥20%→100分, 15-20%→80分, 10-15%→60分, <10%→40分
- 毛利率: ≥40%→100分, 20-40%→70分, 10-20%→50分, <10%→30分
- 净利润规模: ≥10亿→100分, 1-10亿→70分, 0.1-1亿→50分, <0.1亿→30分

**现金实力评分规则：**
- 货币资金/估值: ≥1.5倍→100分, 1-1.5倍→80分, 0.5-1倍→60分, <0.5倍→40分

**负债安全评分规则：**
- 资产负债率: ≤50%→100分, 50-60%→80分, 60-70%→60分, >70%→30分

### 2.3 战略协同性评分（100分制）

| 子维度 | 权重 | 数据来源 |
|--------|------|----------|
| 行业关联度 | 30% | 本地A股数据库关键词匹配 |
| 并购经验 | 10% | AKShare `stock_individual_notice_report` + LLM 公告解读 |
| 资金支付力 | 10% | AKShare `stock_financial_benefit_ths` |

**行业关联度评分规则：**
- 完全相同行业→100分
- 上下游/相关行业→70分
- 不同行业但有交集→50分
- 完全无关行业→30分

**并购经验评分规则（LLM分析）：**
- 近3年≥3次真实并购（作为收购方）→100分
- 近3年1-2次真实并购→70分
- 有相关公告但LLM判断无实质并购→30分
- 无相关公告记录→30分
- 降级：无LLM结果时按关键词命中条数计算

---

## 三、完整数据流

```
输入: 目标公司名称（如："华测检测"）
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  步骤1: 企查查API调用 → 获取企业基本信息                  │
│  接口: get_company_registration_info                     │
│  存储: 落表到 target_companies 表（SQLite）              │
│  输出: 企业工商信息                                      │
│  备注: 数据存入本地数据库，后续重复调用时直接从DB读取     │
│  降级: API未配置/失败时使用用户输入的表单数据            │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  步骤2: 大模型分析 → 公司画像                            │
│  输入: 企查查返回的企业信息                              │
│  输出: {                                                 │
│    mainBusiness: "主营业务",                             │
│    detectionTypes: ["检测种类"],                          │
│    relatedIndustries: ["相关行业"],                       │
│    keywords: ["关键词1", "关键词2", ...],                  │
│    targetBuyerProfile: "目标买家特征描述"                 │
│  }                                                       │
│  降级: LLM不可用时使用默认画像                           │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  步骤3: 从本地数据库查询候选公司                          │
│  数据源: SQLite数据库 a_stocks (由全部A股.csv导入)        │
│  查询: 基于keywords匹配"主营业务"、"经营范围"            │
│  过滤: 排除 is_st=1 OR is_star_st=1 的股票              │
│  输出: 初筛候选公司列表（50家）                          │
│  降级: 无匹配结果时返回行业头部公司                       │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  步骤4: AKShare数据增强                                  │
│  调用: stock_zyjs_ths() 获取详细主营信息                  │
│  调用: stock_financial_benefit_ths 获取财务数据          │
│  调用: stock_news_em 获取新闻数据                        │
│  输出: 增强后的候选池（30家）                            │
│  降级: 数据缺失时使用预设默认值                         │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  步骤4.5: 公告数据获取 & LLM并购经验分析（新增）        │
│  调用: stock_individual_notice_report() 获取公告列表      │
│  筛选: 按MA关键词过滤（并购/收购/资产重组等9个词）       │
│  抓取: 公告页面正文（东方财富URL）                      │
│  分析: LLM读取公告内容，判断是否真实并购（收购方视角）   │
│  输出: { hasMA, count, details }                        │
│  降级: LLM不可用时降级到关键词计数                       │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  步骤5: 计算评分                                         │
│  财务健康度评分 (50%) + 战略协同性评分 (50%)            │
│  输出: 带评分的候选人列表                                 │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  步骤6: 排序输出Top N                                    │
│  按总分排序，返回推荐买家列表                             │
└─────────────────────────────────────────────────────────┘
```

---

## 四、数据库设计

### 4.1 A股股票表 (a_stocks)

```sql
CREATE TABLE a_stocks (
  code TEXT PRIMARY KEY,           -- 证券代码（如：000001.SZ）
  name TEXT NOT NULL,              -- 证券名称
  business_scope TEXT,             -- 经营范围
  company_intro TEXT,              -- 公司简介
  main_business TEXT,              -- 主营业务
  main_products TEXT,              -- 主营产品名称
  region TEXT,                     -- 所属行政区划
  is_st INTEGER DEFAULT 0,          -- 是否ST股 (0=正常, 1=ST)
  is_star_st INTEGER DEFAULT 0,  -- 是否*ST股 (0=正常, 1=*ST)
  last_updated TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 全文搜索索引（用于关键词匹配）
CREATE VIRTUAL TABLE a_stocks_fts USING fts5(
  main_business, main_products, business_scope,
  content='a_stocks', content_rowid='rowid'
);
```

### 4.2 目标公司缓存表 (target_companies)

```sql
CREATE TABLE target_companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT UNIQUE NOT NULL,
  
  -- 基本信息
  registered_capital TEXT,
  legal_representative TEXT,
  business_scope TEXT,
  main_business TEXT,
  industry TEXT,
  region TEXT,
  establishment_date TEXT,
  
  -- 扩展信息
  shareholder_info TEXT,
  key_personnel TEXT,
  actual_controller TEXT,
  
  -- 风险信息
  dishonest_info TEXT,
  business_exception TEXT,
  administrative_penalty TEXT,
  
  -- 知识产权
  patent_info TEXT,
  trademark_info TEXT,
  bidding_info TEXT,
  qualifications TEXT,
  
  -- 其他
  credit_evaluation TEXT,
  
  -- 元数据
  qcc_fetch_time TEXT,
  last_updated TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_target_companies_name ON target_companies(company_name);
```

---

## 五、API接口

### 5.1 买家筛选接口

**POST** `/api/buyer/screening-agent`

**请求体：**
```typescript
{
  targetCompany: {
    name: string,           // 目标公司名称
    mainBusiness?: string,  // 主营业务
    estimatedValue?: number, // 估值预期（万元）
    acquisitionMotivation?: string, // 并购动机
    industry?: string,      // 所属行业
  },
  limit?: number            // 返回数量，默认10
}
```

**响应体：**
```typescript
{
  success: true,
  data: {
    screeningReport: {
      targetCompany: string,
      targetIndustry: string,
      screeningDate: string,
      totalCandidates: number,
      passedFirstStep: number,
      finalRecommendations: [
        {
          rank: number,
          companyName: string,
          stockCode: string,
          exchange: string,
          industry: string,
          mainBusiness: string,
          overallScore: number,
          grade: 'S' | 'A' | 'B' | 'C' | 'D',
          financialHealthScore: number,
          strategicAlignmentScore: number,
          keyStrengths: string[],
          mainConcerns: string[],
          coreMetrics: {
            roe: { value: number, score: number },
            grossMargin: { value: number, score: number },
            netProfit: { value: number, score: number },
            cashRatio: { value: number, score: number },
            debtRatio: { value: number, score: number },
            industryMatch: { value: string, score: number },
            maExperience: { count: number, score: number },
            paymentCapacity: { value: number, score: number },
          },
          dataSources: string[]
        }
      ]
    }
  }
}
```

---

## 六、错误处理策略

| 环节 | 正常处理 | 降级策略 |
|------|---------|---------|
| 企查查API | 存入本地DB | 使用用户输入表单数据 |
| LLM分析（公司画像） | 返回画像 | 使用默认画像（基于行业） |
| LLM分析（并购经验） | 返回真实并购判断 | 降级到关键词计数 |
| 本地DB查询 | 返回匹配结果 | 返回行业头部公司 |
| AKShare数据 | 补充财务数据 | 使用预设默认值 |
| 评分计算 | 正常计算 | 边界值处理（0-100） |

---

## 六.2 已知问题与改进方向

1. **公告URL内容抓取**：✅ 已解决 — 东方财富官方 API `np-cnotice-stock.eastmoney.com/api/content/ann` 集成
2. **LLM超时**：✅ 已解决 — 超时60s + 3次重试（2s/4s间隔）
3. **Python环境**：Anaconda Python需在PATH首位；调用时需设置`PYTHONIOENCODING=utf-8`避免中文乱码。

---

## 七、新增文件清单

| 文件路径 | 说明 |
|---------|------|
| `server/src/config/llm.ts` | LLM配置 |
| `server/src/config/qcc.ts` | 企查查配置 |
| `server/src/utils/stockDb.ts` | A股数据库工具 |
| `server/src/utils/companyProfile.ts` | 公司画像分析工具 |
| `server/src/utils/akshareData.ts` | AKShare数据获取工具 |
| `server/src/utils/qccDataStore.ts` | 企查查数据存储工具 |
| `server/src/utils/screeningHelper.ts` | 筛选辅助工具 |
| `server/src/utils/screeningLogger.ts` | 日志记录工具 |
| `server/data/a_stocks.db` | A股SQLite数据库 |
| `server/data/target_companies.db` | 目标公司缓存数据库 |

## 八、改造文件清单

| 文件路径 | 改动 |
|---------|------|
| `server/src/routes/buyerScreeningAgent.ts` | 重写评分算法，新增步骤4.5（公告获取&LLM并购分析） |
| `server/src/utils/akshareData.ts` | 修复PYTHONIOENCODING=utf-8，新增getAnnouncements/fetchAnnouncementContent/analyzeMAExperienceWithLLM |
| `server/src/utils/strategicScore.ts` | 新增MAAnalysisResult接口，calculateMAExperienceScore支持LLM分析结果 |
| `src/pages/BuyerMatchInputPage.jsx` | 梯队展示修复，调用getScreeningAgent |

---

## 九、环境变量

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

## 十、实施计划

| Phase | 内容 | 状态 |
|-------|------|------|
| 1 | 数据层构建（SQLite、导入A股数据） | ✅ 完成 |
| 2 | 企查查集成（API对接、数据存储） | ✅ 完成 |
| 3 | LLM集成（画像分析） | ✅ 完成 |
| 4 | AKShare集成（财务数据、公告数据） | ✅ 完成 |
| 5 | 评分算法实现 | ✅ 完成 |
| 6 | 前端对接与测试 | ✅ 完成 |
| 7 | 公告URL正文抓取优化 | ✅ 完成（Eastmoney官方API） |
| 8 | LLM超时重试机制 | ✅ 完成（60s + 3次重试） |

**已完成: Phase 1-8，核心功能全部上线**
