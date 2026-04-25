/**
 * Protocol Management API Routes
 * 协议管理API - 支持协议上传、签署、状态管理
 */

import { Router } from 'express'

export const protocolRouter = Router()

// In-memory storage for demo (replace with database in production)
const protocols: Map<string, any> = new Map()

// GET /api/protocol/list - 获取协议列表
protocolRouter.get('/list', (req, res) => {
  const { transactionId, companyName } = req.query

  let result = Array.from(protocols.values())

  if (transactionId) {
    result = result.filter((p) => p.transactionId === transactionId)
  }

  if (companyName) {
    result = result.filter((p) =>
      p.companyName?.toLowerCase().includes(companyName.toString().toLowerCase())
    )
  }

  res.json({
    success: true,
    data: result,
    total: result.length,
  })
})

// POST /api/protocol/upload - 上传协议
protocolRouter.post('/upload', (req, res) => {
  const { name, type, transactionId, companyName, fileSize, signers } = req.body

  if (!name || !type) {
    return res.status(400).json({
      success: false,
      error: '缺少必填字段: name, type',
    })
  }

  const protocol = {
    id: `protocol-${Date.now()}`,
    name,
    type,
    transactionId: transactionId || 'default-tx',
    companyName: companyName || '',
    uploadTime: new Date().toISOString(),
    fileSize: fileSize || '0 KB',
    signers: signers || [],
    status: 'pending',
    signedBy: [],
  }

  protocols.set(protocol.id, protocol)

  res.json({
    success: true,
    data: protocol,
    message: '协议上传成功',
  })
})

// POST /api/protocol/sign - 签署协议
protocolRouter.post('/sign', (req, res) => {
  const { protocolId, signerInfo } = req.body

  if (!protocolId) {
    return res.status(400).json({
      success: false,
      error: '缺少协议ID',
    })
  }

  const protocol = protocols.get(protocolId)

  if (!protocol) {
    return res.status(404).json({
      success: false,
      error: '协议不存在',
    })
  }

  if (protocol.status === 'signed') {
    return res.status(400).json({
      success: false,
      error: '协议已签署',
    })
  }

  // Update protocol status
  protocol.status = 'signed'
  protocol.signedTime = new Date().toISOString()
  protocol.signedBy = protocol.signedBy || []
  protocol.signedBy.push(signerInfo || { signer: '收购方', signTime: new Date().toISOString() })

  protocols.set(protocolId, protocol)

  res.json({
    success: true,
    data: protocol,
    message: '签署成功',
  })
})

// DELETE /api/protocol/:id - 删除协议
protocolRouter.delete('/:id', (req, res) => {
  const { id } = req.params

  const protocol = protocols.get(id)

  if (!protocol) {
    return res.status(404).json({
      success: false,
      error: '协议不存在',
    })
  }

  if (protocol.status === 'signed') {
    return res.status(400).json({
      success: false,
      error: '已签署的协议无法删除',
    })
  }

  protocols.delete(id)

  res.json({
    success: true,
    message: '删除成功',
  })
})

// GET /api/protocol/:id - 获取协议详情
protocolRouter.get('/:id', (req, res) => {
  const { id } = req.params

  const protocol = protocols.get(id)

  if (!protocol) {
    return res.status(404).json({
      success: false,
      error: '协议不存在',
    })
  }

  res.json({
    success: true,
    data: protocol,
  })
})