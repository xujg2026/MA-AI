import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ExcelImporter from '../components/ai/ExcelImporter'
import useExcelDataStore from '../data/excelData'
import { mockDeals } from '../data/mockData'
import { FileSpreadsheet, Table, Trash2, ArrowRight, Database, Sparkles, Upload, List } from 'lucide-react'
import { Card, Badge, Button } from '../components/ui'

export default function DataManagementPage() {
  const [showImporter, setShowImporter] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const navigate = useNavigate()
  const { importedDeals, removeImportedDeal, clearImportedDeals, getImportStats } =
    useExcelDataStore()
  const stats = getImportStats()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleImportComplete = (newDeals) => {
    setShowImporter(false)
  }

  const handleViewDeals = () => {
    navigate('/ai-finder')
  }

  const statCards = [
    { label: '已导入项目', value: stats.totalImported, icon: Database, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50' },
    { label: '导入文件数', value: stats.totalFiles, icon: FileSpreadsheet, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50' },
    { label: '示例数据', value: mockDeals.length, icon: Table, color: 'from-purple-500 to-violet-500', bgColor: 'bg-purple-50' },
    { label: '可用项目总数', value: mockDeals.length + stats.totalImported, icon: Sparkles, color: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-50' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Badge variant="primary" className="mb-4 inline-flex items-center gap-2">
            <Database size={14} />
            <span>数据管理中心</span>
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            高效管理<span className="gradient-text">项目数据</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            支持Excel批量导入，灵活管理项目信息
          </p>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {statCards.map((stat, index) => (
            <Card key={stat.label} padding="lg" className="relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={26} className="text-gray-700" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className={`flex justify-center mb-8 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex bg-white rounded-2xl shadow-soft p-2">
            <button
              onClick={() => setShowImporter(true)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                showImporter
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Upload size={20} />
              导入数据
            </button>
            <button
              onClick={() => setShowImporter(false)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                !showImporter
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List size={20} />
              已导入数据 ({importedDeals.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {showImporter ? (
            <ExcelImporter onImportComplete={handleImportComplete} />
          ) : (
            <Card padding="none" className="overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl font-bold text-gray-900">已导入项目列表</h2>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={clearImportedDeals} className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 size={16} className="mr-2" />
                    清空
                  </Button>
                  <Button variant="primary" onClick={handleViewDeals}>
                    <ArrowRight size={16} className="mr-2" />
                    AI匹配
                  </Button>
                </div>
              </div>

              {importedDeals.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gray-100 rounded-full blur-2xl" />
                    <div className="relative w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <FileSpreadsheet size={40} className="text-gray-400" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-lg mb-4">暂无导入数据</p>
                  <Button variant="primary" onClick={() => setShowImporter(true)}>
                    <Upload size={16} className="mr-2" />
                    去导入
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">公司名称</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">行业</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">估值(亿)</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">地域</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">阶段</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">类型</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {importedDeals.map((deal) => (
                        <tr key={deal.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900">{deal.company}</p>
                              <p className="text-xs text-gray-500">{deal.title}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="primary">{deal.industry}</Badge>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-700">{deal.valuation}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{deal.region}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{deal.stage}</td>
                          <td className="px-6 py-4">
                            <Badge variant={deal.type === 'sell' ? 'primary' : 'success'}>
                              {deal.type === 'sell' ? '卖方' : '买方'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImportedDeal(deal.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
