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

/** 套餐内菜品（对齐后端 DishItemVO：无 dishId/price） */
export interface SetmealDish {
  name: string
  /** 份数 */
  copies: number
  /** 菜品图片 */
  image?: string
  /** 菜品描述 */
  description?: string
}
