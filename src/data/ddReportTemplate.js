// 尽调报告模板数据

export const ddReportStructure = {
  companyInfo: {
    name: '',
    legalRepresentative: '',
    registeredCapital: '',
    establishmentDate: '',
    address: '',
    businessScope: '',
  },

  sections: [
    {
      id: 'executive-summary',
      title: '摘要',
      items: [
        { id: 'company-profile', label: '企业概况', content: '' },
        { id: 'business-intro', label: '业务简介', content: '' },
        { id: 'financial-summary', label: '财务简况', content: '' },
        { id: 'ipo-status', label: '上市动态', content: '' },
        { id: 'investment-plan', label: '投资方案', content: '' },
        { id: 'investment-return', label: '投资收益', content: '' },
        { id: 'investment-value', label: '投资价值', content: '' },
        { id: 'investment-risk', label: '投资风险', content: '' },
      ],
    },
    {
      id: 'company-basics',
      title: '1 公司基本情况',
      items: [
        { id: 'company-overview', label: '1.1 公司概况', content: '' },
        { id: 'history', label: '1.2 历史沿革', content: '' },
        { id: 'equity-structure', label: '1.2.1 股权结构图', content: '' },
        { id: 'establishment', label: '1.2.2 公司设立', content: '' },
        { id: 'changes', label: '1.2.3 历次变更', content: '' },
        { id: 'controlling-shareholder', label: '1.2.4 控股股东', content: '' },
        { id: 'actual-controller', label: '1.2.5 实际控制人', content: '' },
        { id: 'related-parties', label: '1.2.6 关联方', content: '' },
        { id: 'history-summary', label: '1.2.7 小结', content: '' },
      ],
    },
    {
      id: 'main-business',
      title: '2 主营业务',
      items: [
        { id: 'main-business-intro', label: '2.1 主营业务简介和定位', content: '' },
        { id: 'products-services', label: '2.2 产品和服务构成', content: '' },
        { id: 'business-model', label: '2.3 业务模式和组织体系', content: '' },
        { id: 'sales-model', label: '2.4 销售模式', content: '' },
        { id: 'production-model', label: '2.5 生产模式', content: '' },
        { id: 'procurement-model', label: '2.6 采购模式', content: '' },
        { id: 'tech-rd', label: '2.7 技术研发', content: '' },
        { id: 'business-summary', label: '2.8 小结', content: '' },
      ],
    },
    {
      id: 'industry-analysis',
      title: '3 行业分析',
      items: [
        { id: 'industry-definition', label: '3.1 行业界定', content: '' },
        { id: 'industry-overview', label: '3.2 行业概况', content: '' },
        { id: 'competition-elements', label: '3.3.1 行业核心竞争要素', content: '' },
        { id: 'competition-status', label: '3.3.2 行业竞争态势', content: '' },
        { id: 'competition-pattern', label: '3.3.3 行业竞争格局', content: '' },
        { id: 'core-advantages', label: '3.4 企业核心竞争优势', content: '' },
        { id: 'five-forces', label: '3.5 五力分析', content: '' },
        { id: 'laws-regulations', label: '3.6 法律法规与行业政策', content: '' },
      ],
    },
    {
      id: 'governance',
      title: '4 公司治理与管理',
      items: [
        { id: 'org-structure', label: '4.1 公司架构与管理制度', content: '' },
        { id: 'controller-detail', label: '4.2 实际控制人', content: '' },
        { id: 'management-team', label: '4.3 公司人员情况和管理层情况', content: '' },
        { id: 'governance-summary', label: '4.4 小结', content: '' },
      ],
    },
    {
      id: 'financial',
      title: '5 公司财务情况',
      items: [
        { id: 'financial-overview', label: '5.1 公司简介及合并范围', content: '' },
        { id: 'audit-related', label: '5.2 审计相关', content: '' },
        { id: 'financial-features', label: '5.3 环境、行业竞争关系及战略与财务数据特征', content: '' },
        { id: 'financial-status', label: '5.4 财务及核算状况', content: '' },
        { id: 'dd-items', label: '5.5 尽职调查主要事项及财务与业务融合', content: '' },
        { id: 'financial-analysis', label: '5.6 主要报表项目说明及分析', content: '' },
        { id: 'competitor-comparison', label: '5.7 同行业竞争对手比较分析', content: '' },
        { id: 'financial-summary', label: '5.8 小结', content: '' },
      ],
    },
    {
      id: 'growth',
      title: '6 增长路径及盈利预测',
      items: [
        { id: 'swot', label: '6.1 SWOT分析', content: '' },
        { id: 'development-goals', label: '6.2 发展目标和侧重点', content: '' },
        { id: 'existing-growth', label: '6.3 现有产品的增长路径', content: '' },
        { id: 'new-product-growth', label: '6.4 新产品的增长路径', content: '' },
        { id: 'profit-forecast', label: '6.5 盈利预测', content: '' },
        { id: 'future-outlook', label: '6.6 未来展望', content: '' },
      ],
    },
    {
      id: 'investment-analysis',
      title: '7 投资收益分析及建议',
      items: [
        { id: 'private-placement', label: '7.1 私募安排', content: '' },
        { id: 'ipo-feasibility', label: '7.2 上市可行性分析', content: '' },
        { id: 'investment-scheme', label: '7.3 投资方案', content: '' },
        { id: 'return-calculation', label: '7.3.2 投资收益测算', content: '' },
        { id: 'risk-warning', label: '7.4 风险提示', content: '' },
        { id: 'value-analysis', label: '7.5 价值分析', content: '' },
        { id: 'conclusion', label: '7.6 结论与投资建议', content: '' },
      ],
    },
    {
      id: 'value-added',
      title: '8 所需要的增值服务内容及安排',
      items: [
        { id: 'internal-services', label: '8.1 同系团队可亲自完成的事项与工作', content: '' },
        { id: 'external-services', label: '8.2 同系帮助协调外界力量完成的事项与工作', content: '' },
      ],
    },
    {
      id: 'appendix',
      title: '9 附件',
      items: [
        { id: 'dd-progress', label: '9.1 尽职调查情况', content: '' },
        { id: 'interview-arrangement', label: '9.2 尽调访谈安排', content: '' },
        { id: 'dd-materials', label: '9.3 尽调资料清单', content: '' },
      ],
    },
  ],
}

