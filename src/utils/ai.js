// AI 统一入口 - 管理多模型切换

import { analyzeOptimalDiscard as deepseekAnalyze } from './deepseek.js'
import { analyzeOptimalDiscard as claudeAnalyze } from './claude.js'

// 支持的模型列表
export const AI_MODELS = [
  { id: 'deepseek', name: 'DeepSeek', desc: '国产大模型' },
  // { id: 'claude', name: 'Claude', desc: 'Anthropic' }
]

// 当前选中的模型（默认 deepseek）
let currentModel = 'deepseek'

// 获取当前模型
export function getCurrentModel() {
  return currentModel
}

// 设置当前模型
export function setCurrentModel(modelId) {
  const model = AI_MODELS.find(m => m.id === modelId)
  if (model) {
    currentModel = modelId
    // 持久化存储
    uni.setStorageSync('ai_model', modelId)
    return true
  }
  return false
}

// 初始化：从存储恢复模型选择
export function initModel() {
  const saved = uni.getStorageSync('ai_model')
  if (saved && AI_MODELS.find(m => m.id === saved)) {
    currentModel = saved
  }
}

// 统一分析接口
export async function analyzeOptimalDiscard(params) {
  switch (currentModel) {
    case 'claude':
      return claudeAnalyze(params)
    case 'deepseek':
    default:
      return deepseekAnalyze(params)
  }
}
