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

    <!-- 金牌设置（福州麻将特有） -->
    <view v-if="hasGoldTile" class="section goldSection">
      <view class="sectionHeader">
        <text class="sectionTitle">金牌（百搭）</text>
        <text class="editBtn" @click="toggleGoldEdit">{{ isEditingGold ? '完成' : '设置' }}</text>
      </view>
      <view class="goldDisplay">
        <MahjongTile
          v-if="goldTile"
          :tile="goldTile"
          :selected="true"
        />
        <text v-else class="goldHint">点击"设置"选择金牌</text>
      </view>
      <!-- 金牌选择面板 -->
      <view v-if="isEditingGold" class="goldSelectPanel">
        <view class="editTiles">
          <MahjongTile
            v-for="tile in allBaseTiles"
            :key="tile"
            :tile="tile"
            :selected="goldTile === tile"
            size="small"
            @tileClick="setGoldTile"
          />
        </view>
      </view>
    </view>

    <!-- 中间：已出牌区域（双击释放回牌池） -->
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
            @tileDblClick="() => releasePlayedTile(idx)"
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

      <!-- 手牌展示（点击打出） -->
      <view class="handTiles">
        <MahjongTile
          v-for="(tile, idx) in sortedHandCards"
          :key="idx"
          :tile="tile"
          :selected="isEditing && selectedHandIdx === idx"
          @tileClick="() => onHandTileClick(idx)"
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
      <view v-if="aiResult" class="aiResult" :class="{ canHu: aiResult.canHu }">
        <view class="aiResultTitle">{{ aiResult.canHu ? '🎉 可以胡牌！' : 'AI建议' }}</view>
        <view class="aiResultContent">
          <text v-if="aiResult.canHu" class="huType">牌型：{{ aiResult.huType }}</text>
          <text v-if="!aiResult.canHu && aiResult.bestDiscard" class="bestTile">推荐打：{{ aiResult.bestDiscard }}</text>
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
      goldTile: null,      // 金牌（百搭）
      isEditingGold: false,// 金牌编辑模式
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
    // 是否排除字牌（福州麻将字牌不参与牌局）
    excludeZi() {
      return this.ruleConfig.excludeZi || this.ruleConfig.tileSet?.includeZi === false
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
    // 是否有金牌规则
    hasGoldTile() {
      return this.ruleConfig.gameplay?.goldTile?.enabled === true
    },
    // 所有基础牌（万条饼，用于金牌选择）
    allBaseTiles() {
      return [...TILE_TYPES.wan, ...TILE_TYPES.tiao, ...TILE_TYPES.bing]
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
      // 福州麻将不含字牌花牌，只初始化万条饼
      const includeHua = this.ruleConfig.tileSet?.includeFlowers !== false
      this.leftCards = initLeftCards(includeHua)
      // 排除字牌（福州、四川都不用字牌）
      if (this.excludeZi) {
        TILE_TYPES.zi.forEach(t => delete this.leftCards[t])
        TILE_TYPES.hua.forEach(t => delete this.leftCards[t])
      }
      this.playedCards = []
      this.handCards = []
      this.goldTile = null
      this.isEditingGold = false
      this.aiResult = null
    },
    // 切换金牌编辑模式
    toggleGoldEdit() {
      this.isEditingGold = !this.isEditingGold
    },
    // 设置金牌
    setGoldTile(tile) {
      // 恢复旧金牌数量
      if (this.goldTile && this.leftCards[this.goldTile] !== undefined) {
        this.leftCards[this.goldTile]++
      }
      // 设置新金牌，数量减1
      this.goldTile = tile
      if (this.leftCards[tile] !== undefined && this.leftCards[tile] > 0) {
        this.leftCards[tile]--
      }
      this.isEditingGold = false
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
    // 双击已出牌区的牌，释放回剩余牌池
    releasePlayedTile(idx) {
      const tile = this.playedCards[idx]
      this.playedCards.splice(idx, 1)
      this.leftCards[tile]++
    },
    // 切换编辑模式
    toggleEdit() {
      this.isEditing = !this.isEditing
      this.selectedHandIdx = -1
    },
    // 点击手牌
    onHandTileClick(idx) {
      if (this.isEditing) {
        // 编辑模式：再次点击删除手牌（恢复到牌池）
        if (this.selectedHandIdx === idx) {
          this.removeFromHand(idx)
          this.selectedHandIdx = -1
        } else {
          this.selectedHandIdx = idx
        }
      } else {
        // 非编辑模式：单击打出手牌
        const tile = this.sortedHandCards[idx]
        const originalIdx = this.handCards.indexOf(tile)
        if (originalIdx > -1) {
          this.handCards.splice(originalIdx, 1)
          this.playedCards.push(tile)
        }
      }
    },
    // 检查牌是否已用尽（牌池为0）
    isTileExhausted(tile) {
      return (this.leftCards[tile] ?? 0) === 0
    },
    // 添加牌到手牌
    addToHand(tile) {
      if (this.handCards.length >= this.maxHandCount) {
        uni.showToast({ title: '手牌已满', icon: 'none' })
        return
      }
      if (this.isTileExhausted(tile)) return
      // 从牌池扣除
      if (this.leftCards[tile] !== undefined && this.leftCards[tile] > 0) {
        this.leftCards[tile]--
      }
      this.handCards.push(tile)
    },
    // 从手牌移除（恢复到牌池）
    removeFromHand(idx) {
      const tile = this.handCards[idx]
      this.handCards.splice(idx, 1)
      // 恢复到牌池
      if (this.leftCards[tile] !== undefined) {
        this.leftCards[tile]++
      }
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
          leftCards: this.leftCards,
          goldTile: this.goldTile  // 金牌信息
        })
        // 转换牌编码为中文显示
        this.aiResult = {
          canHu: result.canHu || false,
          huType: result.huType || '',
          bestDiscard: TILE_NAMES[result.bestDiscard] || result.bestDiscard || '',
          reason: result.reason || '',
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
/* 整体页面 - 麻将桌风格 */
.gamePage {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a472a 0%, #2d5a3f 50%, #1a472a 100%);
  padding: 20rpx 16rpx 40rpx;
}

/* 通用区块卡片 - 毛玻璃效果 */
.section {
  background: rgba(255, 255, 255, 0.92);
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow:
    0 4rpx 20rpx rgba(0, 0, 0, 0.15),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10rpx);
}

.sectionHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 12rpx;
  border-bottom: 2rpx solid rgba(45, 140, 60, 0.15);
}

