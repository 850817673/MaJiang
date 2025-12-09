// 福州麻将规则配置
export default {
  name: '福州麻将',
  code: 'fuzhou',

  // 牌组配置
  tileSet: {
    suits: ['wan', 'tong', 'tiao'],           // 万、筒、条三种花色
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],     // 1-9
    countPerTile: 4,                           // 每种牌4张
    includeZi: false,                          // 字牌不参与牌局，只用于记分
    includeFlowers: false,                     // 花牌不参与牌局，只用于记分
    totalTiles: 108                            // 只算万条饼：27种×4=108张
  },

  // 玩法规则
  gameplay: {
    players: 4,                                // 4人玩
    turnOrder: 'counterclockwise',             // 逆时针出牌
    allowChi: true,                            // 可以吃牌
    allowPeng: true,                           // 可以碰牌
    allowKong: true,                           // 可以杠牌
    flowerReplacement: true,                   // 摸到花牌需要补花
    goldTile: {                                // 金牌（百搭牌）规则
      enabled: true,                           // 启用金牌
      method: 'flipFirstTileAfterFlowerPhase', // 补花结束后翻金
      wildcard: true                           // 金牌可当任意牌使用
    }
  },

  // 发牌规则
  dealRules: {
    dealerHandCount: 17,                       // 庄家起手17张
    nonDealerHandCount: 17,                    // 闲家起手16张
    dealerSelectMethod: 'random_first_round',  // 首局随机选庄
    dealerContinuation: 'dealer_wins_or_draw'  // 庄家胡牌或流局则连庄
  },

  // 动作规则
  actions: {
    chi: {
      enabled: true,
      allowedOnlyFromPlayer: 'previous_player' // 只能吃上家的牌
    },
    peng: { enabled: true },                   // 碰牌：任意玩家打出的牌
    kong: {
      enabled: true,
      types: {
        ming_kong: true,                       // 明杠：别人打出你有3张
        an_kong: true,                         // 暗杠：自己摸到4张
        bu_kong: true                          // 补杠：碰了之后摸到第4张
      }
    }
  },

  // 胡牌规则
  winRules: {
    basicWin: {
      type: 'standard',
      description: '4组面子 + 1对将'           // 基本胡牌型
    },
    specialWins: {                             // 特殊胡牌型
      jin_que: {                               // 金雀：手牌有3张金牌
        enabled: true,
        requiredGoldCount: 3,
        fan: 6
      },
      jin_long: {                              // 金龙：金牌组成的面子
        enabled: true,
        requireGoldMeld: true,
        fan: 6
      },
      san_jin_dao: {                           // 三金倒：3张金牌做将
        enabled: true,
        fan: 8
      },
      qing_yi_se: {                            // 清一色：全部同一花色
        enabled: true,
        fan: 4
      },
      dui_dui_hu: {                            // 对对胡：全部是刻子
        enabled: true,
        fan: 4
      }
    },
    winPriority: 'highest_fan_only'            // 只算最高番
  },

  // 计分规则
  scoring: {
    baseFan: 1,                                // 基础1番
    flowerFan: {
      eachFlowerFan: 1,                        // 每张花牌1番
      fullSetFan: 6,                           // 集齐一套花牌6番
      fullSetSize: 4                           // 一套4张
    },
    kongFan: {
      mingKong: 1,                             // 明杠1番
      anKong: 2,                               // 暗杠2番
      buKong: 1                                // 补杠1番
    },
    goldFan: { eachGoldFan: 1 },               // 每张金牌1番
    dealerFan: { continuousDealerFanPerRound: 1 }, // 连庄每轮加1番
    settlement: {
      selfDraw: 'others_pay',                  // 自摸：三家都要付钱
      discardWin: 'discarder_pays_full'        // 点炮：放炮者全付
    }
  },

  // 流局规则
  drawRules: {
    enabled: true,
    when: 'tiles_exhausted',                   // 牌摸完时
    result: 'no_winner'                        // 无人胜出
  },

  description: '福州麻将可以吃碰杠，有金牌（百搭），补花后翻金'
}
