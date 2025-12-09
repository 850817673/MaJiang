// DeepSeek API 调用封装

import fuzhouRule from './rules/fuzhou.js'
import sichuanRule from './rules/sichuan.js'

// H5 用代理解决 CORS，小程序直接调用
const API_URL = process.env.UNI_PLATFORM === 'h5'
  ? '/api/deepseek/chat/completions'
  : 'https://api.deepseek.com/chat/completions'
const API_KEY = 'sk-941eea4ff883463098e7f685345aed28'

// 根据规则配置生成规则描述
function buildRuleDesc(ruleConfig) {
  const { name, gameplay, winRules, scoring } = ruleConfig

  let desc = `${name}规则：\n`
  desc += `- ${gameplay.allowChi ? '可以吃牌' : '不能吃牌'}\n`
  desc += `- ${gameplay.allowPeng ? '可以碰牌' : '不能碰牌'}\n`
  desc += `- ${gameplay.allowKong ? '可以杠牌' : '不能杠牌'}\n`

  if (gameplay.goldTile?.enabled) {
    desc += `- 有金牌（百搭），可当任意牌\n`
  }

  // 特殊胡牌型
  if (winRules?.specialWins) {
    const specials = Object.entries(winRules.specialWins)
      .filter(([_, v]) => v.enabled)
      .map(([k, v]) => `${k}(${v.fan}番)`)
    if (specials.length) {
      desc += `- 特殊牌型：${specials.join('、')}\n`
    }
  }

  return desc
}

/**
 * 调用 DeepSeek 分析最优出牌
 */
export async function analyzeOptimalDiscard({ rule, handCards, playedCards, leftCards }) {
  // 获取规则配置
  const ruleConfig = rule === 'fuzhou' ? fuzhouRule : sichuanRule
  const ruleDesc = buildRuleDesc(ruleConfig)

  const prompt = `你是麻将高手。根据以下牌局信息，分析最优出牌。

${ruleDesc}
我的手牌：${handCards.join(', ')}
已出牌：${playedCards.join(', ')}
剩余牌数量：${JSON.stringify(leftCards)}

请分析后给出：
1. 推荐打哪张牌
2. 简短理由（20字内）
3. 当前听什么牌（如果听牌的话）

请用JSON格式回复：
{"bestDiscard":"牌编码","reason":"理由","ting":["听牌1","听牌2"]}`

  try {
    const res = await uni.request({
      url: API_URL,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      data: {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      }
    })

    if (res.statusCode === 200 && res.data.choices) {
      const content = res.data.choices[0].message.content
      const match = content.match(/\{[\s\S]*\}/)
      if (match) {
        return JSON.parse(match[0])
      }
    }
    throw new Error('API响应异常')
  } catch (e) {
    console.error('DeepSeek API 错误:', e)
    throw e
  }
}
