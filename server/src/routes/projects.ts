/**
 * 项目管理路由
 *
 * M&A项目全生命周期管理API
 */

import { Router } from 'express'
import {
  createProject,
  getProject,
  listProjects,
  updateProject,
  deleteProject,
  createPhase,
  getPhases,
  updatePhase,
  ProjectFilters,
  CreateProjectParams,
  UpdateProjectParams,
  CreatePhaseParams,
  UpdatePhaseParams,
  getProjectCount,
} from '../utils/projectDb.js'

export const projectsRouter = Router()

// 生成UUID的简单函数
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * POST /api/projects
 * 创建项目
 */
projectsRouter.post('/', (req, res) => {
  try {
    const {
      name,
      status,
      industry,
      region,
      estimated_value,
      source,
      company_name,
      company_type,
      registration_capital,
      establishment_date,
      employee_count,
      sell_motivation,
      risk_level,
      change_records,
      created_by,
    } = req.body

    if (!name) {
      res.status(400).json({
        success: false,
        error: 'name is required'
      })
      return
    }

    const project = createProject({
      id: generateId(),
      name,
      status,
      industry,
      region,
      estimated_value,
      source,
      company_name,
      company_type,
      registration_capital,
      establishment_date,
      employee_count,
      sell_motivation,
      risk_level,
      change_records,
      created_by,
    })

    if (!project) {
      res.status(500).json({
        success: false,
        error: 'Failed to create project'
      })
      return
    }

    res.status(201).json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('[Projects] createProject error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /api/projects
 * 获取项目列表（支持分页、筛选）
 * Query params: page, limit, status, industry, region, keyword
 */
projectsRouter.get('/', (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      industry,
      region,
      keyword,
    } = req.query

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20))
    const offset = (pageNum - 1) * limitNum

    const filters: ProjectFilters = {}
    if (status) filters.status = status as string
    if (industry) filters.industry = industry as string
    if (region) filters.region = region as string
    if (keyword) filters.keyword = keyword as string

    const projects = listProjects(filters, limitNum, offset)
    const total = getProjectCount()

    res.json({
      success: true,
      data: {
        items: projects,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    })
  } catch (error) {
    console.error('[Projects] listProjects error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /api/projects/:id
 * 获取项目详情
 */
projectsRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const project = getProject(id)

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      })
      return
    }

    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('[Projects] getProject error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * PUT /api/projects/:id
 * 更新项目
 */
projectsRouter.put('/:id', (req, res) => {
  try {
    const { id } = req.params
    const project = getProject(id)

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      })
      return
    }

    const updateData: UpdateProjectParams = {}
    const allowedFields = [
      'name', 'status', 'industry', 'region', 'estimated_value',
      'source', 'company_name', 'company_type', 'registration_capital',
      'establishment_date', 'employee_count', 'sell_motivation',
      'risk_level', 'change_records'
    ]

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        (updateData as any)[field] = req.body[field]
      }
    }

    const updated = updateProject(id, updateData)

    if (!updated) {
      res.status(500).json({
        success: false,
        error: 'Failed to update project'
      })
      return
    }

    res.json({
      success: true,
      data: updated
    })
  } catch (error) {
    console.error('[Projects] updateProject error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * DELETE /api/projects/:id
 * 删除项目（软删除）
 */
projectsRouter.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    const project = getProject(id)

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      })
      return
    }

    const success = deleteProject(id)

    if (!success) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete project'
      })
      return
    }

    res.json({
      success: true,
      data: { message: 'Project deleted successfully' }
    })
  } catch (error) {
    console.error('[Projects] deleteProject error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * POST /api/projects/:id/phases
 * 添加或更新项目阶段
 */
projectsRouter.post('/:id/phases', (req, res) => {
  try {
    const { id } = req.params
    const project = getProject(id)

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      })
      return
    }

    const { phase, status, started_at, completed_at, output_data } = req.body

    if (!phase) {
      res.status(400).json({
        success: false,
        error: 'phase is required'
      })
      return
    }

    const phaseData = createPhase({
      id: generateId(),
      project_id: id,
      phase,
      status,
      started_at,
      completed_at,
      output_data: typeof output_data === 'string' ? output_data : JSON.stringify(output_data)
    })

    if (!phaseData) {
      res.status(500).json({
        success: false,
        error: 'Failed to create/update phase'
      })
      return
    }

    res.status(201).json({
      success: true,
      data: phaseData
    })
  } catch (error) {
    console.error('[Projects] createPhase error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * GET /api/projects/:id/phases
 * 获取项目所有阶段
 */
projectsRouter.get('/:id/phases', (req, res) => {
  try {
    const { id } = req.params
    const project = getProject(id)

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      })
      return
    }

    const phases = getPhases(id)

    res.json({
      success: true,
      data: phases
    })
  } catch (error) {
    console.error('[Projects] getPhases error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * PUT /api/projects/:id/phases/:phaseId
 * 更新阶段
 */
projectsRouter.put('/:id/phases/:phaseId', (req, res) => {
  try {
    const { id, phaseId } = req.params
    const project = getProject(id)

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      })
      return
    }

    const updateData: UpdatePhaseParams = {}
    const allowedFields = ['phase', 'status', 'started_at', 'completed_at', 'output_data']

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        (updateData as any)[field] = req.body[field]
      }
    }

    const updated = updatePhase(phaseId, updateData)

    if (!updated) {
      res.status(404).json({
        success: false,
        error: 'Phase not found'
      })
      return
    }

    res.json({
      success: true,
      data: updated
    })
  } catch (error) {
    console.error('[Projects] updatePhase error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * POST /api/projects/:id/finder-result
 * 归集觅售结果
 */
projectsRouter.post('/:id/finder-result', (req, res) => {
  try {
    const { id } = req.params
    const project = getProject(id)

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      })
      return
    }

    const { finder_results } = req.body

    if (!finder_results) {
      res.status(400).json({
        success: false,
        error: 'finder_results is required'
      })
      return
    }

    // 更新项目的change_records字段来存储觅售结果
    const existingRecords = project.change_records ? JSON.parse(project.change_records) : {}
    existingRecords.finder_results = finder_results
    existingRecords.finder_updated_at = new Date().toISOString()

    const updated = updateProject(id, {
      change_records: JSON.stringify(existingRecords)
    })

    if (!updated) {
      res.status(500).json({
        success: false,
        error: 'Failed to save finder results'
      })
      return
    }

    res.json({
      success: true,
      data: {
        message: 'Finder results saved successfully',
        finder_results
      }
    })
  } catch (error) {
    console.error('[Projects] finder-result error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
