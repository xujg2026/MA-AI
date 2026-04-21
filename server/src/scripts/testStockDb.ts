/**
 * 测试stockDb工具
 */

import { testConnection, searchStocks, getStockByCode, getTotalCount, getValidCount, searchStocksByName } from '../utils/stockDb'

console.log('=== StockDb 测试 ===')

// 测试连接
console.log('\n1. 测试数据库连接...')
const connected = testConnection()
console.log('连接结果:', connected ? '成功' : '失败')

// 获取统计
console.log('\n2. 数据库统计...')
console.log('总股票数:', getTotalCount())
console.log('有效股票数(非ST):', getValidCount())

// 测试搜索
console.log('\n3. 测试关键词搜索(检测)...')
const results1 = searchStocks(['检测', '认证'], 10)
console.log(`找到 ${results1.length} 个结果`)
results1.slice(0, 3).forEach((s, i) => {
  console.log(`  ${i + 1}. [${s.code}] ${s.name} (匹配分数: ${s.match_score})`)
})

// 测试搜索
console.log('\n4. 测试关键词搜索(汽车)...')
const results2 = searchStocks(['汽车', '制造'], 10)
console.log(`找到 ${results2.length} 个结果`)
results2.slice(0, 3).forEach((s, i) => {
  console.log(`  ${i + 1}. [${s.code}] ${s.name} (匹配分数: ${s.match_score})`)
})

// 测试按名称搜索
console.log('\n5. 测试按名称搜索(华测)...')
const results3 = searchStocksByName('华测')
console.log(`找到 ${results3.length} 个结果`)
results3.forEach((s, i) => {
  console.log(`  ${i + 1}. [${s.code}] ${s.name}`)
})

// 测试按代码获取
console.log('\n6. 测试按代码获取(300012)...')
const stock = getStockByCode('300012.SZ')
if (stock) {
  console.log(`[${stock.code}] ${stock.name}`)
  console.log('主营业务:', stock.main_business)
  console.log('主营产品:', stock.main_products)
} else {
  console.log('未找到该股票')
}

console.log('\n=== 测试完成 ===')
