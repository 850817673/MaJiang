<template>
  <!-- 麻将牌组件 -->
  <view
    class="tile"
    :class="[tileType, { disabled: disabled, selected: selected, small: size === 'small' }]"
    @click="handleClick"
    @dblclick="handleDblClick"
  >
    <text class="tileText">{{ displayText }}</text>
    <!-- 剩余数量角标 -->
    <view v-if="showCount" class="countBadge">{{ count }}</view>
  </view>
</template>

<script>
import { getTileDisplay, getTileType, TILE_NAMES } from '@/utils/mahjong.js'

export default {
  name: 'MahjongTile',
  props: {
    tile: { type: String, required: true }, // 牌编码如 1W
    count: { type: Number, default: 4 },    // 剩余数量
    showCount: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
    size: { type: String, default: 'normal' } // normal / small
  },
  computed: {
    displayText() {
      return getTileDisplay(this.tile)
    },
    tileType() {
      return getTileType(this.tile)
    }
  },
  emits: ['tileClick', 'tileDblClick'],
  methods: {
    handleClick() {
      if (!this.disabled) {
        this.$emit('tileClick', this.tile)
      }
    },
    handleDblClick() {
      if (!this.disabled) {
        this.$emit('tileDblClick', this.tile)
      }
    }
  }
}
</script>

<style scoped>
.tile {
  width: 44rpx;
  height: 60rpx;
  background: linear-gradient(180deg, #fff 0%, #f0f0f0 100%);
  border: 2rpx solid #ccc;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 1rpx 2rpx 4rpx rgba(0,0,0,0.15);
}
.tile.small {
  width: 36rpx;
  height: 50rpx;
}
.tileText {
  font-size: 28rpx;
  font-weight: bold;
}
.tile.small .tileText {
  font-size: 22rpx;
}
/* 万=红色 条=绿色 饼=蓝色 字=黑色 */
.wan .tileText { color: #c41e3a; }
.tiao .tileText { color: #228b22; }
.bing .tileText { color: #1e90ff; }
.zi .tileText { color: #333; }

.disabled {
  opacity: 0.3;
}
.selected {
  border-color: #2d8c3c;
  background: #e8f5e9;
}
.countBadge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: #ff5722;
  color: #fff;
  font-size: 18rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
