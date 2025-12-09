<template>
  <!-- 牌局页面：记牌器 + 已出牌 + 手牌 -->
  <view class="gamePage">
    <!-- 顶部：剩余牌区域（记牌器） -->
    <view class="section leftSection">
      <view class="sectionTitle">剩余牌（点击记录出牌）</view>
      <!-- 万 -->
      <view class="tileRow">
        <text class="rowLabel">万</text>
        <view class="tiles">
          <MahjongTile
            v-for="tile in wanTiles"
            :key="tile"
            :tile="tile"
            :count="leftCards[tile]"
            :showCount="true"
            :disabled="leftCards[tile] === 0"
            size="small"
            @tileClick="recordPlay"
          />
        </view>
      </view>
      <!-- 条 -->
      <view class="tileRow">
        <text class="rowLabel">条</text>
        <view class="tiles">
          <MahjongTile
            v-for="tile in tiaoTiles"
            :key="tile"
            :tile="tile"
            :count="leftCards[tile]"
            :showCount="true"
            :disabled="leftCards[tile] === 0"
            size="small"
            @tileClick="recordPlay"
          />
        </view>
      </view>
      <!-- 饼 -->
      <view class="tileRow">
        <text class="rowLabel">饼</text>
        <view class="tiles">
          <MahjongTile
            v-for="tile in bingTiles"
            :key="tile"
            :tile="tile"
            :count="leftCards[tile]"
            :showCount="true"
            :disabled="leftCards[tile] === 0"
            size="small"
            @tileClick="recordPlay"
          />
        </view>
      </view>
      <!-- 字牌（四川麻将隐藏） -->
      <view v-if="!excludeZi" class="tileRow">
        <text class="rowLabel">字</text>
        <view class="tiles">
          <MahjongTile
            v-for="tile in ziTiles"
            :key="tile"
            :tile="tile"
            :count="leftCards[tile]"
            :showCount="true"
            :disabled="leftCards[tile] === 0"
            size="small"
            @tileClick="recordPlay"
          />
        </view>
      </view>
      <!-- 花牌 -->
      <view v-if="includeHua" class="tileRow">
        <text class="rowLabel">花</text>
        <view class="tiles">
          <MahjongTile
            v-for="tile in huaTiles"
            :key="tile"
            :tile="tile"
            :count="leftCards[tile]"
            :showCount="true"
            :disabled="leftCards[tile] === 0"
            size="small"
            @tileClick="recordPlay"
          />
        </view>
      </view>
    </view>

    <!-- 中间：已出牌区域 -->
    <view class="section playedSection">
      <view class="sectionHeader">
        <text class="sectionTitle">已出牌（{{ playedCards.length }}张）</text>
        <text v-if="playedCards.length" class="undoBtn" @click="undoPlay">撤销</text>
      </view>
      <scroll-view scroll-x class="playedScroll">
        <view class="playedTiles">
          <MahjongTile
            v-for="(tile, idx) in playedCards"
            :key="idx"
            :tile="tile"
            size="small"
          />
        </view>
      </scroll-view>
    </view>

    <!-- 下半部分：手牌区域 -->
    <view class="section handSection">
      <view class="sectionHeader">
        <text class="sectionTitle">我的手牌（{{ handCards.length }}/{{ maxHandCount }}张）</text>
        <text class="editBtn" @click="toggleEdit">{{ isEditing ? '完成' : '编辑' }}</text>
      </view>

      <!-- 手牌展示（双击打出） -->
      <view class="handTiles">
        <MahjongTile
          v-for="(tile, idx) in sortedHandCards"
          :key="idx"
          :tile="tile"
          :selected="isEditing && selectedHandIdx === idx"
          @tileClick="() => onHandTileClick(idx)"
          @tileDblClick="() => onHandTileDblClick(idx)"
        />
      </view>

      <!-- 编辑模式：选牌面板 -->
      <view v-if="isEditing" class="editPanel">
        <text class="editTip">点击下方牌添加到手牌</text>
        <view class="editTiles">
          <MahjongTile
            v-for="item in allTilesForEdit"
            :key="item.tile"
            :tile="item.tile"
            :disabled="item.disabled"
            size="small"
            @tileClick="addToHand"
          />
        </view>
      </view>

      <!-- AI分析按钮 -->
      <button class="aiBtn" @click="analyzePlay" :disabled="analyzing">
        {{ analyzing ? '分析中...' : 'AI分析最优出牌' }}
      </button>

      <!-- AI建议结果 -->
      <view v-if="aiResult" class="aiResult">
        <view class="aiResultTitle">AI建议</view>
        <view class="aiResultContent">
          <text class="bestTile">推荐打：{{ aiResult.bestDiscard }}</text>
          <text class="reason">{{ aiResult.reason }}</text>
          <text v-if="aiResult.ting && aiResult.ting.length" class="tingInfo">
            听牌：{{ aiResult.ting.join('、') }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import MahjongTile from '@/components/MahjongTile/MahjongTile.vue'
import { TILE_TYPES, initLeftCards, sortTiles, TILE_NAMES, countTiles } from '@/utils/mahjong.js'
import { analyzeOptimalDiscard } from '@/utils/deepseek.js'
import fuzhouRule from '@/utils/rules/fuzhou.js'
import sichuanRule from '@/utils/rules/sichuan.js'

export default {
  components: { MahjongTile },
  data() {
    return {
      rule: 'fuzhou',
      leftCards: {},       // 剩余牌
      playedCards: [],     // 已出牌
      handCards: [],       // 手牌
      isEditing: false,    // 编辑模式
      selectedHandIdx: -1, // 选中的手牌索引
      analyzing: false,
      aiResult: null
    }
  },
  computed: {
    // 当前规则配置
    ruleConfig() {
      return this.rule === 'sichuan' ? sichuanRule : fuzhouRule
    },
    excludeZi() {
      return this.ruleConfig.excludeZi
    },
    wanTiles() { return TILE_TYPES.wan },
    tiaoTiles() { return TILE_TYPES.tiao },
    bingTiles() { return TILE_TYPES.bing },
    ziTiles() { return TILE_TYPES.zi },
    huaTiles() { return TILE_TYPES.hua },
    // 手牌中每种牌的数量
    handTileCount() { return countTiles(this.handCards) },
    // 排序后的手牌
    sortedHandCards() {
      return sortTiles(this.handCards)
    },
    // 编辑时可选的牌（带禁用状态）
    allTilesForEdit() {
      let tiles = [...TILE_TYPES.wan, ...TILE_TYPES.tiao, ...TILE_TYPES.bing]
      if (!this.excludeZi) tiles = [...tiles, ...TILE_TYPES.zi, ...TILE_TYPES.hua]
      return tiles.map(tile => ({
        tile,
        disabled: this.isTileExhausted(tile)
      }))
    },
    // 是否包含花牌
    includeHua() {
      return this.ruleConfig.tileSet?.includeFlowers !== false
    },
    // 手牌上限（摸牌后打牌前最多17张）
    maxHandCount() {
      return 17
    }
  },
  onLoad(options) {
    this.rule = options.rule || 'fuzhou'
    this.initGame()
  },
  methods: {
    // 初始化牌局
    initGame() {
      this.leftCards = initLeftCards()
      // 四川麻将移除字牌
      if (this.excludeZi) {
        TILE_TYPES.zi.forEach(t => delete this.leftCards[t])
      }
      this.playedCards = []
      this.handCards = []
      this.aiResult = null
    },
    // 记录出牌（点击剩余牌区）
    recordPlay(tile) {
      if (this.leftCards[tile] > 0) {
        this.leftCards[tile]--
        this.playedCards.push(tile)
      }
    },
    // 撤销出牌
    undoPlay() {
      if (this.playedCards.length) {
        const tile = this.playedCards.pop()
        this.leftCards[tile]++
      }
    },
    // 切换编辑模式
    toggleEdit() {
      this.isEditing = !this.isEditing
      this.selectedHandIdx = -1
    },
    // 点击手牌
    onHandTileClick(idx) {
      if (this.isEditing) {
        // 编辑模式：双击删除手牌
        if (this.selectedHandIdx === idx) {
          this.handCards.splice(idx, 1)
          this.selectedHandIdx = -1
        } else {
          this.selectedHandIdx = idx
        }
      }
    },
    // 双击手牌打出
    onHandTileDblClick(idx) {
      if (this.isEditing) return
      const tile = this.sortedHandCards[idx]
      // 从手牌移除（需要找到原数组中的位置）
      const originalIdx = this.handCards.indexOf(tile)
      if (originalIdx > -1) {
        this.handCards.splice(originalIdx, 1)
        this.playedCards.push(tile)
        // 不恢复 leftCards，因为牌是从手牌打出的
      }
    },
    // 检查牌是否已用尽（手牌+已出 >= 上限）
    isTileExhausted(tile) {
      const maxCount = tile.startsWith('H') ? 1 : 4
      const inHand = this.handTileCount[tile] || 0
      const played = maxCount - (this.leftCards[tile] ?? maxCount)
      return inHand + played >= maxCount
    },
    // 添加牌到手牌
    addToHand(tile) {
      if (this.handCards.length >= this.maxHandCount) {
        uni.showToast({ title: '手牌已满', icon: 'none' })
        return
      }
      if (this.isTileExhausted(tile)) return
      this.handCards.push(tile)
    },
    // AI分析最优出牌
    async analyzePlay() {
      if (this.handCards.length < 13) {
        uni.showToast({ title: '请先输入手牌', icon: 'none' })
        return
      }
      this.analyzing = true
      this.aiResult = null

      try {
        const result = await analyzeOptimalDiscard({
          rule: this.rule,
          handCards: this.handCards,
          playedCards: this.playedCards,
          leftCards: this.leftCards
        })
        // 转换牌编码为中文显示
        this.aiResult = {
          bestDiscard: TILE_NAMES[result.bestDiscard] || result.bestDiscard,
          reason: result.reason,
          ting: result.ting ? result.ting.map(t => TILE_NAMES[t] || t) : []
        }
      } catch (e) {
        uni.showToast({ title: 'AI分析失败', icon: 'none' })
      } finally {
        this.analyzing = false
      }
    }
  }
}
</script>

<style scoped>
.gamePage {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}
.section {
  background: #fff;
  margin: 16rpx;
  border-radius: 12rpx;
  padding: 20rpx;
}
.sectionHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.sectionTitle {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}
.undoBtn, .editBtn {
  font-size: 24rpx;
  color: #2d8c3c;
}
/* 剩余牌区 */
.tileRow {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}
.rowLabel {
  width: 48rpx;
  font-size: 24rpx;
  color: #666;
}
.tiles {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}
/* 已出牌区 */
.playedScroll {
  white-space: nowrap;
}
.playedTiles {
  display: flex;
  gap: 6rpx;
  min-height: 60rpx;
}
/* 手牌区 */
.handTiles {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
  min-height: 70rpx;
  padding: 10rpx 0;
}
.editPanel {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;
}
.editTip {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-bottom: 12rpx;
}
.editTiles {
  display: flex;
  gap: 6rpx;
  flex-wrap: wrap;
}
/* AI按钮 */
.aiBtn {
  margin-top: 24rpx;
  background: #2d8c3c;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
}
.aiBtn[disabled] {
  background: #ccc;
}
/* AI结果 */
.aiResult {
  margin-top: 20rpx;
  padding: 16rpx;
  background: #e8f5e9;
  border-radius: 8rpx;
}
.aiResultTitle {
  font-size: 24rpx;
  color: #2d8c3c;
  font-weight: bold;
}
.aiResultContent {
  margin-top: 8rpx;
}
.bestTile {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.reason {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-top: 4rpx;
}
.tingInfo {
  display: block;
  font-size: 24rpx;
  color: #2d8c3c;
  margin-top: 8rpx;
  font-weight: bold;
}
</style>
