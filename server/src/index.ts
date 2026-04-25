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
import { runMXSkillSimple } from './utils/mxSkillRunner.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/buyer', buyerProfileRouter)
app.use('/api/buyer', buyerScreenRouter)
app.use('/api/buyer', buyerScreeningAgentRouter)
app.use('/api/financial', financialDataRouter)
app.use('/api/qcc', qccRouter)
app.use('/api/search', financialSearchRouter)
app.use('/api/diagnosis', stockDiagnosisRouter)
app.use('/api/protocol', protocolRouter)

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
})
