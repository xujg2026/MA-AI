import { useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import {
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Download,
  Trash2,
  RefreshCw,
  Building2,
  List,
  Loader2,
} from 'lucide-react'
import {
  columnMappings,
  normalizeRecord,
} from '../../data/excelData'
import useExcelDataStore from '../../data/excelData'
import { Card, Button, Badge, Select } from '../ui'
import { getApi } from '../../services/api'

export default function ExcelImporter({ onImportComplete, onProjectsCreated }) {
  const [file, setFile] = useState(null)
  const [rawData, setRawData] = useState([])
  const [headers, setHeaders] = useState([])
  const [columnMap, setColumnMap] = useState({})
  const [step, setStep] = useState('upload')
  const [errors, setErrors] = useState([])
  const [importing, setImporting] = useState(false)

  // 新增：创建项目相关状态
  const [importedRecords, setImportedRecords] = useState([])
  const [selectedRecords, setSelectedRecords] = useState({})
  const [creatingProjects, setCreatingProjects] = useState(false)
  const [createResult, setCreateResult] = useState(null)

  const { addImportedDeals, importHistory, clearImportedDeals } = useExcelDataStore()

  const handleFileUpload = useCallback((e) => {
    const uploadedFile = e.target.files[0]
    if (!uploadedFile) return

    if (
      !uploadedFile.name.endsWith('.xlsx') &&
      !uploadedFile.name.endsWith('.xls')
    ) {
      setErrors(['请上传 Excel 文件 (.xlsx 或 .xls)'])
      return
    }

    setFile(uploadedFile)
    setErrors([])

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (jsonData.length < 2) {
          setErrors(['Excel 文件至少需要包含标题行和数据行'])
          return
        }

        const fileHeaders = jsonData[0].map((h) => String(h || ''))
        const rows = jsonData.slice(1).filter((row) => row.some((cell) => cell))

        setHeaders(fileHeaders)
        setRawData(rows)
        autoMapColumns(fileHeaders)
        setStep('mapping')
      } catch (err) {
        setErrors(['文件解析失败: ' + err.message])
      }
    }
    reader.readAsArrayBuffer(uploadedFile)
  }, [])

  const autoMapColumns = (fileHeaders) => {
    const mapping = {}

    Object.entries(columnMappings).forEach(([field, possibleNames]) => {
      for (const header of fileHeaders) {
        const normalizedHeader = header.trim().toLowerCase()
        for (const name of possibleNames) {
          if (normalizedHeader === name.toLowerCase()) {
            mapping[field] = header
            break
          }
        }
        if (mapping[field]) break
      }
    })

    setColumnMap(mapping)
  }

  const handleColumnMapChange = (field, header) => {
    setColumnMap((prev) => ({ ...prev, [field]: header }))
  }

  const getPreviewData = () => {
    if (rawData.length === 0 || headers.length === 0) return []

    const headerIndexMap = {}
    headers.forEach((h, i) => {
      headerIndexMap[h] = i
    })

    return rawData.slice(0, 10).map((row) => {
      const record = {}
      Object.entries(columnMap).forEach(([field, header]) => {
        if (header && headerIndexMap[header] !== undefined) {
          record[field] = row[headerIndexMap[header]]
        }
      })
      return normalizeRecord({ ...record, _filename: file?.name })
    })
  }

  const handleImport = () => {
    setImporting(true)
    setErrors([])

    try {
      const headerIndexMap = {}
      headers.forEach((h, i) => {
        headerIndexMap[h] = i
      })

      const allRecords = rawData
        .map((row) => {
          const record = {}
          Object.entries(columnMap).forEach(([field, header]) => {
            if (header && headerIndexMap[header] !== undefined) {
              record[field] = row[headerIndexMap[header]]
            }
          })
          return normalizeRecord({ ...record, _filename: file?.name })
        })
        .filter((record) => record.company && record.company !== '未知公司')

      if (allRecords.length === 0) {
        setErrors(['没有找到有效的数据记录'])
        setImporting(false)
        return
      }

      // 保存导入的记录，初始化选中状态（全选）
      const initialSelected = {}
      allRecords.forEach((record) => {
        initialSelected[record.id] = true
      })
      setImportedRecords(allRecords)
      setSelectedRecords(initialSelected)

      addImportedDeals(allRecords)
      setStep('complete')

      if (onImportComplete) {
        onImportComplete(allRecords)
      }
    } catch (err) {
      setErrors(['导入失败: ' + err.message])
    }

    setImporting(false)
  }

  const handleReset = () => {
    setFile(null)
    setRawData([])
    setHeaders([])
    setColumnMap({})
    setStep('upload')
    setErrors([])
    setImportedRecords([])
    setSelectedRecords({})
    setCreateResult(null)
  }

  // 切换记录选中状态
  const toggleRecordSelection = (recordId) => {
    setSelectedRecords((prev) => ({
      ...prev,
      [recordId]: !prev[recordId],
    }))
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (Object.values(selectedRecords).every((v) => v)) {
      // 全部取消选中
      const noneSelected = {}
      importedRecords.forEach((r) => {
        noneSelected[r.id] = false
      })
      setSelectedRecords(noneSelected)
    } else {
      // 全部选中
      const allSelected = {}
      importedRecords.forEach((r) => {
        allSelected[r.id] = true
      })
      setSelectedRecords(allSelected)
    }
  }

  // 创建选中的项目
  const handleCreateProjects = async () => {
    const selectedRecordsList = importedRecords.filter((r) => selectedRecords[r.id])

    if (selectedRecordsList.length === 0) {
      setErrors(['请至少选择一条记录创建项目'])
      return
    }

    setCreatingProjects(true)
    setErrors([])

    try {
      const api = getApi()
      const result = await api.post('/imports/sync', { records: selectedRecordsList })

      if (result.success) {
        setCreateResult({
          success: true,
          importedCount: result.data.importedCount,
          failedCount: result.data.failedCount,
          projects: result.data.projects,
        })
        setStep('projects-created')
        if (onProjectsCreated) {
          onProjectsCreated(result.data)
        }
      } else {
        setErrors([result.error || '创建项目失败'])
      }
    } catch (err) {
      setErrors(['创建项目失败: ' + err.message])
    }

    setCreatingProjects(false)
  }

  // 跳转到项目列表
  const goToProjectList = () => {
    window.location.href = '/projects'
  }

  // 跳转到项目详情
  const goToProjectDetail = (projectId) => {
    window.location.href = `/projects/${projectId}`
  }

  const downloadTemplate = () => {
    const templateData = [
      {
        公司名称: '示例公司A',
        项目标题: 'XX行业龙头企业出售',
        交易金额: '¥10亿',
        '估值（亿元）': 10,
        行业: '科技',
        细分领域: '软件服务',
        地域: '华东地区',
        交易阶段: '尽调',
        项目描述: '公司是一家专注于XX领域的领先企业...',
        亮点: '核心技术专利10项,年收入5亿元,团队规模300+',
        类型: '卖方',
      },
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '项目数据')
    XLSX.writeFile(wb, 'M&A项目导入模板.xlsx')
  }

  const requiredFields = ['company', 'industry', 'valuation']

  return (
    <Card padding="lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-50 rounded-xl">
            <FileSpreadsheet className="text-green-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">导入Excel数据</h2>
            <p className="text-sm text-gray-500">上传Excel文件批量导入项目数据</p>
          </div>
        </div>
        {step !== 'upload' && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RefreshCw size={16} className="mr-1" />
            重新上传
          </Button>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start space-x-2">
            <AlertCircle className="text-red-500 mt-0.5" size={18} />
            <div>
              {errors.map((err, i) => (
                <p key={i} className="text-sm text-red-700">
                  {err}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50/50"
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-lg font-medium text-gray-700 mb-2">
              点击或拖拽文件到此区域
            </p>
            <p className="text-sm text-gray-500">支持 .xlsx, .xls 格式</p>
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" onClick={downloadTemplate}>
              <Download size={18} className="mr-2" />
              下载导入模板
            </Button>
          </div>

          {/* Import History */}
          {importHistory.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-700 mb-3">最近导入记录</h3>
              <div className="space-y-2">
                {importHistory.slice(0, 5).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <FileSpreadsheet size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-700">{record.filename}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-500">
                        {new Date(record.date).toLocaleDateString('zh-CN')}
                      </span>
                      <Badge variant="success">{record.count}条</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={clearImportedDeals} className="mt-3 text-red-500">
                <Trash2 size={14} className="mr-1" />
                清空所有导入数据
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {step === 'mapping' && (
        <div className="space-y-6">
          <Badge variant="info" className="p-3">
            已检测到 <strong>{rawData.length}</strong> 条数据记录，请为每个字段选择对应的Excel列
          </Badge>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(columnMappings).map(([field, possibleNames]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {requiredFields.includes(field) && (
                    <span className="text-red-500 ml-1">*必填</span>
                  )}
                </label>
                <select
                  value={columnMap[field] || ''}
                  onChange={(e) => handleColumnMapChange(field, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50/50"
                >
                  <option value="">-- 不映射 --</option>
                  {headers.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={() => setStep('upload')}>
              返回
            </Button>
            <Button
              variant="primary"
              onClick={() => setStep('preview')}
              disabled={!columnMap.company}
            >
              预览数据
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          <Badge variant="success" className="p-3">
            预览前10条数据，请确认数据映射正确后再进行导入
          </Badge>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">公司名称</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">行业</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">估值(亿)</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">地域</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">阶段</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">类型</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {getPreviewData().map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{record.company}</td>
                    <td className="px-4 py-2">{record.industry}</td>
                    <td className="px-4 py-2">{record.valuation}</td>
                    <td className="px-4 py-2">{record.region}</td>
                    <td className="px-4 py-2">{record.stage}</td>
                    <td className="px-4 py-2">
                      <Badge variant={record.type === 'sell' ? 'info' : 'success'}>
                        {record.type === 'sell' ? '卖方' : '买方'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rawData.length > 10 && (
            <p className="text-sm text-gray-500 text-center">
              还有 {rawData.length - 10} 条数据未显示...
            </p>
          )}

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={() => setStep('mapping')}>
              返回修改
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? (
                <>
                  <RefreshCw size={16} className="animate-spin mr-2" />
                  导入中...
                </>
              ) : (
                <>
                  <Check size={16} className="mr-2" />
                  确认导入 {rawData.length} 条
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 'complete' && (
        <div className="space-y-6">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">导入成功！</h3>
            <p className="text-gray-600">
              成功导入 <strong>{rawData.length}</strong> 条项目数据
            </p>
          </div>

          {/* 选择创建项目 */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Building2 size={20} className="text-primary" />
                <h4 className="font-medium text-gray-900">创建项目</h4>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Object.values(selectedRecords).every((v) => v)}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className="text-sm text-gray-600">全选</span>
              </label>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
              {importedRecords.map((record) => (
                <div
                  key={record.id}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedRecords[record.id]
                      ? 'bg-primary/5 border border-primary/20'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => toggleRecordSelection(record.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedRecords[record.id] || false}
                    onChange={() => toggleRecordSelection(record.id)}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {record.company}
                    </p>
                    <p className="text-xs text-gray-500">
                      {record.industry} | {record.region} | 估值{record.valuation}亿
                    </p>
                  </div>
                  <Badge variant={record.type === 'sell' ? 'info' : 'success'}>
                    {record.type === 'sell' ? '卖方' : '买方'}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                已选择 <strong>{Object.values(selectedRecords).filter((v) => v).length}</strong> 条
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateProjects}
                disabled={creatingProjects || Object.values(selectedRecords).every((v) => !v)}
              >
                {creatingProjects ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Building2 size={16} className="mr-2" />
                    创建项目
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={handleReset}>
              继续导入
            </Button>
            <Button variant="ghost" onClick={goToProjectList}>
              <List size={16} className="mr-2" />
              查看项目列表
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Projects Created */}
      {step === 'projects-created' && createResult && (
        <div className="space-y-6">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">项目创建成功！</h3>
            <p className="text-gray-600">
              成功创建 <strong>{createResult.importedCount}</strong> 个项目
              {createResult.failedCount > 0 && (
                <span className="text-red-500 ml-2">失败 {createResult.failedCount} 个</span>
              )}
            </p>
          </div>

          {/* 创建的项目列表 */}
          <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
            {createResult.projects.slice(0, 5).map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => goToProjectDetail(project.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {project.company_name || project.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {project.industry} | {project.region}
                  </p>
                </div>
                <Badge variant="success">已创建</Badge>
              </div>
            ))}
            {createResult.projects.length > 5 && (
              <div className="p-2 text-center text-sm text-gray-500">
                还有 {createResult.projects.length - 5} 个项目...
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={handleReset}>
              继续导入
            </Button>
            <Button variant="primary" onClick={goToProjectList}>
              <List size={16} className="mr-2" />
              查看项目列表
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
