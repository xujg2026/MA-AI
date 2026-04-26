import { useState, useRef, useEffect } from 'react'
import {
  FileSignature,
  Upload,
  FileText,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Download,
  Eye,
  Loader2,
} from 'lucide-react'
import { Card, Button, Badge } from '../ui'
import { getApi } from '../../services/api'

const PROTOCOL_TYPES = [
  {
    key: 'ts',
    label: '投资意向书',
    desc: 'Term Sheet',
    icon: '📋',
    description: '投资条款清单，通常在尽职调查前签署',
  },
  {
    key: 'nda',
    label: '保密协议',
    desc: 'Non-Disclosure Agreement',
    icon: '🔒',
    description: '尽职调查前双方保密义务协议',
  },
  {
    key: 'other',
    label: '其他',
    desc: 'Other Documents',
    icon: '📄',
    description: '其他并购相关协议或文件',
  },
]

export default function AIProtocolSigning({ projectId, onComplete }) {
  const [protocols, setProtocols] = useState([])
  const [selectedType, setSelectedType] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)

  // 加载已有的协议数据
  useEffect(() => {
    if (!projectId) return

    // 切换项目时先清空旧数据
    setProtocols([])

    const loadPhaseData = async () => {
      try {
        console.log('[Protocol] Loading phase data for project:', projectId)
        const api = getApi()
        const response = await api.getProjectPhases(projectId)
        console.log('[Protocol] Load response:', response)
        if (response.success !== false && response.data) {
          const protocolPhase = response.data.find(p => p.phase === 'protocol')
          console.log('[Protocol] Found protocol phase:', protocolPhase)
          if (protocolPhase && protocolPhase.output_data) {
            const outputData = typeof protocolPhase.output_data === 'string'
              ? JSON.parse(protocolPhase.output_data)
              : protocolPhase.output_data
            console.log('[Protocol] Parsed outputData:', outputData)
            if (outputData.protocols && Array.isArray(outputData.protocols)) {
              setProtocols(outputData.protocols)
            }
          }
        }
      } catch (error) {
        console.error('加载协议数据失败:', error)
      }
    }

    loadPhaseData()
  }, [projectId])

  // 保存阶段数据到项目
  const savePhaseData = async (outputData) => {
    if (!projectId) {
      console.error('[Protocol] savePhaseData: projectId is missing')
      return
    }
    try {
      console.log('[Protocol] Saving phase data for project:', projectId, outputData)
      const api = getApi()
      const result = await api.saveProjectPhase(projectId, 'protocol', outputData)
      console.log('[Protocol] Save result:', result)
    } catch (error) {
      console.error('保存协议签署阶段数据失败:', error)
    }
  }

  const handleTypeSelect = (typeKey) => {
    setSelectedType(typeKey)
    setShowUploadModal(true)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedType) return

    setIsUploading(true)

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newProtocol = {
      id: `protocol-${Date.now()}`,
      name: selectedFile.name,
      type: selectedType,
      uploadTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-'),
      signers: ['收购方-A'],
      status: 'pending',
      fileSize: `${(selectedFile.size / 1024).toFixed(0)} KB`,
    }

    // 使用函数式更新获取最新状态
    const updatedProtocols = [newProtocol, ...protocols]

    // 立即保存到后端
    const outputData = {
      completedAt: new Date().toISOString(),
      protocols: updatedProtocols.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        status: p.status,
        signers: p.signers,
        uploadTime: p.uploadTime,
        fileSize: p.fileSize,
      })),
    }
    setProtocols(updatedProtocols)
    savePhaseData(outputData)

    setIsUploading(false)
    setShowUploadModal(false)
    setSelectedType(null)
    setSelectedFile(null)
  }

  const handleSign = async (protocolId) => {
    // 先更新为 signing 状态
    setProtocols((prev) =>
      prev.map((p) =>
        p.id === protocolId ? { ...p, status: 'signing' } : p
      )
    )

    // Simulate signing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 更新为 signed 状态并保存
    const updatedProtocols = protocols.map((p) =>
      p.id === protocolId ? { ...p, status: 'signed' } : p
    )

    // 保存阶段数据
    const outputData = {
      completedAt: new Date().toISOString(),
      protocols: updatedProtocols.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        status: p.status,
        signers: p.signers,
        uploadTime: p.uploadTime,
        fileSize: p.fileSize,
      })),
    }
    setProtocols(updatedProtocols)
    savePhaseData(outputData)

    // 检查是否全部签署完成
    const allSigned = updatedProtocols.every((p) => p.status === 'signed')
    if (allSigned && onComplete) {
      onComplete()
    }
  }

  const handleDelete = (protocolId) => {
    const updatedProtocols = protocols.filter((p) => p.id !== protocolId)
    setProtocols(updatedProtocols)

    // 同步删除到后端
    const outputData = {
      protocols: updatedProtocols.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        status: p.status,
        signers: p.signers,
        uploadTime: p.uploadTime,
        fileSize: p.fileSize,
      })),
    }
    savePhaseData(outputData)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'signed':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle size={12} />
            已签署
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock size={12} />
            待签署
          </Badge>
        )
      case 'signing':
        return (
          <Badge variant="info" className="flex items-center gap-1">
            <Loader2 size={12} className="animate-spin" />
            签署中...
          </Badge>
        )
      default:
        return null
    }
  }

  const getTypeLabel = (typeKey) => {
    return PROTOCOL_TYPES.find((t) => t.key === typeKey)?.label || typeKey
  }

  const getTypeIcon = (typeKey) => {
    return PROTOCOL_TYPES.find((t) => t.key === typeKey)?.icon || '📄'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">协议管理</h3>
          <p className="text-gray-500 text-sm mt-1">
            上传并签署并购相关协议
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            已签署: {protocols.filter((p) => p.status === 'signed').length} / {protocols.length}
          </span>
        </div>
      </div>

      {/* Protocol Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PROTOCOL_TYPES.map((type) => (
          <Card
            key={type.key}
            padding="md"
            className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
            onClick={() => handleTypeSelect(type.key)}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">{type.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{type.label}</h4>
                <p className="text-xs text-gray-400 mb-2">{type.desc}</p>
                <p className="text-sm text-gray-500">{type.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Protocol List */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-700">已上传协议</h4>

        {protocols.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="py-8">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无已上传的协议</p>
              <p className="text-gray-400 text-sm mt-1">
                请从上方选择协议类型开始上传
              </p>
            </div>
          </Card>
        ) : (
          protocols.map((protocol) => (
            <Card key={protocol.id} padding="md" className="hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                  {getTypeIcon(protocol.type)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-gray-900 truncate">
                      {protocol.name}
                    </h5>
                    {getStatusBadge(protocol.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <span>{getTypeLabel(protocol.type)}</span>
                    </span>
                    <span>{protocol.uploadTime}</span>
                    <span>{protocol.fileSize}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Shield size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-400">
                      签署方: {protocol.signers.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {protocol.status === 'pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSign(protocol.id)}
                    >
                      <FileSignature size={14} className="mr-1" />
                      签署
                    </Button>
                  )}
                  {protocol.status === 'signed' && (
                    <Button variant="ghost" size="sm">
                      <Eye size={14} className="mr-1" />
                      查看
                    </Button>
                  )}
                  {protocol.status === 'signing' && (
                    <Button variant="ghost" size="sm" disabled>
                      <Loader2 size={14} className="mr-1 animate-spin" />
                      签署中
                    </Button>
                  )}
                  {protocol.status !== 'signed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(protocol.id)}
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card padding="lg" className="w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">上传协议</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setSelectedType(null)
                  setSelectedFile(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Selected Type */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {PROTOCOL_TYPES.find((t) => t.key === selectedType)?.icon}
                </span>
                <div>
                  <p className="font-medium text-gray-900">
                    {PROTOCOL_TYPES.find((t) => t.key === selectedType)?.label}
                  </p>
                  <p className="text-sm text-gray-500">
                    {PROTOCOL_TYPES.find((t) => t.key === selectedType)?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer mb-6"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={24} className="text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={32} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">点击选择文件</p>
                  <p className="text-sm text-gray-400">
                    支持 PDF, DOC, DOCX 格式
                  </p>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setShowUploadModal(false)
                  setSelectedType(null)
                  setSelectedFile(null)
                }}
              >
                取消
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    上传中...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    上传
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Signing Complete Banner */}
      {protocols.length > 0 && protocols.every((p) => p.status === 'signed') && (
        <Card padding="md" className="bg-green-50 border border-green-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-800">所有协议已签署完成</h4>
              <p className="text-sm text-green-600">
                协议已全部签署，可进入下一阶段：尽职调查
              </p>
            </div>
            <Button variant="primary" onClick={onComplete}>
              继续尽职调查
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}