// DeepSeek API 调用封装

import fuzhouRule from './rules/fuzhou.js'
import sichuanRule from './rules/sichuan.js'
import { TILE_NAMES } from './mahjong.js'

// H5 用代理解决 CORS，小程序直接调用
const API_URL = process.env.UNI_PLATFORM === 'h5'
  ? '/api/deepseek/chat/completions'
  : 'https://api.deepseek.com/chat/completions'
const API_KEY = 'sk-941eea4ff883463098e7f685345aed28'

// 福州麻将详细规则（用于AI提示词）
const FUZHOU_DETAIL = {
  winTypes: {
    special: {
      '天和': '庄家开局补花后即胡牌',
      '抢金': '闲家抓进金牌即胡/庄家打牌后换金胡',
      '三金倒': '拥有三张金牌立即胡（无视牌型）',
      '金雀': '用两张金牌作将牌',
      '金龙': '三张金牌仅作本身刻子使用',
      '金坎': '金牌作为刻子的一部分',
      '清一色': '全部牌为同一花色',
      '对对胡': '全部为刻子/杠子（无顺子）',
      '混一色': '同一花色+字牌',
      '七对子': '特殊牌型：7个对子'
    },
    normal: '标准胡牌：一对将牌 + 四组面子（顺子/刻子/杠子）'
  },
  goldTileRules: [
    '金牌由牌尾翻出的第一张非花牌确定',
    '金牌可替代万、筒、条中的任意一张',
    '主动打出金牌后：只能自摸胡牌，其他家不能吃碰杠此牌',
    '金牌可参与组成顺子、刻子、将牌'
  ],
  priorityRules: [
    '特殊胡牌类型按优先级结算',
    '金雀胡牌可打破"一炮一响"顺序',
    '多人都可胡时，逆时针顺序最近者优先'
  ]
}

// 根据规则配置生成规则描述
function buildRuleDesc(ruleConfig) {
  const { name, gameplay, winRules, scoring } = ruleConfig
  const isFuzhou = ruleConfig.code === 'fuzhou'

  let desc = `=== ${name}核心规则 ===\n`
  desc += `基本牌数：${isFuzhou ? '17' : '13'}张\n`
  desc += `- ${gameplay.allowChi ? '可以吃牌' : '不能吃牌'}\n`
  desc += `- ${gameplay.allowPeng ? '可以碰牌' : '不能碰牌'}\n`
  desc += `- ${gameplay.allowKong ? '可以杠牌' : '不能杠牌'}\n`

  // 金牌规则（福州麻将特有）
  if (gameplay.goldTile?.enabled && isFuzhou) {
    desc += `\n【金牌系统】\n`
    FUZHOU_DETAIL.goldTileRules.forEach((rule, i) => {
      desc += `${i + 1}. ${rule}\n`
    })
  }

  // 胡牌类型
  desc += `\n【胡牌类型】\n`
  if (isFuzhou) {
    desc += `特殊胡牌（高优先级）：\n`
    Object.entries(FUZHOU_DETAIL.winTypes.special).forEach(([type, detail]) => {
      desc += `  • ${type}：${detail}\n`
    })
    desc += `普通胡牌：${FUZHOU_DETAIL.winTypes.normal}\n`
  } else if (winRules?.specialWins) {
    const specials = Object.entries(winRules.specialWins)
      .filter(([_, v]) => v.enabled)
      .map(([k, v]) => `${k}(${v.fan}番)`)
    if (specials.length) {
      desc += `特殊牌型：${specials.join('、')}\n`
    }
  }

  // 结算优先级（福州麻将）
  if (isFuzhou) {
    desc += `\n【结算优先级】\n`
    FUZHOU_DETAIL.priorityRules.forEach((rule, i) => {
      desc += `${i + 1}. ${rule}\n`
    })
  }

  return desc
}

/**
 * 调用 DeepSeek 分析最优出牌
 */
export async function analyzeOptimalDiscard({ rule, handCards, playedCards, leftCards, goldTile }) {
  // 获取规则配置
  const ruleConfig = rule === 'fuzhou' ? fuzhouRule : sichuanRule
  const ruleDesc = buildRuleDesc(ruleConfig)

  // 金牌信息
  const goldCount = goldTile ? handCards.filter(c => c === goldTile).length : 0
  const goldInfo = goldTile
    ? `当前金牌（百搭）：${TILE_NAMES[goldTile] || goldTile}，可当任意牌使用
手牌中金牌数量：${goldCount}张（金牌越多胡牌概率越高，3张金牌可三金倒）\n`
    : ''

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

必须根据剩余牌数量和听牌张数，估算胡牌概率：
- normalHuProb：普通胡牌概率（百分比，如"35%"）
- specialHuProb：特殊胡牌概率（清一色/对对胡/三金倒等，如"8%"）

请严格按JSON格式回复，所有字段必填：
{"canHu":true或false,"huType":"胡牌牌型","bestDiscard":"牌编码如1W","reason":"简短理由20字内","ting":["听牌编码"],"normalHuProb":"35%","specialHuProb":"5%"}`

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
