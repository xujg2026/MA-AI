# AI 觅售 TIC 企业数据集成实现计划

**日期**: 2026-05-16
**状态**: 进行中
**关联设计**: `docs/plans/2026-05-16-tic-companies-design.md`

---

## 阶段 1：后端实现

### Task 1.1: 创建 TIC 企业数据库表结构

**文件**: `server/src/utils/ticCompanyDb.ts`

**内容**:
- 创建 `tic_companies` 表，映射 Excel 字段
- 表结构：

```sql
CREATE TABLE tic_companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT UNIQUE NOT NULL,
  business_status TEXT,
  legal_representative TEXT,
  registered_capital TEXT,
  registered_capital_currency TEXT,
  establishment_date TEXT,
  approval_date TEXT,
  province TEXT,
  city TEXT,
  county TEXT,
  township TEXT,
  credit_code TEXT,
  phone TEXT,
  email TEXT,
  employee_count INTEGER,
  company_type TEXT,
  organization_form TEXT,
  industry_category TEXT,
  industry_major TEXT,
  industry_middle TEXT,
  industry_minor TEXT,
  website TEXT,
  registered_address TEXT,
  mailing_address TEXT,
  is_listed TEXT,
  -- 风险字段
  dishonest_status TEXT,
 被执行_status TEXT,
  high_consumer_status TEXT,
  judicial_freeze_status TEXT,
  bankruptcy_restructuring_status TEXT,
  financial_penalty_status TEXT,
  serious_violation_status TEXT,
  business_exception_status TEXT,
  tax_violation_status TEXT,
  abnormal_status TEXT,
  -- 扩展信息
  business_scope TEXT,
  source_file TEXT,
  imported_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tic_company_name ON tic_companies(company_name);
CREATE INDEX idx_tic_company_industry ON tic_companies(industry_category);
CREATE INDEX idx_tic_company_province ON tic_companies(province);
CREATE INDEX idx_tic_company_city ON tic_companies(city);
CREATE INDEX idx_tic_company_business_scope ON tic_companies(business_scope);
```

**验证**: 运行测试脚本，验证表创建成功

---

### Task 1.2: 创建 TIC 企业数据初始化脚本

**文件**: `server/src/scripts/initTicCompaniesDb.ts`

**内容**:
- 读取 `Source/TIC company info .xlsx`
- 解析 Excel 行转换为数据库记录
- 批量插入数据库（每 1000 条一提交）
- 支持 `--force` 参数强制重新导入
- 启动时检查并自动导入

**关键代码**:
```typescript
// 字段映射
const FIELD_MAP = {
  '企业名称': 'company_name',
  '经营状态': 'business_status',
  '法定代表人': 'legal_representative',
  '注册资本': 'registered_capital',
  '注册资本币种': 'registered_capital_currency',
  '成立日期': 'establishment_date',
  '核准日期': 'approval_date',
  '所属省': 'province',
  '所属市': 'city',
  '所属区/县': 'county',
  '所属乡镇/街道': 'township',
  '统一社会信用代码': 'credit_code',
  '联系电话': 'phone',
  '邮箱': 'email',
  '参保人数(人)': 'employee_count',
  '企业类型': 'company_type',
  '组织形式': 'organization_form',
  '国标行业门类': 'industry_category',
  '国标行业大类': 'industry_major',
  '国标行业中类': 'industry_middle',
  '国标行业小类': 'industry_minor',
  '网址': 'website',
  '注册地址': 'registered_address',
  '通信地址': 'mailing_address',
  '是否上市': 'is_listed',
  // 风险字段
  '失信被执行人': 'dishonest_status',
  '被执行人': '被执行_status',
  '限制高消费': 'high_consumer_status',
  '司法冻结': 'judicial_freeze_status',
  '破产重整': 'bankruptcy_restructuring_status',
  '金融监管处罚': 'financial_penalty_status',
  '严重违法': 'serious_violation_status',
  '经营异常': 'business_exception_status',
  '重大税收违法': 'tax_violation_status',
  '非正常户': 'abnormal_status',
  '经营范围': 'business_scope',
}
```

**验证**: 运行脚本，确认 55,574 条数据导入成功

---

### Task 1.3: 创建 TIC 企业查询 API

**文件**: `server/src/routes/ticCompanies.ts`

**路由**: `GET /api/tic-companies`

**查询参数**:
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