// 生成示例报告数据
export function generateSampleReportData(companyName) {
  return {
    companyInfo: {
      name: companyName || 'XX有限公司',
      legalRepresentative: '张三',
      registeredCapital: '5000',
      establishmentDate: '2015年6月',
      address: '上海市浦东新区XX路XX号',
      businessScope: '技术开发、技术服务、技术咨询；软件设计；计算机系统集成；销售自产产品。',
    },
    executiveSummary: {
      companyProfile: `${companyName || '目标公司'}成立于2015年，注册资本5000万元，是一家专注于XX领域的高新技术企业。实际控制人为张三先生，持股比例65%。`,
      businessIntro: `公司在XX细分市场占据主导地位，市场占有率约为15%。主要产品包括A、B、C三大系列，广泛应用于XX行业。`,
      financialSummary: `近三年收入复合增长率约25%，2025年预计实现收入3亿元，净利润4500万元。`,
      ipoStatus: `公司计划2026年申报科创板，2027年完成上市。`,
      investmentPlan: `本轮估值8亿元，相当于2025年预计净利润4500万元的17.8倍市盈率。本轮拟融资1.5亿元。`,
      investmentReturn: `预计投资周期3-5年，预期收益率年化30%以上。`,
      investmentValue: `核心价值点：技术领先、市场占有率高、管理团队经验丰富。`,
      investmentRisk: `主要风险：行业竞争加剧、技术更新迭代风险、政策变化风险。`,
    },
    reportDate: new Date().toLocaleDateString('zh-CN'),
    preparedBy: 'M&A管理咨询有限公司',
  }
}
