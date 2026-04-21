# 开发总结

**最后更新:** 2026-04-21

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