**返回结构**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "company_name": "济南澜济生物医药科技有限公司",
        "business_status": "在营",
        "legal_representative": "闫树堂",
        "registered_capital": "200万",
        "establishment_date": "2026-05-12",
        "province": "山东",
        "city": "济南",
        "county": null,
        "industry_category": "科学研究和技术服务业",
        "company_type": "民营企业",
        "employee_count": null,
        "phone": null,
        "website": null,
        "credit_code": "91370100MAKDGK7F4W",
        "business_scope": "一般项目：医学研究和试验发展..."
      }
    ],
    "total": 55574,
    "page": 1,
    "pageSize": 20,
    "totalPages": 2779
  }
}
```

**验证**: Postman 测试各筛选条件组合

---

### Task 1.4: 挂载路由到 index.ts

**文件**: `server/src/index.ts`

**内容**:
- 导入 `ticCompaniesRouter`
- 挂载到 `/api/tic-companies`

---

## 阶段 2：前端实现

### Task 2.1: 创建 TIC 企业查询 API Service

**文件**: `src/services/api.js`

**新增方法**:
```javascript
// TIC 企业查询
async getTicCompanies(params) {
  const query = new URLSearchParams(params).toString()
  return this.get(`/tic-companies?${query}`)
}
```

**验证**: 测试 `getTicCompanies({ keyword: '济南', page: 1 })`

---

### Task 2.2: 重构 AIFinderPage 筛选表单

**文件**: `src/pages/AIFinderPage.jsx`

**修改内容**:
1. 删除不支持的筛选字段（TIC资质、融资、风险、变更记录、联系人）
2. 保留 6 个基础筛选字段
3. 新增 4 个筛选字段

**保留字段**:
- 行业（行业门类下拉）
- 关键字搜索
- 企业性质
- 社保缴纳人数
- 注册资本
- 成立日期

**新增字段**:
- 联系电话（下拉：有/无）
- 网址（下拉：有/无）
- 经营范围（文本输入，模糊搜索）
- 地区（三级联动：省-市-区县）

**删除字段**:
- hasCMA, hasCNAS, certCount, labArea, mainTestingArea, customerIndustry
- hasFinancing, financingDate, investor, financingAmount
- riskLevel, changeRecords, contactPerson, contactMethod

**地区三级联动实现**:
```javascript
// 初始加载省份列表
// 选择省份后加载城市列表
// 选择城市后加载区县列表
// 选择区县后触发搜索
```

**验证**: 页面加载正常，表单字段正确

---

### Task 2.3: 改造搜索逻辑连接真实 API

**文件**: `src/pages/AIFinderPage.jsx`

**修改内容**:
1. `handleSearch` 函数改为调用 `getTicCompanies API`
2. 支持分页、筛选参数传递
3. 显示加载状态

**前端筛选 → API 参数映射**:
```javascript
const apiParams = {
  keyword: formData.keyword,
  industry: formData.industry,
  companyType: formData.companyType,
  province: formData.province,
  city: formData.city,
  county: formData.county,
  employeeCountMin: parseEmployeeCountMin(formData.socialSecurity),
  employeeCountMax: parseEmployeeCountMax(formData.socialSecurity),
  registeredCapitalMin: formData.registeredCapital,
  establishmentDateFrom: formData.establishmentDate,
  hasPhone: formData.hasPhone, // 有/无
  hasWebsite: formData.hasWebsite, // 有/无
  businessScope: formData.businessScope, // 模糊搜索
  page: 1,
  pageSize: 20,
}
```

**验证**: 搜索结果正确显示

---

### Task 2.4: 改造企业卡片展示真实数据

**文件**: `src/pages/AIFinderPage.jsx`

**卡片展示字段**:
- 企业名称
- 法定代表人
- 经营状态
- 注册资本
- 成立日期
- 行业（国标行业门类）
- 地区（省-市-区县）
- 参保人数
- 统一社会信用代码
- 联系电话
- 网址
- 经营范围（截断显示，最多100字符）
- 风险状态标签（失信被执行人、被执行人、限制高消费、司法冻结、经营异常）

**风险标签**（静态展示，不做筛选）:
- 失信被执行人
- 被执行人
- 限制高消费
- 司法冻结
- 经营异常

**验证**: 卡片显示真实数据

---

### Task 2.5: 实现"查看详情"跳转企查查

**文件**: `src/pages/AIFinderPage.jsx`

**修改内容**:
```javascript
const handleViewDetails = (companyName) => {
  const url = `https://www.qcc.com/web/search?key=${encodeURIComponent(companyName)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
```

**按钮绑定**:
```jsx
<Button variant="ghost" size="sm" onClick={() => handleViewDetails(deal.company_name)}>
  查看详情 <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
</Button>
```

**验证**: 点击"查看详情"新标签页打开企查查

---

### Task 2.6: 验证"加入项目"功能

**文件**: `src/pages/AIFinderPage.jsx`

**说明**: 现有 ProjectSelector 已支持 deal 对象传入，确认兼容

**验证**: 点击"加入项目"能正确打开项目选择器

---

## 阶段 3：自检查

### Checklist

- [ ] 后端路由 `/api/tic-companies` 已挂载
- [ ] API service `getTicCompanies` 方法已添加
- [ ] 前端筛选表单字段与数据源匹配
- [ ] 企业卡片显示真实数据字段
- [ ] "查看详情"按钮跳转企查查
- [ ] "加入项目"按钮功能正常
- [ ] 数据库初始化脚本可独立运行
- [ ] 分页功能正常
- [ ] 地区三级联动功能正常
- [ ] 联系电话/网址筛选功能正常
- [ ] 经营范围模糊搜索功能正常

---

## 阶段 4：执行模式

**选择**: Subagent-driven execution

**流程**:
1. Task 1.1-1.4 → 后端 subagent
2. Task 2.1-2.6 → 前端 subagent
3. 自检查 → 主会话验证