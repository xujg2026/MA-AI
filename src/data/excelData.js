// Excel导入数据存储
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Excel列名映射配置
export const columnMappings = {
  company: ['公司名称', '公司名', '名称', 'company'],
  title: ['项目标题', '标题', 'title'],
  amount: ['交易金额', '金额', 'amount'],
  valuation: ['估值', '估值（亿元）', 'valuation'],
  industry: ['行业', '行业分类', 'industry'],
  sector: ['细分领域', 'sector'],
  region: ['地域', '地区', 'region'],
  stage: ['交易阶段', '阶段', 'stage'],
  description: ['项目描述', '描述', 'description'],
  highlights: ['亮点', 'highlights'],
  type: ['类型', 'type', '卖方/买方'],
}

// 标准行业选项
export const standardIndustries = [
  '科技',
  '医疗健康',
  '金融服务',
  '制造业',
  '零售消费',
  '能源环保',
  '教育培训',
  '媒体娱乐',
  '物流运输',
  '房地产',
  '其他',
]

// 标准地域选项
export const standardRegions = [
  '华北地区',
  '华东地区',
  '华南地区',
  '华中地区',
  '西南地区',
  '西北地区',
  '东北地区',
  '港澳台',
  '海外',
  '全国',
]

// 标准交易阶段
export const standardStages = [
  { value: '意向', label: '意向阶段' },
  { value: '尽调', label: '尽职调查' },
  { value: '谈判', label: '谈判阶段' },
  { value: '交割', label: '交割中' },
  { value: '完成', label: '已完成' },
]

// 标准化数据类型
export function normalizeRecord(record) {
  // 查找匹配的列名
  const findValue = (fieldName) => {
    const mappings = columnMappings[fieldName]
    for (const key of Object.keys(record)) {
      const normalizedKey = key.trim().toLowerCase()
      for (const mapping of mappings) {
        if (normalizedKey === mapping.toLowerCase()) {
          return record[key]
        }
      }
    }
    return null
  }

  const industry = findValue('industry') || '其他'
  const region = findValue('region') || '全国'

  return {
    id: `excel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    company: findValue('company') || '未知公司',
    title: findValue('title') || findValue('company') || '未命名项目',
    amount: findValue('amount') || '待定',
    valuation: parseFloat(findValue('valuation')) || 0,
    industry: standardIndustries.includes(industry) ? industry : '其他',
    sector: findValue('sector') || '',
    region: standardRegions.includes(region) ? region : '全国',
    stage: findValue('stage') || '意向',
    description: findValue('description') || '',
    highlights: findValue('highlights')?.split(/[,，、]/).filter(Boolean) || [],
    type: findValue('type')?.toLowerCase().includes('买') ? 'buy' : 'sell',
    date: new Date().toISOString().split('T')[0],
    status: '进行中',
    matchScore: 0,
    isImported: true,
  }
}

const useExcelDataStore = create(
  persist(
    (set, get) => ({
      // 导入的交易数据
      importedDeals: [],

      // 导入历史
      importHistory: [],

      // 添加导入的数据
      addImportedDeals: (deals) =>
        set((state) => ({
          importedDeals: [...state.importedDeals, ...deals],
          importHistory: [
            {
              id: Date.now(),
              date: new Date().toISOString(),
              count: deals.length,
              filename: deals[0]?._filename || '未知文件',
            },
            ...state.importHistory.slice(0, 9),
          ],
        })),

      // 清空导入数据
      clearImportedDeals: () => set({ importedDeals: [] }),

      // 删除单条导入数据
      removeImportedDeal: (id) =>
        set((state) => ({
          importedDeals: state.importedDeals.filter((d) => d.id !== id),
        })),

      // 获取所有数据（mock + 导入）
      getAllDeals: (mockDeals) => {
        const { importedDeals } = get()
        return [...mockDeals, ...importedDeals]
      },

      // 获取导入统计数据
      getImportStats: () => {
        const { importedDeals, importHistory } = get()
        return {
          totalImported: importedDeals.length,
          totalFiles: importHistory.length,
          recentImports: importHistory.slice(0, 5),
        }
      },
    }),
    {
      name: 'excel-m&a-storage',
    }
  )
)

export default useExcelDataStore
