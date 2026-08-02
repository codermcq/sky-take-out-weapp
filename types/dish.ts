/** 菜品口味 */
export interface DishFlavor {
  id?: number
  dishId?: number
  /** 口味名，如 甜味/忌口/辣度 */
  name: string
  /** 口味选项 */
  value: string
}

/** 菜品（对齐后端 DishVO，口味字段为 flavors） */
export interface Dish {
  id: number
  name: string
  categoryId: number
  /** 价格（元） */
  price: number
  image: string
  description: string
  /** 状态：1 起售，0 停售 */
  status: number
  /** 菜品关联的口味（后端 DishVO.flavors） */
  flavors?: DishFlavor[]
}
