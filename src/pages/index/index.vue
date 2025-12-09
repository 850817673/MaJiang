<template>
  <!-- 首页：选择麻将规则 -->
  <view class="container">
    <!-- 装饰背景 -->
    <view class="bgDecor"></view>

    <view class="header">
      <view class="logoWrap">
        <text class="logoIcon">🀄</text>
      </view>
      <text class="title">麻将出牌助手</text>
      <text class="subtitle">AI智能分析 · 最优出牌建议</text>
    </view>

    <view class="ruleList">
      <!-- 福州麻将 -->
      <view class="ruleCard fuzhou" @click="selectRule('fuzhou')">
        <view class="cardGlow"></view>
        <view class="ruleIcon">🀄</view>
        <view class="ruleInfo">
          <text class="ruleName">福州麻将</text>
          <text class="ruleDesc">有金牌（百搭）· 可吃碰杠</text>
          <view class="ruleTags">
            <text class="tag">金牌</text>
            <text class="tag">17张胡牌</text>
          </view>
        </view>
        <view class="arrow">›</view>
      </view>

      <!-- 四川麻将 -->
      <view class="ruleCard sichuan" @click="selectRule('sichuan')">
        <view class="cardGlow"></view>
        <view class="ruleIcon">🎴</view>
        <view class="ruleInfo">
          <text class="ruleName">四川麻将</text>
          <text class="ruleDesc">血战到底 · 只有万条饼</text>
          <view class="ruleTags">
            <text class="tag">血战</text>
            <text class="tag">缺一门</text>
          </view>
        </view>
        <view class="arrow">›</view>
      </view>
    </view>

    <view class="footer">
      <view class="footerLine"></view>
      <text class="footerText">Powered by DeepSeek AI</text>
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
  background: linear-gradient(135deg, #1a472a 0%, #2d5a3f 30%, #1a472a 70%, #0d2818 100%);
  position: relative;
  overflow: hidden;
}

/* 装饰背景 */
.bgDecor {
  position: absolute;
  top: -100rpx;
  right: -100rpx;
  width: 400rpx;
  height: 400rpx;
  background: radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.header {
  text-align: center;
  padding: 80rpx 0 60rpx;
  position: relative;
}

/* Logo包装 */
.logoWrap {
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto 24rpx;
  background: linear-gradient(145deg, #fffef8 0%, #e8e0d0 100%);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4rpx 0 #c9bda5,
    0 8rpx 0 #bfb299,
    0 12rpx 24rpx rgba(0,0,0,0.3);
}
.logoIcon {
  font-size: 64rpx;
}

.title {
  display: block;
  font-size: 52rpx;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 4rpx 8rpx rgba(0,0,0,0.3);
  letter-spacing: 4rpx;
}

.subtitle {
  display: block;
  font-size: 26rpx;
  color: rgba(255,255,255,0.7);
  margin-top: 16rpx;
  letter-spacing: 2rpx;
}

.ruleList {
  margin-top: 40rpx;
}

/* 规则卡片 */
.ruleCard {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 36rpx;
  margin-bottom: 28rpx;
  display: flex;
  align-items: center;
  box-shadow:
    0 8rpx 24rpx rgba(0,0,0,0.2),
    inset 0 2rpx 0 rgba(255,255,255,0.8);
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
}
.ruleCard:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.15);
}

/* 卡片发光效果 */
.cardGlow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
}
.fuzhou .cardGlow {
  background: linear-gradient(90deg, transparent, #ffc107, transparent);
}
.sichuan .cardGlow {
  background: linear-gradient(90deg, transparent, #e53935, transparent);
}

.ruleIcon {
  font-size: 56rpx;
  margin-right: 28rpx;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 71, 42, 0.08);
  border-radius: 16rpx;
}

.ruleInfo {
  flex: 1;
}

.ruleName {
  display: block;
  font-size: 34rpx;
  font-weight: bold;
  color: #1a472a;
}

.ruleDesc {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
}

/* 标签 */
.ruleTags {
  display: flex;
  gap: 12rpx;
  margin-top: 12rpx;
}
.tag {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  background: rgba(45, 140, 60, 0.1);
  color: #2d8c3c;
}
.sichuan .tag {
  background: rgba(229, 57, 53, 0.1);
  color: #e53935;
}

.arrow {
  font-size: 48rpx;
  color: #ccc;
  font-weight: 300;
}

/* 底部 */
.footer {
  text-align: center;
  margin-top: 60rpx;
  padding-top: 40rpx;
}
.footerLine {
  width: 120rpx;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  margin: 0 auto 20rpx;
}
.footerText {
  font-size: 22rpx;
  color: rgba(255,255,255,0.5);
  letter-spacing: 2rpx;
}
</style>
