/**
 * 地区工具：提供省市区查询辅助
 * 注意：地区数据 region.js 位于 packageAddress/data/（分包内），
 * 由 packageAddress 内的组件/页面 require，主包不得直接引用分包资源。
 */

export interface AreaName {
  code: string
  name: string
}

/** 拼接完整地址：省+市+区县+详细地址 */
export function buildFullAddress(addr: {
  provinceName?: string
  cityName?: string
  districtName?: string
  detail?: string
}): string {
  return `${addr.provinceName || ''}${addr.cityName || ''}${addr.districtName || ''}${addr.detail || ''}`
}
