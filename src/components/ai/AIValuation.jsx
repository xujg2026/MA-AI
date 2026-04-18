import { useState } from 'react'
import { dcfTemplate } from '../../data/mockData'
import { Card, Button, Input, Badge } from '../ui'
import {
  Calculator,
  TrendingUp,
  Building,
  PieChart,
  Info,
  GitCompare,
  BarChart3,
  Target,
  ArrowDownUp,
} from 'lucide-react'

export default function AIValuation({ onComplete }) {
  const [method, setMethod] = useState('dcf')
  const [formData, setFormData] = useState({
    revenue: 10,
    growthRate: dcfTemplate.revenueGrowthRate,
    operatingMargin: dcfTemplate.operatingMargin,
    discountRate: dcfTemplate.discountRate,
    terminalGrowthRate: dcfTemplate.terminalGrowthRate,
    years: dcfTemplate.years,
    comparablePE: 15,
    comparablePB: 1.5,
    totalAssets: 50,
    totalLiabilities: 30,
    netProfit: 2,
    netAssets: 20,
    // Comparable transaction data
    comparableTransactions: [
      { name: 'A公司收购B公司', multiple: 12.5, date: '2024-01' },
      { name: 'C公司收购D公司', multiple: 10.2, date: '2024-03' },
      { name: 'E公司收购F公司', multiple: 14.8, date: '2024-06' },
    ],
  })
  const [result, setResult] = useState(null)
  const [showSensitivity, setShowSensitivity] = useState(false)

  const calculateDCF = () => {
    const { revenue, growthRate, operatingMargin, discountRate, terminalGrowthRate, years } = formData

    const cashFlows = []
    let currentRevenue = revenue

    for (let i = 1; i <= years; i++) {
      currentRevenue = currentRevenue * (1 + growthRate / 100)
      const operatingProfit = currentRevenue * (operatingMargin / 100)
      const freeCashFlow = operatingProfit * 0.8
      cashFlows.push({
        year: i,
        revenue: currentRevenue.toFixed(2),
        fcf: freeCashFlow.toFixed(2),
      })
    }

    const lastFCF = cashFlows[cashFlows.length - 1].fcf
    const terminalValue = (lastFCF * (1 + terminalGrowthRate / 100)) / ((discountRate - terminalGrowthRate) / 100)

    let pvSum = 0
    cashFlows.forEach((cf, i) => {
      const pv = cf.fcf / Math.pow(1 + discountRate / 100, i + 1)
      cashFlows[i].pv = pv.toFixed(2)
      pvSum += parseFloat(pv)
    })

    const terminalPV = terminalValue / Math.pow(1 + discountRate / 100, years)
    const enterpriseValue = pvSum + terminalPV

    // Sensitivity analysis
    const sensitivityTable = []
    const discountRates = [discountRate - 2, discountRate, discountRate + 2]
    const growthRates = [terminalGrowthRate - 1, terminalGrowthRate, terminalGrowthRate + 1]

    for (const dr of discountRates) {
      const row = []
      for (const gr of growthRates) {
        if (dr > gr) {
          const tv = (lastFCF * (1 + gr / 100)) / ((dr - gr) / 100)
          const tpv = tv / Math.pow(1 + dr / 100, years)
          const ev = pvSum + tpv
          row.push(ev.toFixed(2))
        } else {
          row.push('N/A')
        }
      }
      sensitivityTable.push({ discountRate: dr, values: row })
    }

    return {
      type: 'DCF估值',
      cashFlows,
      terminalValue: terminalValue.toFixed(2),
      terminalPV: terminalPV.toFixed(2),
      enterpriseValue: enterpriseValue.toFixed(2),
      pvSum: pvSum.toFixed(2),
      valuationRange: [(enterpriseValue * 0.85).toFixed(2), (enterpriseValue * 1.15).toFixed(2)],
      sensitivityTable,
      assumptions: {
        revenueGrowthRate: growthRate,
        operatingMargin,
        discountRate,
        terminalGrowthRate,
        years,
      },
    }
  }

  const calculateComparable = () => {
    const { revenue, comparablePE, comparablePB, comparableTransactions, netProfit, netAssets } = formData
    const peValue = netProfit * comparablePE
    const pbValue = netAssets * comparablePB

    // Calculate average multiple from comparable transactions
    const avgMultiple = comparableTransactions.reduce((sum, t) => sum + t.multiple, 0) / comparableTransactions.length
    const transactionValue = revenue * avgMultiple

    return {
      type: '可比公司法',
      peValue: peValue.toFixed(2),
      pbValue: pbValue.toFixed(2),
      transactionValue: transactionValue.toFixed(2),
      avgMultiple: avgMultiple.toFixed(1),
      netProfit: netProfit.toFixed(2),
      netAssets: netAssets.toFixed(2),
      averageValue: ((peValue + pbValue + transactionValue) / 3).toFixed(2),
      valuationRange: [(transactionValue * 0.8).toFixed(2), (transactionValue * 1.2).toFixed(2)],
      comparableTransactions,
    }
  }

  const calculateAsset = () => {
    const { totalAssets, totalLiabilities } = formData
    const netAssets = totalAssets - totalLiabilities

    return {
      type: '资产法',
      totalAssets: totalAssets.toFixed(2),
      totalLiabilities: totalLiabilities.toFixed(2),
      netAssets: netAssets.toFixed(2),
      adjustedValue: (netAssets * 1.2).toFixed(2),
      valuationRange: [(netAssets * 0.9).toFixed(2), (netAssets * 1.3).toFixed(2)],
    }
  }

  const handleCalculate = () => {
    let res
    switch (method) {
      case 'dcf':
        res = calculateDCF()
        break
      case 'comparable':
        res = calculateComparable()
        break
      case 'asset':
        res = calculateAsset()
        break
      default:
        res = calculateDCF()
    }
    setResult(res)
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  const methodButtons = [
    { id: 'dcf', label: 'DCF估值', icon: TrendingUp, desc: '现金流折现' },
    { id: 'comparable', label: '可比公司法', icon: PieChart, desc: '市场乘数' },
    { id: 'asset', label: '资产法', icon: Building, desc: '净资产' },
  ]

  return (
    <div className="space-y-6">
      {/* Method Selection */}
      <Card padding="md">
        <div className="grid grid-cols-3 gap-4">
          {methodButtons.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`relative p-4 rounded-xl font-medium transition-all duration-300 ${
                method === m.id
                  ? 'bg-primary text-white shadow-soft-lg'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <m.icon size={24} className="mx-auto mb-1" />
              <span className="block text-sm font-semibold">{m.label}</span>
              <span className={`text-xs ${method === m.id ? 'text-white/70' : 'text-gray-400'}`}>
                {m.desc}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card padding="lg">
          <Card.Title className="flex items-center mb-6">
            <Calculator size={20} className="mr-2 text-primary" />
            输入参数
          </Card.Title>

          {method === 'dcf' && (
            <div className="space-y-4">
              <Input
                label="当前年收入（亿元）"
                type="number"
                value={formData.revenue}
                onChange={(e) => handleInputChange('revenue', e.target.value)}
              />
              <Input
                label="预期增长率（%）"
                type="number"
                value={formData.growthRate}
                onChange={(e) => handleInputChange('growthRate', e.target.value)}
              />
              <Input
                label="营业利润率（%）"
                type="number"
                value={formData.operatingMargin}
                onChange={(e) => handleInputChange('operatingMargin', e.target.value)}
              />
              <Input
                label="折现率（%）"
                type="number"
                value={formData.discountRate}
                onChange={(e) => handleInputChange('discountRate', e.target.value)}
              />
              <Input
                label="永续增长率（%）"
                type="number"
                value={formData.terminalGrowthRate}
                onChange={(e) => handleInputChange('terminalGrowthRate', e.target.value)}
              />
              <Input
                label="预测年限"
                type="number"
                value={formData.years}
                onChange={(e) => handleInputChange('years', e.target.value)}
              />
            </div>
          )}

          {method === 'comparable' && (
            <div className="space-y-4">
              <Input
                label="目标公司净利润（亿元）"
                type="number"
                value={formData.netProfit}
                onChange={(e) => handleInputChange('netProfit', e.target.value)}
              />
              <Input
                label="目标公司净资产（亿元）"
                type="number"
                value={formData.netAssets}
                onChange={(e) => handleInputChange('netAssets', e.target.value)}
              />
              <Input
                label="可比公司PE倍数"
                type="number"
                value={formData.comparablePE}
                onChange={(e) => handleInputChange('comparablePE', e.target.value)}
              />
              <Input
                label="可比公司PB倍数"
                type="number"
                value={formData.comparablePB}
                onChange={(e) => handleInputChange('comparablePB', e.target.value)}
              />

              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">近期可比交易</p>
                <div className="space-y-2">
                  {formData.comparableTransactions.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                      <span className="text-gray-600">{tx.name}</span>
                      <Badge variant="primary">{tx.multiple}x</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {method === 'asset' && (
            <div className="space-y-4">
              <Input
                label="总资产（亿元）"
                type="number"
                value={formData.totalAssets}
                onChange={(e) => handleInputChange('totalAssets', e.target.value)}
              />
              <Input
                label="总负债（亿元）"
                type="number"
                value={formData.totalLiabilities}
                onChange={(e) => handleInputChange('totalLiabilities', e.target.value)}
              />
            </div>
          )}

          <Button
            variant="primary"
            className="w-full mt-6"
            icon={Calculator}
            onClick={handleCalculate}
          >
            开始估值计算
          </Button>
        </Card>

        {/* Results */}
        <Card padding="lg">
          <Card.Title className="flex items-center justify-between mb-6">
            <span>估值结果</span>
            {result && (
              <Badge variant="primary" className="flex items-center space-x-1">
                <Target size={14} />
                <span>AI估值</span>
              </Badge>
            )}
          </Card.Title>

          {result ? (
            <div className="space-y-4">
              {result.type === 'DCF估值' && (
                <>
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
                    <Badge variant="primary" className="mb-2">DCF估值</Badge>
                    <p className="text-3xl font-bold text-primary">
                      ¥{result.enterpriseValue}亿
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      合理区间: ¥{result.valuationRange[0]}亿 ~ ¥{result.valuationRange[1]}亿
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left rounded-tl-lg">年份</th>
                          <th className="px-3 py-2 text-right">收入</th>
                          <th className="px-3 py-2 text-right">FCF</th>
                          <th className="px-3 py-2 text-right rounded-tr-lg">现值</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {result.cashFlows.map((cf) => (
                          <tr key={cf.year} className="hover:bg-gray-50">
                            <td className="px-3 py-2">第{cf.year}年</td>
                            <td className="px-3 py-2 text-right">¥{cf.revenue}</td>
                            <td className="px-3 py-2 text-right">¥{cf.fcf}</td>
                            <td className="px-3 py-2 text-right text-primary font-medium">¥{cf.pv}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">现金流现值合计</p>
                      <p className="font-bold text-lg">¥{result.pvSum}亿</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">终值</p>
                      <p className="font-bold text-lg">¥{result.terminalValue}亿</p>
                    </div>
                  </div>

                  {/* Sensitivity Analysis */}
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setShowSensitivity(!showSensitivity)}
                      className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3"
                    >
                      <BarChart3 size={16} />
                      <span>敏感性分析</span>
                      <ArrowDownUp size={14} className={showSensitivity ? 'rotate-180' : ''} />
                    </button>
                    {showSensitivity && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-2 py-1 text-left">折现率 \ 永续增长率</th>
                              <th className="px-2 py-1 text-right">-1%</th>
                              <th className="px-2 py-1 text-right">基准</th>
                              <th className="px-2 py-1 text-right">+1%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.sensitivityTable.map((row, i) => (
                              <tr key={i}>
                                <td className="px-2 py-1">{row.discountRate}%</td>
                                {row.values.map((v, j) => (
                                  <td key={j} className="px-2 py-1 text-right text-primary">{v}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}

              {result.type === '可比公司法' && (
                <>
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
                    <Badge variant="primary" className="mb-2">可比公司法</Badge>
                    <p className="text-3xl font-bold text-primary">
                      ¥{result.averageValue}亿
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      合理区间: ¥{result.valuationRange[0]}亿 ~ ¥{result.valuationRange[1]}亿
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <Badge variant="info" className="mb-2">基于PE</Badge>
                      <p className="font-bold text-lg text-blue-700">¥{result.peValue}亿</p>
                      <p className="text-xs text-gray-500 mt-1">
                        净利润 ¥{result.netProfit}亿 × {formData.comparablePE}倍
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl">
                      <Badge variant="success" className="mb-2">基于PB</Badge>
                      <p className="font-bold text-lg text-green-700">¥{result.pbValue}亿</p>
                      <p className="text-xs text-gray-500 mt-1">
                        净资产 ¥{result.netAssets}亿 × {formData.comparablePB}倍
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <Badge variant="primary" className="mb-2">可比交易</Badge>
                      <p className="font-bold text-lg text-purple-700">¥{result.transactionValue}亿</p>
                      <p className="text-xs text-gray-500 mt-1">
                        平均倍数 {result.avgMultiple}x
                      </p>
                    </div>
                  </div>
                </>
              )}

              {result.type === '资产法' && (
                <>
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
                    <Badge variant="primary" className="mb-2">资产法</Badge>
                    <p className="text-3xl font-bold text-primary">
                      ¥{result.adjustedValue}亿
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      合理区间: ¥{result.valuationRange[0]}亿 ~ ¥{result.valuationRange[1]}亿
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">总资产</p>
                      <p className="font-bold text-lg">¥{result.totalAssets}亿</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">总负债</p>
                      <p className="font-bold text-lg">¥{result.totalLiabilities}亿</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                      <p className="text-xs text-gray-500">净资产</p>
                      <p className="font-bold text-lg">¥{result.netAssets}亿</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-start space-x-2 p-4 bg-yellow-50 rounded-xl">
                <Info size={18} className="text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  本估值结果仅供参考，实际交易价格受多种因素影响，建议结合专业机构意见综合判断。
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calculator size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-500">填写参数后点击计算</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
