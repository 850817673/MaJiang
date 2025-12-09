# 麻将最优出牌助手 - AI记忆文档

> 最后更新：2025-12-09
> 用途：帮助AI快速恢复项目上下文

---

## 项目概述

**项目名称**：麻将最优出牌助手
**技术栈**：uni-app (Vue 3) + Vite + DeepSeek API
**目标平台**：H5 / 微信小程序
**项目路径**：`F:\toy\mj`

---

## 核心功能

1. **记牌器** - 显示剩余牌数量，点击记录出牌，实时扣除手牌
2. **手牌管理** - 编辑模式添加手牌，单击打出到已出牌区
3. **金牌设置** - 福州麻将特有，设置百搭牌
4. **AI分析** - 调用DeepSeek分析最优出牌建议，支持胡牌判断
5. **多规则支持** - 福州麻将、四川麻将

---

## 项目结构

```
F:\toy\mj\
├── src/
│   ├── pages/
│   │   ├── index/index.vue      # 首页（规则选择）
│   │   └── game/game.vue        # 游戏页（主界面）
│   ├── components/
│   │   └── MahjongTile/         # 麻将牌组件（支持单击/双击）
│   ├── utils/
│   │   ├── mahjong.js           # 牌数据和工具函数
│   │   ├── deepseek.js          # DeepSeek API封装
│   │   └── rules/
│   │       ├── fuzhou.js        # 福州麻将规则配置
│   │       └── sichuan.js       # 四川麻将规则配置
│   ├── pages.json               # 页面路由配置
│   ├── manifest.json            # uni-app配置
│   └── main.js                  # 入口文件
├── vite.config.js               # Vite配置（含DeepSeek代理）
├── package.json
└── index.html
```

---

## 牌编码规则

| 类型 | 编码 | 示例 |
|------|------|------|
| 万 | 数字+W | 1W, 2W...9W |
| 条 | 数字+T | 1T, 2T...9T |
| 饼 | 数字+B | 1B, 2B...9B |
| 字牌 | 单字母 | E东 S南 X西 N北 Z中 F发 P白 |
| 花牌 | H+数字 | H1春 H2夏 H3秋 H4冬 H5梅 H6兰 H7竹 H8菊 |

---

## 福州麻将规则要点

- **牌组**：只用万、条、饼（字牌花牌不参与牌局，只用于记分）
- **金牌**：百搭牌，可当任意牌使用
- **胡牌**：无吃碰杠时17张胡牌（5组面子+1对将）
- **特殊牌型**：清一色(4番)、对对胡(4番)、金雀(6番)、金龙(6番)、三金倒(8番)

---

## 已完成功能

- [x] 基础项目搭建（uni-app + Vite）
- [x] 麻将牌组件（MahjongTile）- 支持单击/双击（手动实现300ms检测）
- [x] 记牌器界面（万/条/饼）
- [x] 福州麻将排除字牌和花牌
- [x] 已出牌区域（含撤销功能，双击释放回牌池）
- [x] 手牌编辑模式（添加/删除，添加时从牌池扣除）
- [x] 单击手牌打出到已出牌区（非编辑模式）
- [x] 牌池实时显示（扣除手牌和已出牌）
- [x] 禁用已用尽的牌
- [x] 手牌上限17张
- [x] 金牌设置功能（福州麻将特有）
- [x] 设置金牌时牌池数量减1
- [x] DeepSeek API集成
- [x] Vite代理解决CORS问题
- [x] AI分析支持胡牌判断（17张无吃碰杠可胡牌）
- [x] AI建议带规则信息和金牌信息

---

## 操作说明

### 剩余牌区（记牌器）
- 单击：记录别人打出的牌，数量-1，进入已出牌区

### 已出牌区
- 双击：释放回剩余牌池，数量+1

### 手牌区
- **编辑模式**：
  - 点击下方牌面板添加到手牌（同时从牌池扣除）
  - 点击手牌选中，再次点击删除（恢复到牌池）
- **非编辑模式**：
  - 单击手牌打出到已出牌区

### 金牌设置（福州麻将）
- 点击"设置"选择金牌
- 设置后金牌数量从牌池扣除1张
- 更换金牌会恢复旧金牌数量

---

## 关键代码位置

| 功能 | 文件 | 函数/位置 |
|------|------|----------|
| 牌类型定义 | mahjong.js | TILE_TYPES |
| 牌中文名 | mahjong.js | TILE_NAMES |
| 初始化剩余牌 | mahjong.js | initLeftCards() |
| 统计手牌数量 | mahjong.js | countTiles() |
| DeepSeek调用 | deepseek.js | analyzeOptimalDiscard() |
| 规则描述生成 | deepseek.js | buildRuleDesc() |
| 记录出牌 | game.vue | recordPlay() |
| 添加手牌 | game.vue | addToHand() |
| 从手牌移除 | game.vue | removeFromHand() |
| 点击手牌 | game.vue | onHandTileClick() |
| 设置金牌 | game.vue | setGoldTile() |
| 释放已出牌 | game.vue | releasePlayedTile() |
| 牌是否用尽 | game.vue | isTileExhausted() |
| 双击检测 | MahjongTile.vue | handleClick() (300ms内连续点击) |

---

## 运行命令

```bash
# 安装依赖
npm install

# H5开发
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin
```

---

## 重要配置

### DeepSeek API
- 文件：`src/utils/deepseek.js`
- API Key：`sk-941eea4ff883463098e7f685345aed28`
- H5使用代理路径：`/api/deepseek/chat/completions`
- Prompt包含：规则信息、金牌信息、手牌、已出牌、剩余牌
- 返回：canHu(是否胡牌)、huType(牌型)、bestDiscard(推荐出牌)、reason(理由)、ting(听牌)

### Vite代理配置
- 文件：`vite.config.js`
- 代理：`/api/deepseek` → `https://api.deepseek.com`

---

## 用户偏好（QQ）

- 称呼用户为"QQ"
- 每次执行完说"QQ，我已经执行完毕，请下达下一个命令"
- CSS用小驼峰命名（如 `sectionTitle` 而非 `section-title`）
- 代码简洁，注释适当
- 中文回复
- 节省token，不要过多废话

---

## 待完成/已知问题

- [ ] Git推送到远程仓库：`https://github.com/850817673/MaJiang.git`
- [ ] 小程序端测试
- [ ] UI美化优化

---

## 下次继续的任务

1. 完成Git推送
2. 根据用户反馈继续优化
3. 测试胡牌判断功能

---

*此文档由AI生成，用于快速恢复项目上下文*
