/**
 * LLM配置
 * 支持OpenAI和Anthropic
 */

export interface LLMConfig {
  provider: 'openai' | 'anthropic'
  model: string
  apiKey: string
  baseUrl?: string
  temperature: number
  maxTokens: number
}

export const LLM_CONFIGS = {
  // OpenAI配置
  openai: {
    provider: 'openai' as const,
    model: process.env.LLM_MODEL || 'gpt-4o-mini',
    apiKey: process.env.LLM_API_KEY || '',
    baseUrl: process.env.LLM_BASE_URL,  // 可选，用于代理或自定义API
    temperature: 0.3,
    maxTokens: 1024,
  },

  // Anthropic配置
  anthropic: {
    provider: 'anthropic' as const,
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    temperature: 0.3,
    maxTokens: 1024,
  },
}

// 获取当前激活的LLM配置
export function getLLMConfig(): LLMConfig {
  const provider = process.env.LLM_PROVIDER || 'openai'

  if (provider === 'anthropic') {
    return {
      ...LLM_CONFIGS.anthropic,
      apiKey: LLM_CONFIGS.anthropic.apiKey || process.env.ANTHROPIC_API_KEY || '',
    }
  }

  return {
    ...LLM_CONFIGS.openai,
    apiKey: LLM_CONFIGS.openai.apiKey || process.env.LLM_API_KEY || '',
  }
}

// 判断LLM是否已配置
export function isLLMConfigured(): boolean {
  const config = getLLMConfig()
  return Boolean(config.apiKey)
}

// 获取OpenAI兼容的API地址
export function getOpenAICompatibleBaseUrl(): string {
  const config = getLLMConfig()
  return config.baseUrl || 'https://api.openai.com/v1'
}
