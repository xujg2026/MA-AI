/**
 * mx-skills Python脚本调用工具
 *
 * 封装对mx-skills Python脚本的调用逻辑
 */

import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// mx-skills目录
const MX_SKILLS_BASE = path.resolve(__dirname, '../../../mx-skills')

interface SkillResult {
  success: boolean
  data?: any
  error?: string
  outputPath?: string
}

// 需要使用位置参数的skill
const SKILLS_WITH_POSITIONAL_QUERY = ['mx-finance-search']

/**
 * 读取Excel文件并转换为JSON
 */
async function readExcelFile(filePath: string): Promise<any> {
  try {
    const workbook = XLSX.readFile(filePath)
    const result: Record<string, any> = {}

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      result[sheetName] = jsonData
    }

    return result
  } catch (error) {
    console.error('[mx-skill] Error reading Excel file:', error)
    return null
  }
}

/**
 * 调用mx-skills Python脚本
 */
export async function runMXSkill(
  skillName: string,
  scriptName: string,
  args: Record<string, string | boolean>
): Promise<SkillResult> {
  return new Promise((resolve) => {
    const skillPath = path.join(MX_SKILLS_BASE, skillName, 'scripts', scriptName)

    // 构建命令参数
    const spawnArgs: string[] = []

    // mx-finance-search使用位置参数
    if (SKILLS_WITH_POSITIONAL_QUERY.includes(skillName)) {
      if (args.query) {
        spawnArgs.push(args.query as string)
      }
      if (args.noSave) {
        spawnArgs.push('--no-save')
      }
    } else {
      // 其他skill使用--flag格式
      for (const [key, value] of Object.entries(args)) {
        if (typeof value === 'boolean') {
          if (value) spawnArgs.push(`--${key}`)
        } else {
          spawnArgs.push(`--${key}`, value)
        }
      }
    }

    console.log(`[mx-skill] Running: ${skillName}/${scriptName}`)
    console.log(`[mx-skill] Args:`, spawnArgs)

    // 检查EM_API_KEY
    if (!process.env.EM_API_KEY) {
      resolve({
        success: false,
        error: 'EM_API_KEY environment variable not set. Please set it before calling mx-skills.'
      })
      return
    }

    const child = spawn('python', [skillPath, ...spawnArgs], {
      env: { ...process.env, EM_API_KEY: process.env.EM_API_KEY }
    })

    let stdout = ''
    let stderr = ''

    child.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', async (code) => {
      if (code !== 0) {
        console.error(`[mx-skill] Error:`, stderr)
        resolve({
          success: false,
          error: stderr || `Script exited with code ${code}`
        })
        return
      }

      console.log(`[mx-skill] stdout:`, stdout.slice(0, 500))

      try {
        // 检查是否有保存路径 (支持中英文)
        let outputPath: string | undefined
        // 匹配 "Saved: path" 或 "文件: path" 或 "输出文件: path"
        const savedMatch = stdout.match(/(?:Saved|文件|输出文件|Output)[:：]\s*(.+)/)
        if (savedMatch) {
          outputPath = savedMatch[1].trim()
          console.log(`[mx-skill] Saved file:`, outputPath)

          // 尝试读取保存的文件
          if (outputPath && !args.noSave) {
            // 检查文件类型
            if (outputPath.endsWith('.xlsx') || outputPath.endsWith('.xls')) {
              // 读取Excel文件
              const excelData = await readExcelFile(outputPath)
              if (excelData) {
                console.log(`[mx-skill] Excel data sheets:`, Object.keys(excelData))
                resolve({ success: true, data: excelData, outputPath })
                return
              }
            } else {
              // 读取文本文件
              const fileContent = await fs.readFile(outputPath, 'utf-8')
              if (fileContent) {
                console.log(`[mx-skill] File content length:`, fileContent.length)
                // 尝试解析JSON
                try {
                  const data = JSON.parse(fileContent)
                  resolve({ success: true, data, outputPath })
                  return
                } catch {
                  // 如果文件不是JSON，返回文件内容
                  resolve({ success: true, data: fileContent, outputPath })
                  return
                }
              }
            }
          }
        }

        // 尝试解析stdout为JSON
        const lines = stdout.trim().split('\n')
        const lastLine = lines[lines.length - 1]
        try {
          const data = JSON.parse(lastLine)
          resolve({ success: true, data })
        } catch {
          // 如果不是JSON，返回原始文本
          resolve({ success: true, data: stdout.trim() })
        }
      } catch (e) {
        resolve({
          success: false,
          error: `Failed to parse output: ${e}`
        })
      }
    })

    child.on('error', (err) => {
      console.error(`[mx-skill] Spawn error:`, err)
      resolve({
        success: false,
        error: `Failed to spawn python process: ${err.message}`
      })
    })
  })
}

/**
 * 简化调用接口 - 只需要query参数
 */
export async function runMXSkillSimple(
  skillName: string,
  scriptName: string,
  query: string,
  options?: { noSave?: boolean }
): Promise<SkillResult> {
  const args: Record<string, string | boolean> = {
    query,
    ...(options?.noSave ? { noSave: true } : {})
  }
  return runMXSkill(skillName, scriptName, args)
}
