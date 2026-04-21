---
name: project-buyer-matching-bug
description: AI交易买家匹配模块的bug修复 + LLM公告并购分析实现（完整链路已验证）
type: project
---

## 项目背景

M&A AI 平台（MA-AI），用于并购交易的买家匹配场景。

## 买家匹配模块修复与增强记录（2026-04-20/21）

### 已完成的修复（全部完成 ✅）

1. **前端梯队展示**：buyerTiers硬编码 → TIER_CONFIGS + buildTiersFromCandidates
   - 文件：`src/pages/BuyerMatchInputPage.jsx`
   - 调用 `api.getScreeningAgent()` 而非 `api.screenBuyers()`

2. **AKShare Python环境**：
   - 安装：`"D:/ProgramFiles/Anaconda/python.exe" -m pip install akshare`
   - 编码修复：`PYTHONIOENCODING: 'utf-8'`
   - 文件：`server/src/utils/akshareData.ts`

3. **LLM公告并购分析**（核心新功能）：
   - `getAnnouncements` — 改用位置索引修复列名编码问题
   - `fetchAnnouncementContent` — 使用 Eastmoney 官方 API: `https://np-cnotice-stock.eastmoney.com/api/content/ann?art_code={id}&client_source=web`
   - `analyzeMAExperienceWithLLM` — 将公告正文发给 LLM，判断真实并购（收购方视角）
   - `MA_KEYWORDS` — `['并购', '收购', '资产重组', '定增', '股权转让', '战略投资', '重大资产', '吸收合并', '发行股份购买']`

4. **LLM超时与重试**：
   - 超时：30s → 60s
   - 重试：最多3次，指数退避（2s, 4s）
   - 文件：`companyProfile.ts` + `akshareData.ts`

5. **战略评分集成**：
   - `calculateStrategicAlignmentScore` 接收 `maAnalysis?: MAAnalysisResult`
   - LLM分析：count≥3→100分，≥1→70分，=0→30分

### 完整调用链路（已验证可用）

```
① analyzeCompanyProfile (LLM) → 公司画像关键词
② searchStocks → 本地SQLite候选
③ getFinancialData + getAnnouncements → AKShare数据
④ fetchAnnouncementContent → Eastmoney API公告正文
⑤ analyzeMAExperienceWithLLM → LLM判断真实并购
⑥ calculateStrategicAlignmentScore → 战略评分
⑦ assignGrade → S/A/B/C/D
```

### 验证结果

- `920753.BJ 天纺标`：`"天纺标于2024年1月完成对天津市乳品食品监测中心有限公司100%股权的现金收购"` — LLM正确识别真实并购
- `通鼎互联`：`"3次近3年并购"` — 并购经验丰富被正确识别

### Python环境

- Python: `D:\ProgramFiles\Anaconda\python.exe`（在PATH首位）
- akshare: 1.18.56 已安装
- Node.js调用Python时设置：`PYTHONIOENCODING: 'utf-8'`

### 修改的文件

| 文件 | 改动 |
|------|------|
| `src/pages/BuyerMatchInputPage.jsx` | 前端梯队展示 |
| `server/src/routes/buyerScreeningAgent.ts` | 新增步骤4.5 |
| `server/src/utils/akshareData.ts` | 公告API + LLM超时+重试 |
| `server/src/utils/strategicScore.ts` | LLM并购分析集成 |
| `server/src/utils/companyProfile.ts` | LLM超时+重试 |
