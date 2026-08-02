/** 金额工具：统一用分累加避免浮点，展示时 toFixed(2) */

/** 元 → 分 */
export function yuanToFen(value: number): number {
  return Math.round(value * 100)
}

/** 分 → 元字符串（两位小数） */
export function fenToYuan(fen: number): string {
  return (Math.round(fen) / 100).toFixed(2)
}

/** 元 → 元字符串（两位小数），处理 0.1+0.2 类浮点 */
export function formatMoney(value: number): string {
  return (Math.round(value * 100) / 100).toFixed(2)
}
