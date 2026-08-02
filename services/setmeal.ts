/** 套餐相关接口 */
import { mqRequest } from './index'
import { Setmeal, SetmealDish } from '../types/setmeal'

/** 按分类查询起售套餐 */
export function getSetmealList(categoryId: number) {
  return mqRequest.get<Setmeal[]>({
    url: '/user/setmeal/list',
    data: { categoryId },
  })
}

/** 查询套餐内菜品 */
export function getSetmealDishList(setmealId: number) {
  return mqRequest.get<SetmealDish[]>({
    url: `/user/setmeal/dish/${setmealId}`,
  })
}
