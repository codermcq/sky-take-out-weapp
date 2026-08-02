/** 菜品相关接口 */
import { mqRequest } from './index'
import { Dish } from '../types/dish'

/** 按分类查询起售菜品 */
export function getDishList(categoryId: number) {
  return mqRequest.get<Dish[]>({
    url: '/user/dish/list',
    data: { categoryId },
  })
}