.sectionTitle {
  font-size: 28rpx;
  font-weight: bold;
  color: #1a472a;
  position: relative;
  padding-left: 16rpx;
}
.sectionTitle::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 28rpx;
  background: linear-gradient(180deg, #43a047 0%, #2d8c3c 100%);
  border-radius: 3rpx;
}

/* 操作按钮 */
.undoBtn, .editBtn {
  font-size: 24rpx;
  color: #fff;
  background: linear-gradient(135deg, #43a047 0%, #2d8c3c 100%);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(45, 140, 60, 0.3);
}
.undoBtn:active, .editBtn:active {
  transform: scale(0.96);
}

/* 金牌区 - 金色主题 */
.goldSection {
  background: linear-gradient(135deg, #fffbf0 0%, #fff8e1 100%);
  border: 2rpx solid #ffd54f;
}
.goldSection .sectionTitle {
  color: #bf8c00;
}
.goldSection .sectionTitle::before {
  background: linear-gradient(180deg, #ffc107 0%, #ff9800 100%);
}
.goldDisplay {
  display: flex;
  align-items: center;
  min-height: 80rpx;
  padding: 12rpx;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 12rpx;
}
.goldHint {
  font-size: 24rpx;
  color: #bf8c00;
  font-style: italic;
}
.goldSelectPanel {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 2rpx dashed #ffd54f;
}

/* 剩余牌区 */
.leftSection {
  background: linear-gradient(135deg, #f8faf8 0%, #e8f5e9 100%);
}
.tileRow {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding: 8rpx 0;
}
.rowLabel {
  width: 52rpx;
  font-size: 26rpx;
  font-weight: bold;
  color: #1a472a;
  text-align: center;
}
.tiles {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
}

/* 已出牌区 */
.playedSection {
  background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
}
.playedScroll {
  white-space: nowrap;
}
.playedTiles {
  display: flex;
  gap: 8rpx;
  min-height: 70rpx;
  padding: 8rpx;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12rpx;
}

/* 手牌区 */
.handSection {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border: 2rpx solid #64b5f6;
}
.handSection .sectionTitle {
  color: #1565c0;
}
.handSection .sectionTitle::before {
  background: linear-gradient(180deg, #42a5f5 0%, #1e88e5 100%);
}
.handTiles {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
  min-height: 80rpx;
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12rpx;
}

.editPanel {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 2rpx dashed #90caf9;
}
.editTip {
  font-size: 22rpx;
  color: #1565c0;
  display: block;
  margin-bottom: 16rpx;
  font-style: italic;
}
.editTiles {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}

/* AI按钮 - 渐变发光 */
.aiBtn {
  margin-top: 28rpx;
  background: linear-gradient(135deg, #43a047 0%, #2d8c3c 50%, #1b5e20 100%);
  color: #fff;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: bold;
  padding: 24rpx 0;
  box-shadow:
    0 4rpx 16rpx rgba(45, 140, 60, 0.4),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  letter-spacing: 4rpx;
}
.aiBtn:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(45, 140, 60, 0.3);
}
.aiBtn[disabled] {
  background: linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%);
  box-shadow: none;
}

/* AI结果 - 卡片效果 */
.aiResult {
  margin-top: 24rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 16rpx;
  border: 2rpx solid #81c784;
  box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.2);
}
.aiResult.canHu {
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
  border: 3rpx solid #ff9800;
  box-shadow:
    0 4rpx 20rpx rgba(255, 152, 0, 0.3),
    0 0 40rpx rgba(255, 193, 7, 0.15);
  animation: huGlow 1.5s ease-in-out infinite alternate;
}
@keyframes huGlow {
  from { box-shadow: 0 4rpx 20rpx rgba(255, 152, 0, 0.3), 0 0 40rpx rgba(255, 193, 7, 0.15); }
  to { box-shadow: 0 4rpx 30rpx rgba(255, 152, 0, 0.5), 0 0 60rpx rgba(255, 193, 7, 0.25); }
}

.aiResultTitle {
  font-size: 26rpx;
  color: #2d8c3c;
  font-weight: bold;
}
.aiResult.canHu .aiResultTitle {
  color: #e65100;
  font-size: 32rpx;
  text-shadow: 0 2rpx 4rpx rgba(230, 81, 0, 0.2);
}

.aiResultContent {
  margin-top: 12rpx;
}
.huType {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #e65100;
  text-shadow: 0 2rpx 4rpx rgba(230, 81, 0, 0.15);
}
.bestTile {
  display: block;
  font-size: 34rpx;
  font-weight: bold;
  color: #1a472a;
}
.reason {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
  line-height: 1.5;
}
.tingInfo {
  display: block;
  font-size: 26rpx;
  color: #1565c0;
  margin-top: 12rpx;
  font-weight: bold;
  padding: 8rpx 12rpx;
  background: rgba(21, 101, 192, 0.1);
  border-radius: 8rpx;
  display: inline-block;
}
</style>
