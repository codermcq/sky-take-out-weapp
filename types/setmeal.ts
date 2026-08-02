/** 套餐 */
export interface Setmeal {
  id: number
  name: string
  categoryId: number
  /** 价格（元） */
  price: number
  image: string
  description: string
  /** 状态：1 起售，0 停售 */
  status: number
}

/** 套餐内菜品 */
export interface SetmealDish {
  dishId: number
  name: string
  /** 单价（元） */
  price: number
  copies: number
  image?: string
}
