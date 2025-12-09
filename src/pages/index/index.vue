<template>
  <!-- 首页：选择麻将规则 -->
  <view class="container">
    <view class="header">
      <text class="title">麻将出牌助手</text>
      <text class="subtitle">选择麻将规则开始游戏</text>
    </view>

    <view class="ruleList">
      <!-- 福州麻将 -->
      <view class="ruleCard" @click="selectRule('fuzhou')">
        <view class="ruleIcon">🀄</view>
        <view class="ruleInfo">
          <text class="ruleName">福州麻将</text>
          <text class="ruleDesc">不能吃牌，只能碰和杠</text>
        </view>
        <view class="arrow">›</view>
      </view>

      <!-- 四川麻将 -->
      <view class="ruleCard" @click="selectRule('sichuan')">
        <view class="ruleIcon">🎴</view>
        <view class="ruleInfo">
          <text class="ruleName">四川麻将</text>
          <text class="ruleDesc">只有万条饼，无字牌</text>
        </view>
        <view class="arrow">›</view>
      </view>
    </view>

    <view class="footer">
      <text class="footerText">AI智能出牌建议</text>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    selectRule(rule) {
      uni.navigateTo({
        url: `/pages/game/game?rule=${rule}`
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding: 40rpx;
  background: linear-gradient(180deg, #2d8c3c 0%, #1a5c28 100%);
}
.header {
  text-align: center;
  padding: 60rpx 0;
}
.title {
  display: block;
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
}
.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255,255,255,0.8);
  margin-top: 16rpx;
}
.ruleList {
  margin-top: 40rpx;
}
.ruleCard {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}
.ruleIcon {
  font-size: 48rpx;
  margin-right: 24rpx;
}
.ruleInfo {
  flex: 1;
}
.ruleName {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.ruleDesc {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
.arrow {
  font-size: 40rpx;
  color: #ccc;
}
.footer {
  text-align: center;
  margin-top: 80rpx;
}
.footerText {
  font-size: 24rpx;
  color: rgba(255,255,255,0.6);
}
</style>
