<template>
  <!-- 麻将牌组件 -->
  <view
    class="tile"
    :class="[tileType, { disabled: disabled, selected: selected, small: size === 'small' }]"
    @click="handleClick"
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
  data() {
    return {
      lastClickTime: 0
    }
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
      if (this.disabled) return

      const now = Date.now()
      // 300ms内连续点击视为双击
      if (now - this.lastClickTime < 300) {
        this.$emit('tileDblClick', this.tile)
        this.lastClickTime = 0
      } else {
        this.$emit('tileClick', this.tile)
        this.lastClickTime = now
      }
    }
  }
}
</script>

<style scoped>
/* 麻将牌 - 3D立体效果 */
.tile {
  width: 48rpx;
  height: 64rpx;
  background: linear-gradient(145deg, #fffef8 0%, #f5f0e6 50%, #e8e0d0 100%);
  border: 2rpx solid #d4c8b0;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  /* 3D阴影效果 */
  box-shadow:
    0 2rpx 0 #c9bda5,
    0 4rpx 0 #bfb299,
    0 6rpx 8rpx rgba(0,0,0,0.2),
    inset 0 2rpx 4rpx rgba(255,255,255,0.8);
  transition: all 0.15s ease;
  cursor: pointer;
}
.tile:active {
  transform: translateY(2rpx);
  box-shadow:
    0 1rpx 0 #c9bda5,
    0 2rpx 0 #bfb299,
    0 3rpx 4rpx rgba(0,0,0,0.15),
    inset 0 2rpx 4rpx rgba(255,255,255,0.8);
}
.tile.small {
  width: 40rpx;
  height: 54rpx;
}
.tileText {
  font-size: 30rpx;
  font-weight: bold;
  text-shadow: 1rpx 1rpx 1rpx rgba(255,255,255,0.5);
}
.tile.small .tileText {
  font-size: 24rpx;
}
/* 万=红色 条=绿色 饼=蓝色 字=黑色 */
.wan .tileText { color: #c41e3a; }
.tiao .tileText { color: #1a7a2e; }
.bing .tileText { color: #1565c0; }
.zi .tileText { color: #333; }

/* 禁用态 */
.disabled {
  opacity: 0.35;
  cursor: not-allowed;
  filter: grayscale(0.5);
}
.disabled:active {
  transform: none;
}

/* 选中态 - 高亮发光 */
.selected {
  border-color: #43a047;
  background: linear-gradient(145deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%);
  box-shadow:
    0 2rpx 0 #81c784,
    0 4rpx 0 #66bb6a,
    0 6rpx 12rpx rgba(76,175,80,0.4),
    inset 0 2rpx 4rpx rgba(255,255,255,0.9);
}

/* 数量角标 */
.countBadge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  color: #fff;
  font-size: 18rpx;
  font-weight: bold;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 6rpx rgba(238,90,90,0.5);
  border: 2rpx solid #fff;
}
</style>
