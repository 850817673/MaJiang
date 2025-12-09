// 麻将牌数据和工具函数

// 所有麻将牌定义
// W=万 T=条 B=饼 字牌：E东 S南 X西 N北 Z中 F发 P白
// 花牌：春夏秋冬 梅兰竹菊
export const TILE_TYPES = {
  wan: ['1W', '2W', '3W', '4W', '5W', '6W', '7W', '8W', '9W'],
  tiao: ['1T', '2T', '3T', '4T', '5T', '6T', '7T', '8T', '9T'],
  bing: ['1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B'],
  zi: ['E', 'S', 'X', 'N', 'Z', 'F', 'P'], // 东南西北中发白
  hua: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8'] // 春夏秋冬梅兰竹菊
}

// 牌的中文名
export const TILE_NAMES = {
  '1W': '一万', '2W': '二万', '3W': '三万', '4W': '四万', '5W': '五万',
  '6W': '六万', '7W': '七万', '8W': '八万', '9W': '九万',
  '1T': '一条', '2T': '二条', '3T': '三条', '4T': '四条', '5T': '五条',
  '6T': '六条', '7T': '七条', '8T': '八条', '9T': '九条',
  '1B': '一饼', '2B': '二饼', '3B': '三饼', '4B': '四饼', '5B': '五饼',
  '6B': '六饼', '7B': '七饼', '8B': '八饼', '9B': '九饼',
  'E': '东', 'S': '南', 'X': '西', 'N': '北', 'Z': '中', 'F': '发', 'P': '白',
  'H1': '春', 'H2': '夏', 'H3': '秋', 'H4': '冬', 'H5': '梅', 'H6': '兰', 'H7': '竹', 'H8': '菊'
}

// 初始化剩余牌计数（普通牌4张，花牌1张）
export function initLeftCards(includeHua = true) {
  const left = {}
  ;['wan', 'tiao', 'bing', 'zi'].forEach(type => {
    TILE_TYPES[type].forEach(tile => {
      left[tile] = 4
    })
  })
  // 花牌每种只有1张
  if (includeHua) {
    TILE_TYPES.hua.forEach(tile => {
      left[tile] = 1
    })
  }
  return left
}

// 牌排序（万条饼字花）
export function sortTiles(tiles) {
  const order = [...TILE_TYPES.wan, ...TILE_TYPES.tiao, ...TILE_TYPES.bing, ...TILE_TYPES.zi, ...TILE_TYPES.hua]
  return [...tiles].sort((a, b) => order.indexOf(a) - order.indexOf(b))
}

// 统计手牌中每种牌的数量
export function countTiles(tiles) {
  const count = {}
  tiles.forEach(t => {
    count[t] = (count[t] || 0) + 1
  })
  return count
}

// 获取牌的显示文字
export function getTileDisplay(tile) {
  if (!tile || typeof tile !== 'string') return ''
  if (tile.endsWith('W')) return tile[0]
  if (tile.endsWith('T')) return tile[0]
  if (tile.endsWith('B')) return tile[0]
  return TILE_NAMES[tile] || tile
}

// 获取牌的类型
export function getTileType(tile) {
  if (!tile || typeof tile !== 'string') return 'zi'
  if (tile.endsWith('W')) return 'wan'
  if (tile.endsWith('T')) return 'tiao'
  if (tile.endsWith('B')) return 'bing'
  if (tile.startsWith('H')) return 'hua'
  return 'zi'
}
