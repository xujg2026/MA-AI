/**
 * 测试cncaCache工具
 */

import { getCncaCache, setCncaCache, deleteCncaCache, clearExpiredCncaCache, clearAllCncaCache, getCncaCacheStats, testConnection, generateCacheKey } from '../utils/cncaCache'

console.log('=== CncaCache 测试 ===')

// 测试连接
console.log('\n1. 测试数据库连接...')
const connected = testConnection()
console.log('连接结果:', connected ? '成功' : '失败')

// 测试generateCacheKey
console.log('\n2. 测试generateCacheKey...')
const key1 = generateCacheKey('测试公司', '91110000123456789X')
console.log('Key with creditCode:', key1)
const key2 = generateCacheKey('测试公司', null)
console.log('Key without creditCode:', key2)

// 测试setCncaCache和getCncaCache
console.log('\n3. 测试设置和获取缓存...')

const testCompany = '华测检测认证股份有限公司'
const testCreditCode = '91440300770858586'

const testResult = {
  hasCertification: true,
  certNo: 'CNCA-R-2019-001',
  instCode: '0109',
  orgCode: '69418352-4',
  detailUrl: 'https://cx.cnca.cn/12345',
  cachedAt: new Date().toISOString()
}

console.log('设置缓存...')
const setResult = setCncaCache(testCompany, testCreditCode, testResult)
console.log('设置结果:', setResult ? '成功' : '失败')

console.log('\n获取缓存...')
const cached = getCncaCache(testCompany, testCreditCode)
if (cached) {
  console.log('缓存命中!')
  console.log('  hasCertification:', cached.hasCertification)
  console.log('  certNo:', cached.certNo)
  console.log('  instCode:', cached.instCode)
  console.log('  orgCode:', cached.orgCode)
  console.log('  detailUrl:', cached.detailUrl)
  console.log('  cachedAt:', cached.cachedAt)
} else {
  console.log('缓存未命中')
}

// 测试不存在的缓存
console.log('\n4. 测试不存在的缓存...')
const notExist = getCncaCache('不存在的公司', '123456789')
console.log('不存在的缓存:', notExist === null ? 'null (正确)' : '有值(错误)')

// 测试删除缓存
console.log('\n5. 测试删除缓存...')
const deleteResult = deleteCncaCache(testCompany, testCreditCode)
console.log('删除结果:', deleteResult ? '成功' : '失败')

// 验证删除后缓存不存在
const afterDelete = getCncaCache(testCompany, testCreditCode)
console.log('删除后获取缓存:', afterDelete === null ? 'null (正确)' : '有值(错误)')

// 测试缓存过期（使用短TTL）
console.log('\n6. 测试缓存过期...')
const shortTtlResult = {
  hasCertification: true,
  certNo: 'CNCA-R-2019-002',
  instCode: '0109',
  orgCode: '69418352-5',
  detailUrl: 'https://cx.cnca.cn/12346',
  cachedAt: new Date().toISOString()
}

// 设置1秒过期的缓存
setCncaCache('短期缓存公司', '123456789', shortTtlResult, 1 / 3600) // 1秒 = 1/3600小时

// 立即获取应该存在
const shortCache = getCncaCache('短期缓存公司', '123456789')
console.log('短期缓存(立即获取):', shortCache !== null ? '存在 (正确)' : 'null (错误)')

// 等待2秒后获取应该不存在
console.log('等待2秒...')
setTimeout(() => {
  const expiredCache = getCncaCache('短期缓存公司', '123456789')
  console.log('短期缓存(2秒后获取):', expiredCache === null ? 'null (正确-已过期)' : '存在 (错误-未过期)')
}, 2000)

// 测试clearExpiredCncaCache
console.log('\n7. 测试清除过期缓存...')

// 先设置一些正常缓存
setCncaCache('公司A', '111', { hasCertification: true, certNo: 'A1', instCode: '01', orgCode: '001', detailUrl: null, cachedAt: new Date().toISOString() }, 24)
setCncaCache('公司B', '222', { hasCertification: false, certNo: null, instCode: null, orgCode: null, detailUrl: null, cachedAt: new Date().toISOString() }, 24)

// 获取统计
const statsBefore = getCncaCacheStats()
console.log('清除前统计:', statsBefore)

// 清除过期
const cleared = clearExpiredCncaCache()
console.log('清除过期缓存数量:', cleared)

// 获取统计
const statsAfter = getCncaCacheStats()
console.log('清除后统计:', statsAfter)

// 测试clearAllCncaCache
console.log('\n8. 测试清除所有缓存...')
const allCleared = clearAllCncaCache()
console.log('清除所有缓存数量:', allCleared)

const statsFinal = getCncaCacheStats()
console.log('最终统计:', statsFinal)

console.log('\n=== 测试完成 ===')