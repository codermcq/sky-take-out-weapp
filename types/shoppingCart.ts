/** 购物车条目（同菜品不同口味为独立行） */
export interface ShoppingCartItem {
  id: number
  name: string
  image: string
  /** 菜品 id（二选一） */
  dishId?: number
  /** 套餐 id（二选一） */
  setmealId?: number
  /** 所选口味，如 微辣 */
  dishFlavor?: string
  /** 数量 */
  number: number
  /** 单价（元） */
  amount: number
  createTime?: string
}
