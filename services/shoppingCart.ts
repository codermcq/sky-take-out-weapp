/** 购物车相关接口 */
import { mqRequest } from './index'
import { ShoppingCartItem } from '../types/shoppingCart'

/** 查询购物车 */
export function getCartList() {
  return mqRequest.get<ShoppingCartItem[]>({
    url: '/user/shoppingCart/list',
  })
}

/** 添加购物车（有口味时带 dishFlavor） */
export function addCart(data: { dishId?: number; setmealId?: number; dishFlavor?: string; number: number }) {
  return mqRequest.post({
    url: '/user/shoppingCart/add',
    data,
  })
}

/** 减少购物车（按菜品/口味减一条） */
export function subCart(data: { dishId?: number; setmealId?: number; dishFlavor?: string; number?: number }) {
  return mqRequest.post({
    url: '/user/shoppingCart/sub',
    data,
  })
}

/** 清空购物车 */
export function cleanCart() {
  return mqRequest.delete({
    url: '/user/shoppingCart/clean',
  })
}

/** 删除单个购物车条目（后端需支持，契约见 docs/接口契约.md） */
export function deleteCartItem(id: number) {
  return mqRequest.delete({
    url: `/user/shoppingCart/${id}`,
  })
}
