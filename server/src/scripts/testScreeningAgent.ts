/**
 * 测试买家筛选Agent
 */

import { spawn } from 'child_process'

async function testScreeningAgent() {
  console.log('=== 测试买家筛选Agent ===\n')

  const testRequest = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetCompany: {
        name: '华测检测',
        mainBusiness: '第三方检测认证服务',
        industry: '检测认证',
        estimatedValue: 50000, // 5亿估值
      },
      limit: 5,
    }),
  }

  // 启动服务器并测试
  console.log('启动测试服务器...')

  const server = spawn('npx', ['tsx', 'src/index.ts'], {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'pipe']
  })

  let serverOutput = ''
  server.stdout.on('data', (data) => {
    serverOutput += data.toString()
    if (serverOutput.includes('running on')) {
      console.log('服务器已启动\n')
      makeRequest()
    }
  })

  server.stderr.on('data', (data) => {
    console.error('Server error:', data.toString())
  })

  async function makeRequest() {
    // 等待服务器完全启动
    await new Promise(resolve => setTimeout(resolve, 2000))

    const http = await import('http')

    const reqData = JSON.stringify({
      targetCompany: {
        name: '华测检测',
        mainBusiness: '第三方检测认证服务',
        industry: '检测认证',
        estimatedValue: 50000,
      },
      limit: 5,
    })

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/buyer/screening-agent',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(reqData),
      },
    }

    console.log('发送测试请求到 /api/buyer/screening-agent...\n')

    const req = http.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        console.log('响应状态:', res.statusCode)
        console.log('\n响应内容:')

        try {
          const parsed = JSON.parse(data)
          if (parsed.success) {
            const report = parsed.data.screeningReport
            console.log(`目标公司: ${report.targetCompany}`)
            console.log(`候选公司总数: ${report.totalCandidates}`)
            console.log(`通过筛选数: ${report.passedFirstStep}`)
            console.log(`返回结果数: ${report.finalRecommendations.length}\n`)

            console.log('--- Top 5 推荐买家 ---')
            report.finalRecommendations.slice(0, 5).forEach((rec: any) => {
              console.log(`\n[${rec.rank}] ${rec.companyName} (${rec.stockCode})`)
              console.log(`    综合评分: ${rec.overallScore} (${rec.grade})`)
              console.log(`    财务健康度: ${rec.financialHealthScore}`)
              console.log(`    战略协同性: ${rec.strategicAlignmentScore}`)
              console.log(`    亮点: ${rec.keyStrengths.slice(0, 2).join(', ')}`)
            })
          } else {
            console.log('API调用失败:', parsed.error)
          }
        } catch (e) {
          console.log('响应解析失败:', data)
        }

        console.log('\n\n关闭测试服务器...')
        server.kill()
        process.exit(0)
      })
    })

    req.on('error', (e) => {
      console.error('请求错误:', e)
      server.kill()
      process.exit(1)
    })

    req.write(reqData)
    req.end()
  }

  // 超时处理
  setTimeout(() => {
    console.log('\n测试超时，关闭服务器...')
    server.kill()
    process.exit(1)
  }, 60000)
}

testScreeningAgent().catch(console.error)
