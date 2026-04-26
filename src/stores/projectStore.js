/**
 * 项目状态管理 (Zustand Store)
 * M&A项目管理模块前端状态管理
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getApi } from '../services/api'

const useProjectStore = create(
  persist(
    (set, get) => ({
      // ========== State ==========
      // 项目列表
      projects: [],
      // 当前项目
      currentProject: null,
      // 加载状态
      loading: false,
      // 错误信息
      error: null,
      // 筛选状态 (null表示全部)
      filterStatus: null,

      // ========== Actions ==========

      /**
       * 获取项目列表
       * GET /api/projects
       */
      fetchProjects: async (params = {}) => {
        set({ loading: true, error: null })
        try {
          const api = getApi()
          const response = await api.get('/projects', params)
          if (response.success !== false) {
            // API返回 {data: {items: [...], pagination: {...}}}
            const items = response.data?.items || response.data || []
            set({ projects: items, loading: false })
          } else {
            set({ error: response.error || '获取项目列表失败', loading: false })
          }
        } catch (error) {
          set({ error: error.message || '网络请求失败', loading: false })
        }
      },

      /**
       * 获取单个项目详情
       * GET /api/projects/:id
       */
      fetchProject: async (id) => {
        set({ loading: true, error: null })
        try {
          const api = getApi()
          const response = await api.get(`/projects/${id}`)
          if (response.success !== false) {
            set({ currentProject: response.data || response, loading: false })
          } else {
            set({ error: response.error || '获取项目详情失败', loading: false })
          }
        } catch (error) {
          set({ error: error.message || '网络请求失败', loading: false })
        }
      },

      /**
       * 创建项目
       * POST /api/projects
       */
      createProject: async (data) => {
        set({ loading: true, error: null })
        try {
          const api = getApi()
          const response = await api.post('/projects', data)
          if (response.success !== false) {
            const newProject = response.data || response
            set((state) => {
              try {
                const currentProjects = Array.isArray(state.projects) ? state.projects : []
                return {
                  projects: [...currentProjects, newProject],
                  currentProject: newProject,
                  loading: false,
                }
              } catch (e) {
                return { currentProject: newProject, loading: false }
              }
            })
            return newProject
          } else {
            set({ error: response.error || '创建项目失败', loading: false })
            return null
          }
        } catch (error) {
          set({ error: error.message || '网络请求失败', loading: false })
          return null
        }
      },

      /**
       * 更新项目
       * PUT /api/projects/:id
       */
      updateProject: async (id, data) => {
        set({ loading: true, error: null })
        try {
          const api = getApi()
          const response = await api.updateProject(id, data)
          if (response.success !== false) {
            const updatedProject = response.data || response
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === id ? { ...p, ...updatedProject } : p
              ),
              currentProject:
                state.currentProject?.id === id
                  ? { ...state.currentProject, ...updatedProject }
                  : state.currentProject,
              loading: false,
            }))
            return updatedProject
          } else {
            set({ error: response.error || '更新项目失败', loading: false })
            return null
          }
        } catch (error) {
          set({ error: error.message || '网络请求失败', loading: false })
          return null
        }
      },

      /**
       * 删除项目
       * DELETE /api/projects/:id
       */
      deleteProject: async (id) => {
        set({ loading: true, error: null })
        try {
          const api = getApi()
          const response = await api.request('DELETE', `/projects/${id}`)
          if (response.success !== false) {
            set((state) => ({
              projects: state.projects.filter((p) => p.id !== id),
              currentProject:
                state.currentProject?.id === id ? null : state.currentProject,
              loading: false,
            }))
            return true
          } else {
            set({ error: response.error || '删除项目失败', loading: false })
            return false
          }
        } catch (error) {
          set({ error: error.message || '网络请求失败', loading: false })
          return false
        }
      },

      /**
       * 设置筛选状态
       */
      setFilterStatus: (status) => {
        set({ filterStatus: status })
      },

      /**
       * 清除错误信息
       */
      clearError: () => {
        set({ error: null })
      },

      /**
       * 设置当前项目
       */
      setCurrentProject: (project) => {
        set({ currentProject: project })
      },

      // ========== Selectors ==========

      /**
       * 根据筛选状态获取过滤后的项目列表
       */
      getFilteredProjects: () => {
        const { projects, filterStatus } = get()
        if (!filterStatus) {
          return projects
        }
        return projects.filter((project) => project.status === filterStatus)
      },
    }),
    {
      name: 'ma-projects-storage',
    }
  )
)

export default useProjectStore
