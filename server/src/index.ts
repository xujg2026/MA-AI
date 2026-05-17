/**
 * M&A AI Platform Backend API Server
 *
 * 提供调用mx-skills Python脚本的REST API接口
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { buyerProfileRouter } from './routes/buyerProfile.js'
import { buyerScreenRouter } from './routes/buyerScreen.js'
import { buyerScreeningAgentRouter } from './routes/buyerScreeningAgent.js'
import { financialDataRouter } from './routes/financialData.js'
import { financialSearchRouter } from './routes/financialSearch.js'
import { qccRouter } from './routes/qcc.js'
import { stockDiagnosisRouter } from './routes/stockDiagnosis.js'
import { protocolRouter } from './routes/protocol.js'
import { projectsRouter } from './routes/projects.js'
import { ticCompaniesRouter } from './routes/ticCompanies.js'
import { importsRouter } from './routes/imports.js'
import { cncaCertificationRouter } from './routes/cncaCertification.js'
import { ddCustomItemsRouter } from './routes/ddCustomItems.js'
import { newsRouter } from './routes/news.js'
import { startScheduler } from './collectors/scheduler.js'
import { initializeDefaultFeeds } from './collectors/initFeeds.js'
import { runMXSkillSimple } from './utils/mxSkillRunner.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/buyer', buyerProfileRouter)
app.use('/api/buyer', buyerScreenRouter)
app.use('/api/buyer', buyerScreeningAgentRouter)
app.use('/api/financial', financialDataRouter)
app.use('/api/qcc', qccRouter)
app.use('/api/search', financialSearchRouter)
app.use('/api/diagnosis', stockDiagnosisRouter)
app.use('/api/protocol', protocolRouter)
app.use('/api/projects', ddCustomItemsRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/tic-companies', ticCompaniesRouter)
app.use('/api/imports', importsRouter)
app.use('/api/cnca-certification', cncaCertificationRouter)
app.use('/api/projects', ddCustomItemsRouter)
app.use('/api/news', newsRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Test mx-skills endpoint
app.get('/api/test-mxskill', async (req, res) => {
  console.log('[Test] Calling mx-skills directly...')
  const result = await runMXSkillSimple(
    'mx-finance-data',
    'get_data.py',
    '华测检测 货币资金 资产负债率'
  )
  console.log('[Test] Result:', JSON.stringify(result).slice(0, 500))
  res.json(result)
})

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err)
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  })
})

app.listen(PORT, () => {
  console.log(`M&A AI Backend Server running on http://localhost:${PORT}`)
  console.log(`EM_API_KEY configured: ${process.env.EM_API_KEY ? 'Yes' : 'No (mx-skills will use mock data)'}`)

  // 启动新闻采集调度器 (默认每5分钟采集, 每60分钟AI分析)
  const collectionInterval = parseInt(process.env.NEWS_COLLECTION_INTERVAL || '5')
  const analysisInterval = parseInt(process.env.NEWS_ANALYSIS_INTERVAL || '60')
  startScheduler(collectionInterval, analysisInterval)

  // 初始化默认 feeds
  initializeDefaultFeeds()
})
