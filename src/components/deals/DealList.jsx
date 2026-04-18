import { useState } from 'react'
import { mockDeals } from '../../data/mockData'
import useExcelDataStore from '../../data/excelData'
import { Heart, Filter, Grid, List, Search } from 'lucide-react'
import { Card, Button, Input, Badge } from '../ui'

export default function DealList() {
  const [viewMode, setViewMode] = useState('grid')
  const [favorites, setFavorites] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')

  const importedDeals = useExcelDataStore((state) => state.importedDeals)
  const allDeals = [...mockDeals, ...importedDeals]

  const industries = [...new Set(allDeals.map((d) => d.industry))]
  const regions = [...new Set(allDeals.map((d) => d.region))]

  const filteredDeals = allDeals.filter((deal) => {
    const matchesSearch =
      !searchTerm ||
      deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = !industryFilter || deal.industry === industryFilter
    const matchesRegion = !regionFilter || deal.region === regionFilter
    return matchesSearch && matchesIndustry && matchesRegion
  })

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="搜索公司或项目..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-gray-50/50"
            />
          </div>

          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-gray-50/50"
          >
            <option value="">全部行业</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-gray-50/50"
          >
            <option value="">全部地域</option>
            {regions.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-2 border border-gray-200 rounded-xl p-1 bg-gray-50/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          共找到 <span className="font-semibold text-primary">{filteredDeals.length}</span> 个项目
        </p>
        {importedDeals.length > 0 && (
          <Badge variant="success">含 {importedDeals.length} 条导入数据</Badge>
        )}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => (
            <Card key={deal.id} padding="md" hover className="transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{deal.company}</h3>
                  <p className="text-sm text-gray-500">{deal.title}</p>
                </div>
                <button onClick={() => toggleFavorite(deal.id)} className="p-1">
                  <Heart
                    size={20}
                    className={favorites.includes(deal.id) ? 'text-red-500 fill-current' : 'text-gray-300'}
                  />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">估值</span>
                  <span className="font-semibold text-primary">{deal.amount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">行业</span>
                  <span className="text-gray-700">{deal.industry}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">地域</span>
                  <span className="text-gray-700">{deal.region}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">阶段</span>
                  <Badge variant="info" className="text-xs">{deal.stage}</Badge>
                </div>
              </div>

              {deal.highlights && deal.highlights.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 mb-2">项目亮点</p>
                  <div className="flex flex-wrap gap-1">
                    {deal.highlights.slice(0, 2).map((h, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {deal.isImported && (
                <Badge variant="success" className="mt-2">导入数据</Badge>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card padding="none">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">公司</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">估值</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">行业</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">地域</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">阶段</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{deal.company}</p>
                      <p className="text-xs text-gray-500">{deal.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-primary font-semibold">{deal.amount}</td>
                  <td className="px-6 py-4 text-gray-700">{deal.industry}</td>
                  <td className="px-6 py-4 text-gray-700">{deal.region}</td>
                  <td className="px-6 py-4">
                    <Badge variant="info" className="text-xs">{deal.stage}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleFavorite(deal.id)} className="p-1">
                      <Heart
                        size={18}
                        className={favorites.includes(deal.id) ? 'text-red-500 fill-current' : 'text-gray-300'}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {filteredDeals.length === 0 && (
        <Card padding="lg" className="text-center">
          <Filter size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">没有找到匹配的项目</p>
          <p className="text-sm text-gray-400 mt-2">尝试调整筛选条件</p>
        </Card>
      )}
    </div>
  )
}
