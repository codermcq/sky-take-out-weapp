/** 分类 */
export interface Category {
  id: number
  /** 类型：1 菜品分类，2 套餐分类 */
  type: number
  name: string
  sort: number
  /** 状态：1 起售，0 停售 */
  status: number
  createTime?: string
  updateTime?: string
}
