import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import {
  createCustomItem,
  getCustomItems,
  getCustomItem,
  updateCustomItem,
  deleteCustomItem,
} from '../utils/projectDb.js'

export const ddCustomItemsRouter = Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOADS_DIR = path.join(__dirname, '../../data/uploads')

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectId = req.params.id
    const projectDir = path.join(UPLOADS_DIR, projectId)
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true })
    }
    cb(null, projectDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const ext = path.extname(file.originalname)
    // Decode URI component to handle URL-encoded Chinese filenames
    const cleanName = decodeURIComponent(file.originalname)
    cb(null, `${uniqueSuffix}_${cleanName}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
})

// 获取项目的自定义清单项
ddCustomItemsRouter.get('/:id/custom-items', (req, res) => {
  try {
    const { id } = req.params
    const { section } = req.query

    const items = getCustomItems(id, section as string | undefined)

    res.json({
      success: true,
      data: items,
    })
  } catch (error) {
    console.error('[DDCustomItems] Error getting items:', error)
    res.status(500).json({ success: false, error: 'Failed to get custom items' })
  }
})

// 创建自定义清单项
ddCustomItemsRouter.post('/:id/custom-items', (req, res) => {
  try {
    const { id: projectId } = req.params
    const { section, itemName, description } = req.body

    if (!section || !itemName) {
      res.status(400).json({ success: false, error: 'section and itemName are required' })
      return
    }

    const item = createCustomItem({
      projectId,
      section,
      itemName,
      description: description || '',
    })

    if (!item) {
      res.status(500).json({ success: false, error: 'Failed to create custom item' })
      return
    }

    res.json({ success: true, data: item })
  } catch (error) {
    console.error('[DDCustomItems] Error creating item:', error)
    res.status(500).json({ success: false, error: 'Failed to create custom item' })
  }
})

// 更新自定义清单项
ddCustomItemsRouter.put('/:id/custom-items/:itemId', (req, res) => {
  try {
    const { itemId } = req.params
    const { description, status } = req.body

    const item = updateCustomItem(itemId, { description, status })

    if (!item) {
      res.status(404).json({ success: false, error: 'Custom item not found' })
      return
    }

    res.json({ success: true, data: item })
  } catch (error) {
    console.error('[DDCustomItems] Error updating item:', error)
    res.status(500).json({ success: false, error: 'Failed to update custom item' })
  }
})

// 删除自定义清单项
ddCustomItemsRouter.delete('/:id/custom-items/:itemId', (req, res) => {
  try {
    const { itemId } = req.params

    const existing = getCustomItem(itemId)
    if (existing && existing.file_path) {
      const filePath = path.join(UPLOADS_DIR, existing.file_path)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    const deleted = deleteCustomItem(itemId)

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Custom item not found' })
      return
    }

    res.json({ success: true })
  } catch (error) {
    console.error('[DDCustomItems] Error deleting item:', error)
    res.status(500).json({ success: false, error: 'Failed to delete custom item' })
  }
})

// 上传文件到自定义清单项
ddCustomItemsRouter.post('/:id/custom-items/:itemId/upload', upload.single('file'), (req, res) => {
  try {
    const { itemId } = req.params

    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' })
      return
    }

    const relativePath = path.join(req.params.id, req.file.filename)

    const item = updateCustomItem(itemId, {
      filePath: relativePath,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    })

    if (!item) {
      fs.unlinkSync(req.file.path)
      res.status(404).json({ success: false, error: 'Custom item not found' })
      return
    }

    console.log('[DDCustomItems] File uploaded:', {
      originalName: req.file.originalname,
      savedName: item.file_name,
      path: relativePath
    })

    res.json({
      success: true,
      data: {
        file_name: req.file.originalname,
        file_path: relativePath,
        file_size: req.file.size,
      },
    })
  } catch (error) {
    console.error('[DDCustomItems] Error uploading file:', error)
    res.status(500).json({ success: false, error: 'Failed to upload file' })
  }
})

// 获取上传文件的路由（静态文件服务）
ddCustomItemsRouter.get('/:id/custom-items/:itemId/file', (req, res) => {
  try {
    const { itemId } = req.params

    const item = getCustomItem(itemId)
    if (!item || !item.file_path) {
      res.status(404).json({ success: false, error: 'File not found' })
      return
    }

    const filePath = path.join(UPLOADS_DIR, item.file_path)
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, error: 'File not found on disk' })
      return
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(item.file_name || 'download')}"`)
    res.download(filePath, encodeURIComponent(item.file_name || 'download'))
  } catch (error) {
    console.error('[DDCustomItems] Error getting file:', error)
    res.status(500).json({ success: false, error: 'Failed to get file' })
  }
})