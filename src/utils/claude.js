// Claude API 调用封装

import fuzhouRule from './rules/fuzhou.js'
import sichuanRule from './rules/sichuan.js'
import { TILE_NAMES } from './mahjong.js'

const API_URL = process.env.UNI_PLATFORM === 'h5'
  ? '/api/claude/messages'
  : 'https://api.anthropic.com/v1/messages'

const API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || '' // 在 .env 文件中配置 VITE_CLAUDE_API_KEY

function buildRuleDesc(ruleConfig) {
  const { name, gameplay, winRules } = ruleConfig
  let desc = `${name}规则：\n`
  desc += `- ${gameplay.allowChi ? '可以吃牌' : '不能吃牌'}\n`
  desc += `- ${gameplay.allowPeng ? '可以碰牌' : '不能碰牌'}\n`
  desc += `- ${gameplay.allowKong ? '可以杠牌' : '不能杠牌'}\n`
  if (gameplay.goldTile?.enabled) {
    desc += `- 有金牌（百搭），可当任意牌\n`
  }
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

export async function analyzeOptimalDiscard({ rule, handCards, playedCards, leftCards, goldTile }) {
  const ruleConfig = rule === 'fuzhou' ? fuzhouRule : sichuanRule
  const ruleDesc = buildRuleDesc(ruleConfig)
  const goldInfo = goldTile ? `当前金牌（百搭）：${TILE_NAMES[goldTile] || goldTile}，可当任意牌使用\n` : ''

  const prompt = `你是麻将高手。根据以下牌局信息，分析牌局。

${ruleDesc}
${goldInfo}
我的手牌（${handCards.length}张）：${handCards.join(', ')}
已出牌：${playedCards.length ? playedCards.join(', ') : '无'}
剩余牌数量：${JSON.stringify(leftCards)}

福州麻将胡牌规则：
- 无吃碰杠时，17张牌胡牌（5组面子+1对将，或特殊牌型）
- 金牌可当任意牌使用（百搭）
- 清一色、对对胡、三金倒等特殊牌型有额外番数

请先判断当前${handCards.length}张手牌是否已经胡牌，如果能胡牌请告诉我。
如果不能胡牌，请分析最优出牌建议（听牌数、胡牌概率、保留金牌优先）。

请用JSON格式回复：
{"canHu":true或false,"huType":"胡牌牌型","bestDiscard":"牌编码如1W","reason":"简短理由20字内","ting":["听牌编码"]}`

  try {
    const res = await uni.request({
      url: API_URL,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      data: {
        model: 'claude-sonnet-4-5-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      }
    })

    if (res.statusCode === 200 && res.data.content) {
      const content = res.data.content[0].text
      const match = content.match(/\{[\s\S]*\}/)
      if (match) return JSON.parse(match[0])
    }
    throw new Error('API响应异常')
  } catch (e) {
    console.error('Claude API 错误:', e)
    throw e
  }
}
